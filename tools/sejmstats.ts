import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { searchOptimized } from "./sejmstats-server";
import { TogetherLLM } from "@/lib/TogetherLLm";
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
      "Analyzes statistics and data about the Polish Sejm and Polish Law, and all politics based on natural language questions",
    schema: sejmStatsSchema,
    func: async ({ question }: z.infer<typeof sejmStatsSchema>) => {
      try {
        const sequence = RunnableSequence.from([
          new RunnablePassthrough(),
          async ({ question }) => {
            const query = await PROMPTS.generateSearchQuery.format({
              question: question,
            });
            const searchQuery = await model.invoke(query);
            const cleanedQuery = searchQuery
              .replace(/^(Query:|Search query:|Generated query:)/i, "")
              .trim();

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
