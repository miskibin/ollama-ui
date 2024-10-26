import { Message } from "@/lib/types";

export function trimMessage(message: Message): Message {
  return {
    id: message.id,
    role: message.role,
    content: message.content?.slice(0, 300) ?? "",
    artifacts:
      message.artifacts?.map((artifact) => ({
        type: artifact.type,
        question: artifact.question,
        searchQuery: artifact.searchQuery,
        data: artifact.data,
      })) ?? [],
  };
}
