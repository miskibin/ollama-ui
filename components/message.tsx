import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MarkdownResponse from "@/components/markdownResponse";
import PluginDataDialog from "./plugin-data-dialog";
import SummarableTextDialog from "./SummarableTextDialog";
import { Edit, RefreshCw, Copy, Check, X, Trash2 } from "lucide-react";
import { useChatContext } from "@/app/ChatContext";
import { Message } from "@/lib/types";

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
    deleteMessage,
    handleSummarize,
  } = useChatContext();

  const [editInput, setEditInput] = useState(message.content);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Update the condition for when a message is being generated
  const isGenerating = isLoading && isLastMessage;

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

  const renderMessageButtons = () => {
    if (isGenerating) {
      return null;
    }

    return (
      <div className="flex justify-start mt-2 space-x-2">
        <Button variant="ghost" onClick={handleEditStart} size="sm">
          <Edit className="w-4 h-4" />
        </Button>
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
          </>
        )}
        <Button
          onClick={() => deleteMessage(message.id)}
          size="sm"
          variant="ghost"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div
      className={`mt-2 mb-1 flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.role === "assistant" && (
        <Image
          src="/logo.svg"
          alt="Assistant Avatar"
          width={24}
          height={24}
          className="mr-1 mt-1"
        />
      )}
      <div
        className={`inline-block py-2 px-3 shadow-md rounded-md ${
          message.role === "user" ? "bg-primary/10" : "border-0 shadow-none"
        } ${editingMessageId === message.id ? "w-full" : "max-w-[95%]"}`}
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
            <MarkdownResponse content={message.content} />
            {message.pluginData && !isGenerating && (
              <div className="flex justify-start mt-2 space-x-2">
                <PluginDataDialog pluginData={message.pluginData} />
                <SummarableTextDialog
                  onSummarize={(item) => handleSummarize(item.url)}
                  message={message}
                />
              </div>
            )}
            {!isGenerating && renderMessageButtons()}
          </div>
        )}
      </div>
    </div>
  );
};
