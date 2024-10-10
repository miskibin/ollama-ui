import { useState, useEffect } from "react";
import { Message, Model } from "@/lib/chat-store";

export const useInitialLoad = () => {
  const [isClient, setIsClient] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) {
      return JSON.parse(savedMessages);
    }
    return [];
  }, []);

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
    isClient,
    models,
    selectedModel,
    setSelectedModel,
    fetchModels,
  };
};
