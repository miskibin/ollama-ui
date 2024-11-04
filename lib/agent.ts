import {
  AIMessage,
  ChatMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
import { FirstIrrelevantUserQuestion, PROMPTS } from "./prompts";
import { Artifact } from "@/lib/types";
import { AbstractLLM } from "./llms/LLM";

type AgentProgressType = "status" | "tool_execution" | "response" | "error";

interface AgentProgress {
  type: AgentProgressType;
  content: string;
  artifacts?: Artifact[];
  error?: string;
  data?: any[];
}
interface ToolExecutionResult {
  artifacts?: Artifact[];
  data?: any[];
}
export class AgentRP {
  constructor(
    private llm: AbstractLLM,
    private tools: StructuredToolInterface[],
  ) {}

  private async checkToolRelevance(
    query: string,
    tool: StructuredToolInterface,
    previousResponse?: string
  ): Promise<boolean> {
    try {
      const prompt = await PROMPTS.analyzeToolRelevance.format({
        query,
        toolDescription: tool.description,
        previousResponse: previousResponse?.slice(0, 100) || null,
      });
      const result = await this.getCompletion(
        [new ChatMessage({ role: "user", content: prompt })],
        "tool_relevance"
      );

      return result.toLowerCase().includes("yes");
    } catch (error) {
      console.debug(`Error checking tool relevance: ${error}`);
      return false;
    }
  }

  private getMessagesWithLatestArtifacts(
    messages: ChatMessage[]
  ): ChatMessage[] {
    const recentMessages = messages.slice(-5);
    const lastArtifactIndex = recentMessages
      .slice()
      .reverse()
      .findIndex(
        (msg) =>
          Array.isArray(msg.additional_kwargs?.artifacts) &&
          msg.additional_kwargs.artifacts.length > 0
      );
    return lastArtifactIndex !== -1
      ? recentMessages.slice(recentMessages.length - 1 - lastArtifactIndex)
      : recentMessages;
  }
  private async executeTool(tool: StructuredToolInterface, question: string) {
    try {
      const { artifacts, data } = await tool.invoke({ question });
      return {
        artifacts: artifacts || null,
        data: data || null,
      };
    } catch (error) {
      console.debug(`Error executing tool ${tool.name}: ${error}`);
      return { result: `Error: Failed to execute tool ${tool.name}` };
    }
  }
  private async *streamCompletion(
    messages: ChatMessage[],
    type:
      | "tool_relevance"
      | "conversation"
      | "contextual"
      | "tool_processing" = "conversation"
  ) {
    try {
      for await (const chunk of this.llm.run(messages, {}, undefined, {
        message_type: type,
      })) {
        yield chunk.text;
      }
    } catch (error) {
      console.debug(`Error in stream completion: ${error}`);
      throw error;
    }
  }

  private async getCompletion(
    messages: ChatMessage[],
    type: "tool_relevance" | "conversation" | "tool_processing" = "conversation"
  ): Promise<string> {
    let response = "";
    for await (const chunk of this.streamCompletion(messages, type)) {
      response += chunk;
    }
    return response;
  }
  private async *streamToolResults(
    tool: StructuredToolInterface,
    query: string
  ): AsyncGenerator<ToolExecutionResult> {
    try {
      const { artifacts = [], data = [] } = await this.executeTool(tool, query);

      // Stream artifacts one by one
      if (artifacts?.length) {
        for (const artifact of artifacts) {
          yield {
            artifacts: [artifact],
            data: undefined,
          };
        }
      }

      // Stream data 1 by one
      if (data?.length) {
        const chunkSize = 1; // Adjust based on your needs
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          yield {
            artifacts: undefined,
            data: chunk,
          };
        }
      }
    } catch (error) {
      console.debug(`Error streaming tool results: ${error}`);
      throw error;
    }
  }

  async *invoke(messages: ChatMessage[]): AsyncGenerator<AgentProgress> {
    try {
      if (!messages?.length) throw new Error("No messages provided");

      const userMessage = messages[messages.length - 1];
      const systemMessage = messages[0] as ChatMessage;
      const query = userMessage?.content;
      if (!query) throw new Error("Invalid user message");

      yield { type: "status", content: "Analizuję" };

      const previousResponse = messages
        .slice()
        .reverse()
        .find(
          (msg) => msg instanceof AIMessage || msg.role === "assistant"
        )?.content;

      const relevantTools = (
        await Promise.all(
          this.tools.map(async (tool) => ({
            tool,
            isRelevant: await this.checkToolRelevance(
              query as string,
              tool,
              previousResponse as string
            ),
          }))
        )
      )
        .filter((t) => t.isRelevant)
        .map((t) => t.tool);

      if (!relevantTools.length) {
        yield {
          type: "status",
          content: "Generuję odpowiedź na podstawie kontekstu...",
        };
        if (messages.length < 3) {
          yield { type: "response", content: FirstIrrelevantUserQuestion };
          return;
        }
        for await (const chunk of this.streamCompletion(
          [systemMessage, ...this.getMessagesWithLatestArtifacts(messages)],
          "contextual"
        )) {
          yield { type: "response", content: chunk };
        }
        return;
      }

      yield {
        type: "status",
        content: `Korzystam z narzędzia: ${relevantTools
          .map((t) => t.name)
          .join(", ")}`,
      };

      const toolResults = [];

      // Execute and stream results from each tool
      for (const tool of relevantTools) {
        yield {
          type: "status",
          content: `Korzystam z narzędzia: ${tool.name}...`,
        };

        // Stream artifacts and data separately
        for await (const result of this.streamToolResults(
          tool,
          query as string
        )) {
          if (result.artifacts?.length) {
            yield {
              type: "tool_execution",
              content: `Narzędzie ${tool.name} zwróciło artefakt`,
              artifacts: result.artifacts,
            };
            toolResults.push({ tool: tool.name, result: result.artifacts[0] });
          }

          if (result.data?.length) {
            yield {
              type: "tool_execution",
              content: `Narzędzie ${tool.name} zwróciło dane`,
              data: result.data,
            };
          }
        }
      }

      yield { type: "status", content: "Generuję ostateczną odpowiedź..." };

      const finalPrompt = await PROMPTS.processDataPrompt.format({
        question: query,
        dataString: toolResults
          .map((r) => `${r.tool}: ${JSON.stringify(r.result)}`)
          .join("\n"),
      });

      for await (const chunk of this.streamCompletion(
        [
          new ChatMessage({ role: "system", content: systemMessage.content }),
          new ChatMessage({ role: "user", content: finalPrompt }),
        ],
        "conversation"
      )) {
        yield { type: "response", content: chunk };
      }
    } catch (error) {
      console.debug(`Error in invoke: ${error}`);
      yield {
        type: "error",
        content: "An error occurred while processing your request",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async call(
    input: string | ChatMessage[]
  ): Promise<{ content: string; artifacts: Artifact[] }> {
    try {
      const messages = Array.isArray(input)
        ? input
        : [new ChatMessage({ role: "user", content: input })];
      let content = "",
        artifacts: Artifact[] = [];

      for await (const progress of this.invoke(messages)) {
        if (progress.type === "error")
          throw new Error(progress.error || progress.content);
        if (progress.type === "response") {
          content += progress.content;
          if (progress.artifacts) artifacts = progress.artifacts;
        }
      }

      if (!content) throw new Error("No response generated");
      return { content, artifacts };
    } catch (error) {
      console.debug(`Error in call: ${error}`);
      throw error;
    }
  }
}
