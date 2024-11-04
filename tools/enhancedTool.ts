import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export interface ToolConfig {
  name: string;
  description: string;
  relevancePrompt: PromptTemplate;
  schema: z.ZodObject<any>;
}

export interface RelevanceContext {
  isRelevant: boolean;
  searchQuery?: string;
  originalResponse: string;
}

// Enhanced tool creation function
export function createEnhancedTool(
  config: ToolConfig,
  model: any,
  processor: (params: any, relevanceContext: RelevanceContext) => Promise<any>
) {
  return new DynamicStructuredTool({
    name: config.name,
    description: config.description,
    schema: config.schema,
    func: async (params: z.infer<typeof config.schema>) => {
      try {
        const sequence = RunnableSequence.from([
          new RunnablePassthrough(),
          async (input) => {
            // Check relevance using tool's custom prompt
            const relevanceCheck = await config.relevancePrompt.format({
              query: input.question,
              toolDescription: config.description,
            });
            console.log("Relevance prompt:", relevanceCheck);
            const relevanceResponse = await model.invoke(relevanceCheck);
            console.log("Relevance response:", relevanceResponse);

            // Parse the relevance response
            const relevanceContext: RelevanceContext = {
              isRelevant: relevanceResponse.toLowerCase().includes("yes"),
              originalResponse: relevanceResponse,
              searchQuery: relevanceResponse
                .split("\n")
                .find((line: string) => line.startsWith("SEARCH QUERY:"))
                ?.replace("SEARCH QUERY:", "")
                ?.trim(),
            };

            if (!relevanceContext.isRelevant) {
              return {
                artifacts: [],
                data: [],
                message: "Tool deemed not relevant for this query.",
              };
            }

            // Pass both input and relevance context to the processor
            return processor(input, relevanceContext);
          },
        ]);

        return sequence.invoke(params);
      } catch (error) {
        console.error(`Error in ${config.name}:`, error);
        return {
          artifacts: [],
          data: [],
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    },
    returnDirect: false,
  });
}
