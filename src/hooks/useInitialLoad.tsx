import { useChatStore } from "@/lib/store";
import { useState, useEffect } from "react";

export const useInitialLoad = () => {
  const setModels = useChatStore((state) => state.setModels);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);
  const selectedModel = useChatStore((state) => state.selectedModel);

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/ollama");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setModels(data.models);
      if (data.models.length > 0 && !selectedModel) {
        setSelectedModel(data.models[0].name);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return {
    fetchModels,
  };
};
