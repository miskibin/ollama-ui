import { useState, useEffect } from "react";
import { ChatOllama } from "@langchain/ollama";
import { createWikipediaSearchChain } from "@/tools/is-wikipedia-relevant";
// Import other tool chains as needed

export const useToolChains = () => {
  const [toolChains, setToolChains] = useState<Record<string, any>>({});

  const initializeToolChains = (model: ChatOllama) => {
    setToolChains({
      wikipedia: createWikipediaSearchChain(model),
      // Add other tool chains here
    });
  };

  return { toolChains, initializeToolChains };
};
