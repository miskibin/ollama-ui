import { useChatStore } from "@/lib/store";
import { useState, useEffect } from "react";

export const useInitialLoad = () => {
  const setModels = useChatStore((state) => state.setModels);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/ollama");
      const data = await response.json();
      setModels(data.models);
      if (data.models.length > 0) {
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
