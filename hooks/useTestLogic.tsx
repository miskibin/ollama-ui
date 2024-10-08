import { useState } from "react";
import { Test, Message } from "@/lib/chat-store";
import { OllamaRequestBody } from "@/app/api/ollama/route";

export type TestResult = "pass" | "fail" | "error" | undefined;

export const useTestLogic = () => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>();
  const [promptTests, setPromptTests] = useState<Test[]>([]);
  const runTest = async (test: Test, lastModelResponse: string) => {
    setIsRunningTest(true);
    setTestResult(undefined);

    const requestBody: OllamaRequestBody = {
      model: test.model,
      prompt: `Text: ${lastModelResponse}\n\n${test.condition}`,
      system: test.systemPrompt,
      stream: false,
      options: {
        temperature: 0.5, // Use temperature 0 for deterministic output
        seed: 42,
        repeat_penalty: 1,
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
      const result = data.response.trim().toLowerCase();
      if (["no", "false"].includes(result)) {
        setTestResult("fail");
      } else if (["yes", "true"].includes(result)) {
        setTestResult("pass");
      } else {
        console.error("Invalid test result:", result);
        setTestResult(`error`);
      }
    } catch (error) {
      console.error("Error running test:", error);
      setTestResult("error");
    } finally {
      setIsRunningTest(false);
      // set test.result
      test.result = testResult;
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
