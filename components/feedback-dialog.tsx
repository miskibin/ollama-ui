import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  feedbackSent: boolean;
  isSubmitting: boolean;
  reason: string;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
}

export function FeedbackDialog({
  isOpen,
  onOpenChange,
  feedbackSent,
  isSubmitting,
  reason,
  onReasonChange,
  onSubmit,
}: FeedbackDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative hover:bg-muted/50",
            feedbackSent && "text-destructive hover:text-destructive/90"
          )}
          disabled={feedbackSent}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold">
            Zgłoś błędną odpowiedź
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Opisz co było nie tak z odpowiedzią asystenta
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Opcjonalnie opisz problem..."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="min-h-[120px] resize-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Anuluj
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Wysyłanie...
              </span>
            ) : (
              "Wyślij"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
