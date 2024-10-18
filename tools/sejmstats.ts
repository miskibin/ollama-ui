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
      const field = await selectField(question, model);
      console.debug("Selected field:", field);

      const searchQuery = await generateSearchQuery(question, model);
      console.info("SEJM-STATS", {
        "user prompt": question,
        field: field,
        searchQuery: searchQuery,
      });

      const data = await searchOptimized(searchQuery, field);

      return { question, data };
    },
  ]);
};
