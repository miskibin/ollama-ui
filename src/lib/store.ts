import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatOptions, Message, Model, ChatPlugin } from "./types";

interface ChatState {
  messages: Message[];
  models: Model[];
  selectedModel: string;
  options: ChatOptions;
  systemPrompt: string;
  input: string;
  plugins: ChatPlugin[];
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
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
      plugins: [
        {
          name: "Wikipedia",
          relevancePrompt:
            "Determine if the following question requires a Wikipedia search. Respond with only 'Yes' or 'No'.\n\nQuestion: {question}\nAnswer:",
          enabled: true,
        },
        {
          name: "Python",
          relevancePrompt: `Determine if the following question requires Python code execution. Answer 'Yes' or 'No' only.
          
          Consider:
          1. Calculations or data manipulation
          2. Python explicitly mentioned
          3. Complex operations (beyond basic math)
          4. Data structures (lists, dictionaries, etc.)
          5. String manipulation or pattern matching
          6. Iteration or looping
          7. Use of Python libraries
          8. Code generation or debugging
          
          Question: {question}
          Answer:`,
          enabled: true,
        },
      ],
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content } : msg
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
