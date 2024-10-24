import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/lib/types";
import {
  UseFeedbackLogicProps,
  UseFeedbackLogicReturn,
} from "@/app/types/feedback";
import { trimMessage } from "@/app/utils/feedback";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useChatStore } from "@/lib/store";

export function useFeedbackLogic(): UseFeedbackLogicReturn {
  const { messages } = useChatStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  console.log(messages.slice(-3).map(trimMessage));

  const handleFeedback = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (feedbackSent || isSubmitting || !user?.id) {
      console.log(
        "Feedback already sent or submitting or user not logged in",
        feedbackSent,
        isSubmitting,
        user?.id
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const lastMessages = messages.slice(-3).map(trimMessage);

      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        reason: reason.trim() || null,
        context: lastMessages,
      });

      if (!error) {
        setFeedbackSent(true);
        setIsDialogOpen(false);
        toast({
          title: "Dziękuje za informację zwrotną! 🚀",
          description: "Twoja opinia pomoże mi ulepszyć asystenta.",
          duration: 3000,
        });
      } else {
        throw error;
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast({
        title: "Błąd",
        description:
          "Nie udało się wysłać feedbacku. Spróbuj ponownie później.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    feedbackSent,
    isSubmitting,
    reason,
    setReason,
    handleFeedback,
  };
}
