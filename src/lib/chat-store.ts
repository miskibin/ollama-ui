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
  seed: number | null;
  topK: number;
  repeatPenalty: number;
  num_ctx?: number;
};

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

export type ChatState = {
  isPdfParsing: boolean;
  input: string;
  messages: Message[];
  isLoading: boolean;
  models: Model[];
  selectedModel: string;
  customSystem: string;
  responseMetadata: ResponseMetadata | null;
  editingMessageId: string | null;
  options: ChatOptions;
  setIsPdfParsing: (isPdfParsing: boolean) => void;
  setInput: (input: string) => void;
  setMessages: (messages: Message[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setModels: (models: Model[]) => void;
  setSelectedModel: (selectedModel: string) => void;
  setCustomSystem: (customSystem: string) => void;
  setResponseMetadata: (responseMetadata: ResponseMetadata | null) => void;
  setEditingMessageId: (editingMessageId: string | null) => void;
  setOptions: (options: Partial<ChatOptions>) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isPdfParsing: false,
      input: "",
      messages: [],
      isLoading: false,
      models: [],
      selectedModel: "",
      customSystem: "",
      responseMetadata: null,
      editingMessageId: null,
      options: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        repeatPenalty: 1.1,
        seed: null,
        stream: true,
      },
      setIsPdfParsing: (isPdfParsing) => set({ isPdfParsing }),
      setInput: (input) => set({ input }),
      setMessages: (messages) => set({ messages }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setModels: (models) => set({ models }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setCustomSystem: (customSystem) => set({ customSystem }),
      setResponseMetadata: (responseMetadata) => set({ responseMetadata }),
      setEditingMessageId: (editingMessageId) => set({ editingMessageId }),
      setOptions: (newOptions) =>
        set((state) => ({ options: { ...state.options, ...newOptions } })),
    }),
    {
      name: "chat-storage",
    }
  )
);
