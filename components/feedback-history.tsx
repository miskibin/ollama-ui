import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsDown, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface FeedbackItem {
  id: string;
  reason: string | null;
  context: any[];
  created_at: string;
}

export function FeedbackHistory() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const { data: feedbackData, error } = await supabase
          .from("feedback")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setFeedbacks(feedbackData || []);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        Nie zgłoszono jeszcze żadnych uwag do odpowiedzi asystenta.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <Card
          key={feedback.id}
          className="bg-muted/50 hover:bg-muted/80 transition-colors"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="bg-background rounded-full p-2 shadow-sm">
                <ThumbsDown className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    {feedback.reason ? (
                      <p className="font-medium text-sm text-foreground">
                        {feedback.reason}
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">
                        Nie podano powodu
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(feedback.created_at), {
                        addSuffix: true,
                        locale: pl,
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {feedback.context.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "text-sm p-2 rounded-md border shadow-sm",
                        msg.role === "assistant"
                          ? "bg-background text-foreground"
                          : "bg-primary/10 text-foreground"
                      )}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {msg.role === "assistant" ? "Asystent" : "Użytkownik"}:
                      </p>
                      <p className="line-clamp-2">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
