import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { searchOptimized } from "./sejmstats-server";
import { TogetherLLM } from "@/lib/llms/TogetherLLm";
import { PROMPTS } from "@/lib/prompts";
import { Artifact } from "@/lib/types";

const sejmStatsSchema = z.object({
  question: z
    .string()
    .describe("The question to analyze about Sejm statistics"),
});

export const createSejmStatsTool = (model: TogetherLLM) => {
  return new DynamicStructuredTool({
    name: "sejm_stats_analyzer",
    description:
      "Searches and analyzes laws, legal regulations based on user questions. Can provide information, and answer questions about various laws. ",
    schema: sejmStatsSchema,
    func: async ({ question }: z.infer<typeof sejmStatsSchema>) => {
      try {
        const sequence = RunnableSequence.from([
          new RunnablePassthrough(),
          async ({ question }) => {
            let cleanedQuery = question;

            // Generate search query if question is longer than 200 characters
            if (question.length > 100) {
              const query = await PROMPTS.generateSearchQuery.format({
                question: question,
              });
              const searchQuery = await model.invoke(query);
              cleanedQuery = searchQuery
                .replace(/^(Query:|Search query:|Generated query:)/i, "")
                .trim();
            }

            console.info("SEJM-STATS", {
              question,
              searchQuery: cleanedQuery,
            });

            const data = await searchOptimized(cleanedQuery);
            const artifact: Artifact = {
              type: "sejm_stats",
              question,
              searchQuery: cleanedQuery,
              data,
            };

            return {
              result: JSON.stringify(data),
              artifact,
            };
          },
        ]);

        const result = await sequence.invoke({ question });
        return JSON.stringify(result);
      } catch (error) {
        console.error("Error in sejm_stats_analyzer:", error);
        return JSON.stringify({
          result:
            error instanceof Error
              ? `Error analyzing Sejm statistics: ${error.message}`
              : "Error analyzing Sejm statistics: Unknown error",
          artifact: null,
        });
      }
    },
    returnDirect: false,
  });
};
