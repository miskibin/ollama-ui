import { ToolCall } from "@langchain/core/messages/tool";
export type Message = {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
};

export type Model = {
  name: string;
  description: string;
};

export type SummarableText = {
  title: string;
  url: string;
};

export type ChatOptions = {
  temperature: number;
  topP: number;
  seed?: number;
  topK: number;
  streaming: boolean;
  repeatPenalty: number;
  num_predict?: number;
};
export interface ChatPlugin {
  name: string;
  relevancePrompt: string;
  enabled: boolean;
}

export interface Test {
  id: string;
  systemPrompt: string;
  condition: string;
  enabled: boolean;
  model: string;
  result?: "pass" | "fail" | "error";
}
export type ResponseMetadata = {
  load_duration?: number;
  total_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
};
