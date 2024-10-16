"use client";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { searchWikipedia } from "./wikipedia-search";
import { TogetherAI } from "@langchain/community/llms/togetherai";

const extractSearchTopic = async (input: string, model: TogetherAI) => {
  console.log("Extracting search topic from input:", input);
  const prompt = PromptTemplate.fromTemplate(
    "Extract the main topic or keyword for a Wikipedia search from the following question. Provide only the topic, without any additional text.\n\nQuestion: {question}\nTopic:"
  );

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const topic = await chain.invoke({ question: input });
  console.log("Extracted search topic:", topic);
  return topic;
};

const processWikipediaResult = async (
  result: string,
  question: string,
  model: TogetherAI
) => {
  console.log("Processing Wikipedia result");
  const prompt = PromptTemplate.fromTemplate(
    "Summarize and format the following Wikipedia information to answer the given question. Make sure the response is concise, relevant, and well-structured.\n\nQuestion: {question}\n\nWikipedia Information: {result}\n\nFormatted Answer:"
  );

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const processedResult = await chain.invoke({ question, result });
  console.log("Processed Wikipedia result:", processedResult);
  return processedResult;
};

export const createWikipediaSearchChain = (
  model: TogetherAI,
  updateMessage: (id: string, content: string, pluginData?: string) => void
) => {
  return RunnableSequence.from([
    new RunnablePassthrough(),
    async ({ question, newMessageId }) => {
      updateMessage(newMessageId, "Extracting search topic...");
      const searchTopic = await extractSearchTopic(question, model);
      console.log("Extracted search topic:", searchTopic);

      updateMessage(
        newMessageId,
        `Search topic: ${searchTopic}. Searching Wikipedia...`
      );
      const result = await searchWikipedia(searchTopic);
      console.log("Wikipedia search result:", result);

      updateMessage(newMessageId, "Processing Wikipedia result...");
      const processedResult = await processWikipediaResult(
        result,
        question,
        model
      );

      updateMessage(newMessageId, result);

      return processedResult;
    },
    new StringOutputParser(),
  ]);
};
