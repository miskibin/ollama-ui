import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PROMPTS } from "./sejmstats-prompts";
import { TogetherLLM } from "@/lib/TogetherLLm";
import { searchOptimized } from "./sejmstats-server";

const selectField = async (question: string, model: TogetherLLM) => {
  const selectedField = await PROMPTS.selectField
    .pipe(model)
    .pipe(new StringOutputParser())
    .invoke({ question });
  return selectedField.trim().toLowerCase();
};

const generateSearchQuery = async (question: string, model: TogetherLLM) => {
  const searchQuery = await PROMPTS.generateSearchQuery
    .pipe(model)
    .pipe(new StringOutputParser())
    .invoke({ question });
  return searchQuery.trim().replace(/[_*.\s]/g, "");
};

export const createSejmStatsTool = (model: TogetherLLM) => {
  return RunnableSequence.from([
    new RunnablePassthrough(),
    async ({ question }) => {
      console.log("Starting field selection...");
      const field = await selectField(question, model);
      console.log("Selected field:", field);

      console.log("Generating search query...");
      const searchQuery = await generateSearchQuery(question, model);
      console.log("Generated search query:", searchQuery);

      console.log("Sending query to SejmStatsCommunicator...");
      const data = await searchOptimized(searchQuery, field);
      console.log("Received data:", data);

      return { question, data };
    },
  ]);
};
