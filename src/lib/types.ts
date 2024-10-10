import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Model = {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string | null;
    parameter_size: string;
    quantization_level: string;
  };
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
