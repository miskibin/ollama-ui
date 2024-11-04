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
import {
  createEnhancedTool,
  RelevanceContext,
  ToolConfig,
} from "./enhancedTool";
import { PromptTemplate } from "@langchain/core/prompts";
import { getActName } from "./sejmstats-utils";
function formatActsForPrompt(acts: any[]): string {
  return acts
    .map(
      (act, index) => `
  [${index + 1}]
  Title: ${getActName(act.act_title)}
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
  const response = await model.invoke(prompt);
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

const sejmStatsConfig: ToolConfig = {
  name: "Baza ustaw",
  description:
    "Searches and analyzes laws, legal regulations based on user questions.",
  schema: sejmStatsSchema,
  relevancePrompt: PromptTemplate.fromTemplate(`
    Question Analysis for Legal Search:
    Question: {query}
    Tool Purpose: {toolDescription}
    Task:
    1. Determine if the question relates to Polish legal regulations, laws, or statutes
    2. Check if it requires searching through legal documents
    3. If the question is not follow up for a previous legal search, generate a search query

    If the question matches these criteria, also generate a search query:
    - Use formal legal terminology
    - Include specific legal keywords
    - Exclude generic phrases like "zgodnie z prawem", "legalnie"
    - Don't include phrases like "kodeks karny","ustawa" unless it is in the question
    Format Answer as:
    RELEVANT: [YES or NO]
    SEARCH QUERY: [If YES, include optimized search terms in Polish]
  `),
};

export const createSejmStatsTool = (model: any) => {
  const processQuery = async (
    { question }: z.infer<typeof sejmStatsSchema>,
    relevanceContext: RelevanceContext
  ) => {
    // Use the optimized search query if available, otherwise fall back to original question
    const searchQuery = relevanceContext.searchQuery || question;
    const searchResults = await searchOptimized(searchQuery);
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

    const actsArray = Array.isArray(relevantActs)
      ? relevantActs
      : [relevantActs];

    const artifacts = actsArray.map((act) => ({
      type: "sejm_stats",
      question,
      searchQuery, // Now using the optimized search query
      data: [
        {
          act_url: act.act_url,
          act_title: getActName(act.act_title),
          content: act.content,
        },
      ],
    }));

    return {
      artifacts,
      data: actsArray,
    };
  };

  return createEnhancedTool(sejmStatsConfig, model, processQuery);
};
