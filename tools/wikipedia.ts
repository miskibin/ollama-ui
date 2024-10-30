import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { TogetherLLM } from "@/lib/llms/TogetherLLm";
import { PROMPTS } from "@/lib/prompts";
import { Artifact } from "@/lib/types";

// Function to search Wikipedia
async function searchWikipedia(query: string) {
  try {
    const response = await fetch(
      `https://pl.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&origin=*&srlimit=3`
    );
    const data = await response.json();
    return data.query.search;
  } catch (error) {
    console.error("Error searching Wikipedia:", error);
    throw error;
  }
}

// Function to get page content
async function getWikipediaContent(pageId: number) {
  try {
    const response = await fetch(
      `https://pl.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts&exintro=1&format=json&origin=*`
    );
    const data = await response.json();
    return data.query.pages[pageId].extract;
  } catch (error) {
    console.error("Error fetching Wikipedia content:", error);
    throw error;
  }
}

const wikipediaSchema = z.object({
  question: z
    .string()
    .describe("The question to analyze using Wikipedia information"),
});

export const createWikipediaTool = (model: TogetherLLM) => {
  return new DynamicStructuredTool({
    name: "wikipedia_analyzer",
    description:
      "Analyzes information from Polish Wikipedia based on natural language questions",
    schema: wikipediaSchema,
    func: async ({ question }: z.infer<typeof wikipediaSchema>) => {
      try {
        const sequence = RunnableSequence.from([
          new RunnablePassthrough(),
          async ({ question }) => {
            // Generate search query using the model
            const query = await PROMPTS.generateSearchQuery.format({
              question: question,
            });
            const searchQuery = await model.invoke(query);
            const cleanedQuery = searchQuery
              .replace(/^(Query:|Search query:|Generated query:)/i, "")
              .trim();

            console.info("WIKIPEDIA", {
              question,
              searchQuery: cleanedQuery,
            });

            // Search Wikipedia
            const searchResults = await searchWikipedia(cleanedQuery);

            // Get detailed content for top results
            const contentPromises = searchResults.map(
              (result: { pageid: number }) => getWikipediaContent(result.pageid)
            );
            const contents = await Promise.all(contentPromises);

            // Combine search results with their contents
            const data = searchResults.map(
              (
                result: { title: any; snippet: any; pageid: any },
                index: number
              ) => ({
                title: result.title,
                snippet: result.snippet,
                content: contents[index],
                pageId: result.pageid,
                url: `https://pl.wikipedia.org/?curid=${result.pageid}`,
              })
            );

            const artifact: Artifact = {
              type: "wikipedia",
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
        console.error("Error in wikipedia_analyzer:", error);
        return JSON.stringify({
          result:
            error instanceof Error
              ? `Error analyzing Wikipedia information: ${error.message}`
              : "Error analyzing Wikipedia information: Unknown error",
          artifact: null,
        });
      }
    },
    returnDirect: false,
  });
};
