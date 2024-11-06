import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getPatrons } from "./get-patronite-users";

type LimitType = "chat_submission" | "paid_model_usage";

export const useMessageLimits = (selectedModel: string) => {
  const supabase = createClientComponentClient();

  const LIMITS = {
    PATRON_TOTAL_LIMIT: 40,
    FREE_GPT_LIMIT: 5,
    FREE_TOTAL_LIMIT: 5,
  };

  const LIMIT_TYPES: { [key: string]: LimitType } = {
    TOTAL: "chat_submission",
    PAID_MODEL: "paid_model_usage",
  };

  const checkIsPatron = async (userEmail: string): Promise<boolean> => {
    try {
      const patronEmails = await getPatrons();
      return patronEmails.includes(userEmail);
    } catch {
      return false;
    }
  };

  const checkMessageLimits = async (
    isGptModel: boolean
  ): Promise<{
    canSendMessage: boolean;
    shouldSwitchModel: boolean;
    message?: string;
  }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return {
        canSendMessage: false,
        shouldSwitchModel: false,
        message: "User not authenticated",
      };
    }

    const isPatron = await checkIsPatron(user.email);
    const totalLimit = isPatron
      ? LIMITS.PATRON_TOTAL_LIMIT
      : LIMITS.FREE_TOTAL_LIMIT;

    // Check total messages
    const { data: totalCount } = await supabase.rpc(
      "count_and_increment_limit",
      {
        p_user_id: user.id,
        p_limit_type: LIMIT_TYPES.TOTAL,
      }
    );
    console.log("Total count", totalCount);
    if (totalCount > totalLimit) {
      return {
        canSendMessage: false,
        shouldSwitchModel: false,
        message: isPatron
          ? `Osiągnięto dzienny limit ${totalLimit} wiadomości. Spróbuj ponownie jutro.`
          : `Osiągnięto dzienny limit ${totalLimit} wiadomości. Zostań patronem, aby uzyskać więcej możliwości.`,
      };
    }

    // For non-patrons using paid models
    if (!isPatron && isGptModel) {
      const { data: paidModelCount } = await supabase.rpc(
        "get_daily_limit_count",
        {
          p_user_id: user.id,
          p_limit_type: LIMIT_TYPES.PAID_MODEL,
        }
      );

      if (
        paidModelCount >= LIMITS.FREE_GPT_LIMIT &&
        !selectedModel.toLowerCase().includes("free")
      ) {
        console.log("Switching model", selectedModel);
        return {
          canSendMessage: true,
          shouldSwitchModel: true,
          message: `Wykorzystano limit ${LIMITS.FREE_GPT_LIMIT} wiadomości do zaawansowanych modeli. Przełączam model.`,
        };
      }

      await supabase.rpc("count_and_increment_limit", {
        p_user_id: user.id,
        p_limit_type: LIMIT_TYPES.PAID_MODEL,
      });
    }

    return {
      canSendMessage: true,
      shouldSwitchModel: false,
    };
  };

  const getUsageStats = async (): Promise<{
    totalUsed: number;
    gptUsed: number;
    totalLimit: number;
    gptLimit: number;
    isPatron: boolean;
  } | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return null;

    const isPatron = await checkIsPatron(user.email);
    const [{ data: totalCount }, { data: paidModelCount }] = await Promise.all([
      supabase.rpc("get_daily_limit_count", {
        p_user_id: user.id,
        p_limit_type: LIMIT_TYPES.TOTAL,
      }),
      supabase.rpc("get_daily_limit_count", {
        p_user_id: user.id,
        p_limit_type: LIMIT_TYPES.PAID_MODEL,
      }),
    ]);

    return {
      totalUsed: totalCount || 0,
      gptUsed: !isPatron ? paidModelCount || 0 : 0,
      totalLimit: isPatron
        ? LIMITS.PATRON_TOTAL_LIMIT
        : LIMITS.FREE_TOTAL_LIMIT,
      gptLimit: LIMITS.FREE_GPT_LIMIT,
      isPatron,
    };
  };

  return {
    checkMessageLimits,
    getUsageStats,
    LIMITS,
  };
};
