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
  promptStatus: string;
  pluginData: string;
  setPluginData: (data: string) => void;
  setPromptStatus: (status: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (
    id: string,
    content: string,
    plugins?: string[],
    pluginData?: string
  ) => void;
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
        temperature: 0.7,
        topP: 0.9,
        streaming: true,
        topK: 40,
        repeatPenalty: 1.1,
        num_predict: 4096,
      },
      systemPrompt: "",
      input: "",
      plugins: plugins,
      promptStatus: "",
      pluginData: "",
      setPluginData: (data) => set({ pluginData: data }),
      setPromptStatus: (status) => set({ promptStatus: status }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, content, plugins?, pluginData?) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id
              ? {
                  ...msg,
                  content,
                  ...(plugins && { plugins }),
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