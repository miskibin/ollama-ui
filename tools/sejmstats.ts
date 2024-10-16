import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SejmStatsCommunicator } from "./sejmstats-server";
import { PROMPTS } from "./sejmstats-prompts";
import { TogetherLLM } from "@/lib/TogetherLLm";

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
      const communicator = new SejmStatsCommunicator();
      const data = await communicator.searchOptimized(searchQuery, field);
      console.log("Received data:", data);

      return { question, data };
    },
  ]);
};
