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
function formatActsForPrompt(acts: any[]): string {
  return acts
    .map(
      (act, index) => `
  [${index + 1}]
  Title: ${act.act_title}
  Chapter: ${act.chapters}
  Summary: ${act.summary}
  `
    )
    .join("\n");
}

// Usage in your tool chain
const selectRelevantAct = async (
  question: string,
  acts: any[],
  model: TogetherLLM
) => {
  const formattedActs = formatActsForPrompt(acts);
  const prompt = await PROMPTS.selectRelevantItem.format({
    question,
    acts: formattedActs,
  });
  console.log(prompt);
  const response = await model.invoke(prompt);
  console.log(response);

  // Parse response, handling multiple indices (e.g., "2,3") or a single index
  const actIndices = response
    .trim()
    .split(",")
    .map((index) => parseInt(index.trim()) - 1)
    .filter((index) => !isNaN(index) && index >= 0 && index < acts.length);

  // Return null if no valid indices are found
  if (actIndices.length === 0) {
    return null;
  }

  // Return array of relevant acts if multiple indices, or a single act if only one index
  return actIndices.length === 1
    ? acts[actIndices[0]]
    : actIndices.map((index) => acts[index]);
};

const sejmStatsSchema = z.object({
  question: z
    .string()
    .describe("The question to analyze about Sejm statistics"),
});
export const createSejmStatsTool = (model: TogetherLLM) => {
  return new DynamicStructuredTool({
    name: "Baza ustaw",
    description:
      "Searches and analyzes laws, legal regulations based on user questions.",
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
            console.log(cleanedQuery);
            const searchResults = await searchOptimized(cleanedQuery);

            // Update to handle multiple relevant acts
            const relevantActs = await selectRelevantAct(
              question,
              searchResults,
              model
            );

            if (!relevantActs || relevantActs.length === 0) {
              return {
                artifacts: [],
                data: [],
                message: "No relevant acts found for your question.",
              };
            }

            // Ensure relevantActs is an array
            const actsArray = Array.isArray(relevantActs)
              ? relevantActs
              : [relevantActs];

            // Create artifacts and data entries for each relevant act
            const artifacts = actsArray.map((act) => ({
              type: "sejm_stats",
              question,
              searchQuery: cleanedQuery,
              data: [
                {
                  act_url: act.act_url,
                  act_title: act.act_title,
                  content: act.content,
                },
              ],
            }));

            return {
              artifacts,
              data: actsArray,
            };
          },
        ]);

        const result = await sequence.invoke({ question });
        return result;
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
