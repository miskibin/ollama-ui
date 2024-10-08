import { useState } from "react";
import { Test, Message } from "@/lib/chat-store";
import { OllamaRequestBody } from "@/app/api/ollama/route";

export type TestResult = "true" | "false" | "invalid" | "error";

export const useTestLogic = () => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const runTest = async (test: Test, lastModelResponse: string) => {
    setIsRunningTest(true);
    setTestResult(null);

    const requestBody: OllamaRequestBody = {
      model: test.model,
      prompt: `${test.condition}\n\nText: ${lastModelResponse}`,
      system: test.systemPrompt,
      stream: false,
      options: {
        temperature: 0, // Use temperature 0 for deterministic output
        top_p: 1,
        top_k: 1,
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
        setTestResult("false");
      } else if (["yes", "true"].includes(result)) {
        setTestResult("true");
      } else {
        console.error("Invalid test result:", result);
        setTestResult(`invalid`);
      }
    } catch (error) {
      console.error("Error running test:", error);
      setTestResult("error");
    } finally {
      setIsRunningTest(false);
    }
  };

  const addTest = async (test: Omit<Test, "id">, messages: Message[]) => {
    const lastModelResponse =
      messages
        .slice()
        .reverse()
        .find((message) => message.role === "assistant")?.content || "";

    const newTest: Test = {
      ...test,
      id: Date.now().toString(),
    };

    await runTest(newTest, lastModelResponse);

    return newTest;
  };

  return {
    isRunningTest,
    testResult,
    runTest,
  };
};
