"use server";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";

const wikipediaTool = new WikipediaQueryRun({
  topKResults: 1,
  maxDocContentLength: 2000,
});

async function searchWikipedia(question: string): Promise<string> {
  try {
    console.log("Searching Wikipedia for:", question);
    const result = await wikipediaTool.invoke(question);
    console.log("Wikipedia search result:", result);
    return result;
  } catch (error) {
    console.error("Error searching Wikipedia:", error);
    return "An error occurred while searching Wikipedia.";
  }
}

export { searchWikipedia };
