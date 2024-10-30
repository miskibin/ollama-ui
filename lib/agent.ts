import {
  BaseMessage,
  AIMessage,
  ChatMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
import { FirstIrrelevantUserQuestion, PROMPTS } from "./prompts";
import { LoggerService } from "./logger";
import { Artifact } from "@/lib/types";
import { AbstractLLM } from "./llms/LLM";
import { ar } from "date-fns/locale";

interface AgentProgress {
  type: "status" | "tool_execution" | "response" | "error";
  content: string;
  artifacts?: Artifact[];
  error?: string;
}

interface ToolExecutionResult {
  result: string;
  artifact?: Artifact;
}

interface ToolResult {
  tool: string;
  result: string;
}

export class AgentRP {
  private logger: LoggerService;

  constructor(
    private llm: AbstractLLM,
    private tools: StructuredToolInterface[],
    verbose = false
  ) {
    this.logger = new LoggerService(verbose);
  }

  private async checkToolRelevance(
    query: string,
    tool: StructuredToolInterface,
    previousResponse?: string
  ): Promise<boolean> {
    try {
      const prompt = await PROMPTS.analyzeToolRelevance.format({
        query,
        toolDescription: tool.description,
        previousResponse: previousResponse?.slice(0, 100) || "",
      });

      const response = await this.getCompletion(
        [new ChatMessage({ role: "user", content: prompt })],
        "tool_relevance"
      );

      return response.toLocaleLowerCase().includes("yes");
    } catch (error) {
      this.logger.debug(`Error checking tool relevance: ${error}`);
      return false;
    }
  }

  private getMessagesWithLatestArtifacts(
    messages: ChatMessage[]
  ): ChatMessage[] {
    const recentMessages = messages.slice(-5);
    const lastArtifactMessageIndex = recentMessages
      .slice()
      .reverse()
      .findIndex(
        (msg) =>
          Array.isArray(msg.additional_kwargs?.artifacts) &&
          msg.additional_kwargs.artifacts.length > 0
      );
    if (lastArtifactMessageIndex !== -1) {
      const originalIndex =
        recentMessages.length - 1 - lastArtifactMessageIndex;
      return recentMessages.slice(originalIndex);
    }
    return recentMessages;
  }
  private async executeTool(
    tool: StructuredToolInterface,
    question: string
  ): Promise<ToolExecutionResult> {
    try {
      const result = await tool.invoke({ question });
      const resultString = result?.toString() || "";

      try {
        const parsed = JSON.parse(resultString);
        if (parsed?.artifact) {
          return {
            result: parsed.result || resultString,
            artifact: parsed.artifact,
          };
        }
      } catch {
        // Not JSON or no artifact
      }

      return { result: resultString };
    } catch (error) {
      this.logger.debug(`Error executing tool ${tool.name}: ${error}`);
      return { result: `Error: Failed to execute tool ${tool.name}` };
    }
  }
  private async *streamCompletion(
    messages: ChatMessage[],
    type: "tool_relevance" | "conversation" | "tool_processing" = "conversation"
  ): AsyncGenerator<string> {
    try {
      const metadata = {
        message_type: type,
      };

      for await (const chunk of this.llm.run(
        messages,
        {},
        undefined,
        metadata
      )) {
        yield chunk.text;
      }
    } catch (error) {
      this.logger.debug(`Error in stream completion: ${error}`);
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

  async *invoke(messages: ChatMessage[]): AsyncGenerator<AgentProgress> {
    try {
      if (!messages || messages.length === 0) {
        throw new Error("No messages provided");
      }

      const userMessage = messages[messages.length - 1];
      const systemMessage = messages[0] as SystemMessage;
      const query = userMessage?.content as string;

      if (!query) {
        throw new Error("Invalid user message");
      }

      yield { type: "status", content: "Analizuję" };

      // Get previous AI response if exists
      const previousResponse = messages
        .slice()
        .reverse()
        .find(
          (msg) => msg instanceof AIMessage || msg.role === "assistant"
        )?.content;

      // Check which tools are relevant
      const toolResults = await Promise.all(
        this.tools.map(async (tool) => ({
          tool,
          isRelevant: await this.checkToolRelevance(
            query,
            tool,
            previousResponse as string
          ),
        }))
      );

      const toolsToUse = toolResults
        .filter((t) => t.isRelevant)
        .map((t) => t.tool);

      // No relevant tools - process without tools
      if (!toolsToUse.length) {
        yield {
          type: "status",
          content: "Generuję odpowiedź na podstawie kontekstu...",
        };

        if (messages.length < 3) {
          yield { type: "response", content: FirstIrrelevantUserQuestion }; // Message that your request is invalid
          return;
        }

        const messagesWithLatestArtifacts =
          this.getMessagesWithLatestArtifacts(messages);
        for await (const chunk of this.streamCompletion(
          messagesWithLatestArtifacts,
          "conversation"
        )) {
          yield { type: "response", content: chunk };
        }
        return;
      }

      // Execute relevant tools
      yield {
        type: "status",
        content: `Korzystam z: ${toolsToUse.map((t) => t.name).join(", ")}`,
      };

      const results: ToolResult[] = [];
      const artifacts: Artifact[] = [];

      for (const tool of toolsToUse) {
        yield { type: "status", content: `Korzystam z ${tool.name}...` };

        const { result, artifact } = await this.executeTool(tool, query);

        if (result) {
          results.push({ tool: tool.name, result });
        }

        if (artifact) {
          artifacts.push(artifact);
          yield {
            type: "tool_execution",
            content: `Narzędzie ${tool.name} zwróciło artefakt`,
            artifacts: [artifact],
          };
        }
      }

      // Generate final response
      yield { type: "status", content: "Generuję ostateczną odpowiedź..." };

      const finalPrompt = await PROMPTS.processDataPrompt.format({
        question: query,
        dataString: results.map((r) => `${r.tool}: ${r.result}`).join("\n"),
      });

      const finalMessages = [
        new ChatMessage({
          role: "system",
          content: systemMessage.content,
        }),
        new ChatMessage({
          role: "user",
          content: finalPrompt,
          additional_kwargs: {
            artifacts: artifacts.length > 0 ? artifacts : undefined,
          },
        }),
      ];

      // Stream the final response
      for await (const chunk of this.streamCompletion(
        finalMessages,
        "tool_processing"
      )) {
        yield {
          type: "response",
          content: chunk,
          artifacts: artifacts.length > 0 ? artifacts : undefined,
        };
      }
    } catch (error) {
      this.logger.debug(`Error in invoke: ${error}`);
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

      let content = "";
      let artifacts: Artifact[] = [];

      for await (const progress of this.invoke(messages)) {
        if (progress.type === "error") {
          throw new Error(progress.error || progress.content);
        }
        if (progress.type === "response") {
          content += progress.content;
          if (progress.artifacts) {
            artifacts = progress.artifacts;
          }
        }
      }

      if (!content) {
        throw new Error("No response generated");
      }

      return { content, artifacts };
    } catch (error) {
      this.logger.debug(`Error in call: ${error}`);
      throw error;
    }
  }
}
