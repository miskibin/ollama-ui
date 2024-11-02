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
      "Searches and analyzes laws, legal regulations based on user questions. Can provide information, and answer questions about various laws.",
    schema: sejmStatsSchema,
    func: async ({ question }: z.infer<typeof sejmStatsSchema>) => {
      try {
        const sequence = RunnableSequence.from([
          new RunnablePassthrough(),
          async ({ question }) => {
            let cleanedQuery = question;
            if (question.length > 10) {
              const query = await PROMPTS.generateSearchQuery.format({
                question: question,
              });
              const searchQuery = await model.invoke(query);
              cleanedQuery = searchQuery
                .replace(/^(Query:|Search query:|Generated query:)/i, "")
                .trim();
            }
            const searchResults = await searchOptimized(cleanedQuery);
            const artifact: Artifact = {
              type: "sejm_stats",
              question,
              searchQuery: cleanedQuery,
              data: searchResults.map((act) => ({
                act_url: act.act_url,
                act_title: act.act_title,
                content: act.content,
              })),
            };

            const data = searchResults;
            console.log("Sejm stats data:", data);
            return {
              artifacts: [artifact],
              data: data,
            };
          },
        ]);

        const result = await sequence.invoke({ question });
        return result; // Return the result directly
      } catch (error) {
        console.error("Error in sejm_stats_analyzer:", error);
        return {
          result:
            error instanceof Error
              ? `Error analyzing Sejm statistics: ${error.message}`
              : "Error analyzing Sejm statistics: Unknown error",
        };
      }
    },
    returnDirect: false,
  });
};
