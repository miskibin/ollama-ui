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
          className={cn("relative", feedbackSent && "text-red-500")}
          disabled={feedbackSent}
        >
          <ThumbsDown className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zgłoś błędną odpowiedź</DialogTitle>
          <DialogDescription>
            Opisz co było nie tak z odpowiedzią asystenta
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Opcjonalnie opisz problem..."
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="min-h-[100px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            Wyślij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
