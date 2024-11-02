import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MarkdownResponse from "@/components/markdownResponse";
import {
  Edit,
  RefreshCw,
  Copy,
  Check,
  X,
  Trash2,
  FileText,
  Download,
  FastForward,
} from "lucide-react";
import { useChatContext } from "@/app/ChatContext";
import { Message } from "@/lib/types";
import { FeedbackDialog } from "@/components/feedback-dialog";
import PluginDataDialog from "./plugin-data-dialog";
import SummarableTextDialog from "./ActSectionDialog";
import { cn } from "@/lib/utils";
import { useFeedbackLogic } from "@/hooks/feedback";
import { ContinuePromptPlaceholder, PROMPTS } from "@/lib/prompts";

interface ChatMessageProps {
  message: Message;
  isLastMessage: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastMessage,
}) => {
  const {
    isLoading,
    editingMessageId,
    setEditingMessageId,
    editMessage,
    regenerateMessage,
    handleSummarize,
    deleteMessage,
    messages,
  } = useChatContext();

  const [editInput, setEditInput] = useState(message.content);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [actUrl, setActUrl] = useState<string | null>(null);
  const isGenerating = isLoading && isLastMessage;

  const {
    isDialogOpen,
    setIsDialogOpen,
    feedbackSent,
    isSubmitting,
    reason,
    setReason,
    handleFeedback,
  } = useFeedbackLogic();

  useEffect(() => {
    const wrappedLinkRegex = /\*\*\[.*?\]\((https?:\/\/[^\s)]+\.pdf)\)\*\*/;
    const regularLinkRegex = /\[.*?\]\((https?:\/\/[^\s)]+\.pdf)\)/;
    const wrappedMatch = message.content.match(wrappedLinkRegex);
    if (wrappedMatch) {
      setActUrl(wrappedMatch[1]);
    } else {
      const regularMatch = message.content.match(regularLinkRegex);
      if (regularMatch) {
        setActUrl(regularMatch[1]);
      } else {
        setActUrl(null);
      }
    }
  }, [message.content]);

  const handleEditStart = () => {
    setEditingMessageId(message.id);
    setEditInput(message.content);
  };

  const handleEditSave = () => {
    editMessage(message.id, editInput);
    setEditingMessageId(null);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditInput(message.content);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  const handleDownloadAndSummarize = async () => {
    if (actUrl) {
      await handleSummarize(actUrl, messages[messages.length - 2].content);
    }
  };

  const renderActSummaryPrompt = () => {
    if (
      !actUrl ||
      !isLastMessage ||
      message.role !== "assistant" ||
      isGenerating ||
      message.content.startsWith("Podsumowanie") // Already summarized
    ) {
      return null;
    }

    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>Czy mam przeanalizować wspomniany akt?</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadAndSummarize}
          className="ml-2 gap-2"
          disabled={isLoading}
        >
          <FastForward className="h-4 w-4" />
          Kontynuuj odpowiedź
        </Button>
      </div>
    );
  };

  const renderMessageButtons = () => {
    if (isGenerating) {
      return null;
    }

    return (
      <div className="flex justify-start mt-2 space-x-2">
        {message.role === "assistant" && (
          <>
            <Button
              onClick={() => regenerateMessage(message.id)}
              size="sm"
              variant="ghost"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={copyToClipboard}
              size="sm"
              variant="ghost"
              className="relative"
            >
              {copiedMessageId === message.id ? (
                <Check className="w-4 h-4 text-green-500 absolute animate-scale-check" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <FeedbackDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              feedbackSent={feedbackSent}
              isSubmitting={isSubmitting}
              reason={reason}
              onReasonChange={setReason}
              onSubmit={handleFeedback}
            />
          </>
        )}
        {message.role === "user" && (
          <>
            <Button
              onClick={() => deleteMessage(message.id)}
              size="sm"
              variant="ghost"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" onClick={handleEditStart} size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    );
  };

  const renderArtifacts = () => {
    if (!message.artifacts?.length || isGenerating) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        <PluginDataDialog artifacts={message.artifacts} />
        <SummarableTextDialog actSections={message.data || []} />
      </div>
    );
  };

  return (
    <div className="relative mt-2 mb-1">
      {message.role === "assistant" && (
        <div className="absolute left-0 top-0">
          <Image
            src="/logo.svg"
            alt="Assistant Avatar"
            width={32}
            height={32}
            className="mt-1"
          />
        </div>
      )}
      <div
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start pl-8"
        }`}
      >
        <div
          className={cn(
            "inline-block py-2 px-3 shadow-md rounded-md",
            message.role === "user" ? "bg-primary/10" : "border-0 shadow-none",
            editingMessageId === message.id ? "w-full" : "max-w-[95%]"
          )}
        >
          {editingMessageId === message.id ? (
            <div className="w-full">
              <Textarea
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                className="w-full mb-2 min-h-[100px] max-h-[300px] resize-vertical"
              />
              <div className="flex justify-end space-x-2">
                <Button onClick={handleEditSave} size="sm" variant="ghost">
                  <Check className="w-4 h-4" />
                </Button>
                <Button onClick={handleEditCancel} size="sm" variant="ghost">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-left">
              {message.content.startsWith("System:") &&
              message.role === "user" ? (
                ContinuePromptPlaceholder
              ) : (
                <MarkdownResponse content={message.content} />
              )}
              {renderArtifacts()}
              {renderActSummaryPrompt()}
              {!isGenerating && renderMessageButtons()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
