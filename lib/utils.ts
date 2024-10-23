import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { easterEggMapping } from "./easter-eggs";
import {
  AIMessage,
  HumanMessage,
  ToolMessage,
  ChatMessage,
} from "@langchain/core/messages";
import { Message } from "./types";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function checkEasterEggs(input: string) {
  for (const egg of easterEggMapping) {
    if (egg.regex.test(input)) {
      return egg.photo;
    }
  }
  return null;
}

export function convertRPMessageToLangChainMessage(message: Message) {
  if (message.role === "user") {
    return new HumanMessage(message.content) as ChatMessage;
  } else if (message.role === "assistant") {
    return new AIMessage(message.content) as ChatMessage;
  }
  return new ChatMessage(message.content, message.role) as ChatMessage;
}

export function convertLangChainMessageToRPMessage(message: ChatMessage) {
  if (message.getType() === "human") {
    return { content: message.content, role: "user" };
  } else if (message.getType() === "ai") {
    return {
      content: message.content,
      role: "assistant",
      tool_calls: (message as AIMessage).tool_calls,
    };
  } else {
    return { content: message.content, role: message.getType() };
  }
}
