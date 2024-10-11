import { useState, useEffect } from "react";
import { Test } from "@/lib/types";
import { OllamaRequestBody } from "@/app/api/ollama/route";
import { TEST_PROMPT_STRUCTURE } from "@/components/createTestDialog";

export type TestResult = "pass" | "fail" | "error" | undefined;

const STORAGE_KEY = "promptTests";

export const useTestLogic = () => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>();
  const [promptTests, setPromptTests] = useState<Test[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedTests = localStorage.getItem(STORAGE_KEY);
    if (storedTests) {
      setPromptTests(JSON.parse(storedTests));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(promptTests));
    }
  }, [promptTests, isClient]);

  const runTest = async (
    test: Test,
    userPrompt: string,
    lastModelResponse: string
  ) => {
    setIsRunningTest(true);
    setTestResult(undefined);

    const requestBody: OllamaRequestBody = {
      model: test.model,
      prompt: TEST_PROMPT_STRUCTURE.replace("{userPrompt}", userPrompt)
        .replace("{modelResponse}", lastModelResponse)
        .replace("{condition}", test.condition),
      system: test.systemPrompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.95,
        top_k: 2,
        repeat_penalty: 1.1,
        seed: 42,
      },
    };

    try {
      const response = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to run test");
      }

      const data = await response.json();
      const result = data.response.trim().toLowerCase().replace(/\./g, "");
      if (["no", "false"].includes(result)) {
        setTestResult("fail");
      } else if (["yes", "true"].includes(result)) {
        setTestResult("pass");
      } else {
        console.error("Invalid test result:", result);
        setTestResult("error");
      }
    } catch (error) {
      console.error("Error running test:", error);
      setTestResult("error");
    } finally {
      setIsRunningTest(false);
      // Update test result
      updateTest(test.id, { result: testResult });
    }
  };

  const addTest = (test: Test) => {
    setPromptTests((prevTests) => [...prevTests, test]);
  };

  const removeTest = (id: string) => {
    setPromptTests((prevTests) => prevTests.filter((test) => test.id !== id));
  };

  const updateTest = (id: string, updates: Partial<Test>) => {
    setPromptTests((prevTests) =>
      prevTests.map((test) => (test.id === id ? { ...test, ...updates } : test))
    );
  };

  return {
    promptTests,
    setPromptTests,
    isRunningTest,
    testResult,
    addTest,
    removeTest,
    updateTest,
    runTest,
  };
};