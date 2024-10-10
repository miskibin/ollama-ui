import { ChatOllama } from "@langchain/ollama";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { executePythonCode } from "./python-server";

const extractPythonCode = async (input: string, model: ChatOllama) => {
  console.log("Extracting Python code from input:", input);
  const prompt = PromptTemplate.fromTemplate(
    "Extract or generate Python code to perform the following task. Provide only the Python code, without any additional text or explanations.\n\nTask: {task}\nPython Code:"
  );

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const code = await chain.invoke({ task: input });
  console.log("Extracted Python code:", code);
  return code;
};

const processPythonResult = async (
  result: string,
  task: string,
  model: ChatOllama
) => {
  console.log("Processing Python execution result");
  const prompt = PromptTemplate.fromTemplate(
    "Summarize and format the following Python execution result to answer the given task. Make sure the response is concise, relevant, and well-structured.\n\nTask: {task}\n\nExecution Result: {result}\n\nFormatted Answer:"
  );

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const processedResult = await chain.invoke({ task, result });
  console.log("Processed Python result:", processedResult);
  return processedResult;
};

export const createPythonExecutionChain = (model: ChatOllama) => {
  return RunnableSequence.from([
    {
      original_input: new RunnablePassthrough(),
      python_code: (input) => extractPythonCode(input, model),
    },
    async (input) => {
      console.log("Executing Python code:", input.python_code);
      const result = await executePythonCode(input.python_code);
      console.log("Python execution result:", result);

      // Process the Python execution result
      const processedResult = await processPythonResult(
        result,
        input.original_input,
        model
      );
      return `Here's the result of the Python execution: ${processedResult}`;
    },
    new StringOutputParser(),
  ]);
};
