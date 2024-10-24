import { Message } from "@/lib/types";

export interface FeedbackPayload {
  messageId: string;
  user: string;
  reason?: string;
  context: Message[];
}

export interface UseFeedbackLogicProps {
  messages: Message[];
}

export interface UseFeedbackLogicReturn {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  feedbackSent: boolean;
  isSubmitting: boolean;
  reason: string;
  setReason: (reason: string) => void;
  handleFeedback: () => Promise<void>;
}
