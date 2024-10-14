import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatOptions, Message, Model, ChatPlugin } from "./types";
import { plugins } from "./plugins";

interface ChatState {
  messages: Message[];
  models: Model[];
  selectedModel: string;
  options: ChatOptions;
  systemPrompt: string;
  input: string;
  plugins: ChatPlugin[];
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string, pluginData?: string) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
  setModels: (models: Model[]) => void;
  setSelectedModel: (model: string) => void;
  setOptions: (options: Partial<ChatOptions>) => void;
  setSystemPrompt: (prompt: string) => void;
  setInput: (input: string) => void;
  setPlugins: (plugins: ChatPlugin[]) => void;
  togglePlugin: (name: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      models: [],
      selectedModel: "",
      options: {
        temperature: 0.3,
        topP: 0.8,
        streaming: true,
        topK: 40,
        repeatPenalty: 1.1,
        num_predict: 4096,
      },
      systemPrompt: "",
      input: "",
      plugins: plugins,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, content, pluginData?) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id
          ? {
                  ...msg,
                  content,
                  ...(pluginData && { pluginData }),
                }
              : msg
          ),
        })),
      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        })),
      clearMessages: () => set({ messages: [] }),
      setModels: (models) => set({ models }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setOptions: (newOptions) =>
        set((state) => ({ options: { ...state.options, ...newOptions } })),
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      setInput: (input) => set({ input }),
      setPlugins: (plugins) => set({ plugins }),
      togglePlugin: (name) =>
        set((state) => ({
          plugins: state.plugins.map((plugin) =>
            plugin.name === name
              ? { ...plugin, enabled: !plugin.enabled }
              : plugin
          ),
        })),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        messages: state.messages,
        options: state.options,
        selectedModel: state.selectedModel,
        models: state.models,
        systemPrompt: state.systemPrompt,
        input: state.input,
      }),
    }
  )
);
