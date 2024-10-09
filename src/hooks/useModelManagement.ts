import { Model } from "@/lib/chat-store";
import { useState, useEffect } from "react";

export const useModelManagement = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");

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

  return { models, selectedModel, setSelectedModel, fetchModels };
};
