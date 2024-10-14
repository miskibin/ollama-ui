"use client";
import { ChatOllama } from "@langchain/ollama";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { searchWikipedia } from "./wikipedia-search";

const extractSearchTopic = async (input: string, model: ChatOllama) => {
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
  model: ChatOllama
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
  model: ChatOllama,
  updateMessage: (id: string, content: string, pluginData?: string) => void
) => {
  return RunnableSequence.from([
    {
      original_input: new RunnablePassthrough(),
      search_topic: (input) => extractSearchTopic(input, model),
    },
    async (input) => {
      console.log("Searching Wikipedia for topic:", input.search_topic);
      const result = await searchWikipedia(input.search_topic);
      console.log("Wikipedia search result:", result);
      // Process the Wikipedia result
      updateMessage(input.original_input, "", "Processing Wikipedia result...");
      const processedResult = await processWikipediaResult(
        result,
        input.original_input,
        model
      );
      return `Here's what I found from Wikipedia: ${processedResult}`;
    },
    new StringOutputParser(),
  ]);
};
