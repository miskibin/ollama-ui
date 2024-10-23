import React, { ReactNode } from "react";
import { TogetherLLM } from "./TogetherLLm";

export type Message = {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  artifacts: Artifact[];
};

export interface Artifact {
  type: string;
  question: string;
  searchQuery: string;
  data: any;
}
export type Model = {
  name: string;
  description: string;
};

export type SummarableText = {
  title: string;
  url: string;
};

export type ChatPlugin = {
  enabled: boolean;
  name: string;
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
