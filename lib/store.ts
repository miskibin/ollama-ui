import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ChatOptions,
  Message,
  Model,
  ChatPlugin,
  SummarableText,
} from "./types";
import { plugins } from "./plugins";
import { BufferMemory, MemoryVariables } from "langchain/memory";

interface ChatState {
  messages: Message[];
  options: ChatOptions;
  systemPrompt: string;
  input: string;
  plugins: ChatPlugin[];
  memory: BufferMemory;
  patrons: string[];
  models: Model[];
  selectedModel: string;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string, pluginData?: string) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
  setOptions: (options: Partial<ChatOptions>) => void;
  setSystemPrompt: (prompt: string) => void;
  setInput: (input: string) => void;
  setPlugins: (plugins: ChatPlugin[]) => void;
  togglePlugin: (name: string) => void;
  getMemoryVariables: () => Promise<MemoryVariables>;
  addToMemory: (humanMessage: string, aiMessage: string) => Promise<void>;
  clearMemory: () => void;
  setPatrons: (patrons: string[]) => void;
  setModels: (models: Model[]) => void;
  setSelectedModel: (model: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      options: {
        temperature: 0.3,
        topP: 0.8,
        streaming: true,
        topK: 40,
        repeatPenalty: 1.1,
        num_predict: 4096,
      },
      systemPrompt: "You are a specialized keyword extractor for Polish legislative topics.",
      input: "",
      plugins: plugins,
      memory: new BufferMemory({
        returnMessages: true,
        memoryKey: "history",
        inputKey: "input",
        outputKey: "output",
      }),
      patrons: [],
      models: [
        {
          name: "meta-llama/Llama-Vision-Free",
          description: "Prymitywny",
        },
        {
          name: "meta-llama/Meta-Llama-3-70B-Instruct-Lite",
          description: "Zaawansowany", // 54
        },
        {
          name: "google/gemma-2-27b-it",
          description: "Zaawansowany", // 80
        },
        {
          name: "google/gemma-2-9b-it",
          description: "Kompaktowy", // 30
        },
      ],
      selectedModel: "meta-llama/Llama-Vision-Free",
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
      clearMessages: () => {
        set({ messages: [] });
        get().clearMemory();
      },
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
      getMemoryVariables: async () => {
        const memoryVariables = await get().memory.loadMemoryVariables({});
        return memoryVariables;
      },
      addToMemory: async (humanMessage: string, aiMessage: string) => {
        await get().memory.saveContext(
          { input: humanMessage },
          { output: aiMessage }
        );
      },
      clearMemory: () => {
        set({
          memory: new BufferMemory({
            returnMessages: true,
            inputKey: "input",
            outputKey: "output",
          }),
        });
      },
      setPatrons: (patrons) => set({ patrons }),
      setModels: (models) => set({ models }),
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        messages: state.messages,
        options: state.options,
        systemPrompt: state.systemPrompt,
        selectedModel: state.selectedModel,
      }),
    }
  )
);
