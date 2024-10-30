import {
  AIMessage,
  ChatMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
import { FirstIrrelevantUserQuestion, PROMPTS } from "./prompts";
import { LoggerService } from "./logger";
import { Artifact } from "@/lib/types";
import { AbstractLLM } from "./llms/LLM";
import { Chat } from "together-ai/resources/index.mjs";

type AgentProgressType = "status" | "tool_execution" | "response" | "error";

interface AgentProgress {
  type: AgentProgressType;
  content: string;
  artifacts?: Artifact[];
  error?: string;
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
      return (
        await this.getCompletion(
          [new ChatMessage({ role: "user", content: prompt })],
          "tool_relevance"
        )
      )
        .toLowerCase()
        .includes("yes");
    } catch (error) {
      this.logger.debug(`Error checking tool relevance: ${error}`);
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
      const result = await tool.invoke({ question });
      const resultString = result?.toString() || "";
      try {
        const parsed = JSON.parse(resultString);
        return parsed?.artifact
          ? { result: parsed.result || resultString, artifact: parsed.artifact }
          : { result: resultString };
      } catch {
        return { result: resultString };
      }
    } catch (error) {
      this.logger.debug(`Error executing tool ${tool.name}: ${error}`);
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
        content: `Korzystam z: ${relevantTools.map((t) => t.name).join(", ")}`,
      };

      const toolResults = [];
      const artifacts: Artifact[] = [];

      for (const tool of relevantTools) {
        yield { type: "status", content: `Korzystam z ${tool.name}...` };
        const { result, artifact } = await this.executeTool(
          tool,
          query as string
        );
        if (result) toolResults.push({ tool: tool.name, result });
        if (artifact) {
          artifacts.push(artifact);
          yield {
            type: "tool_execution",
            content: `Narzędzie ${tool.name} zwróciło artefakt`,
            artifacts: [artifact],
          };
        }
      }

      yield { type: "status", content: "Generuję ostateczną odpowiedź..." };

      const finalPrompt = await PROMPTS.processDataPrompt.format({
        question: query,
        dataString: toolResults.map((r) => `${r.tool}: ${r.result}`).join("\n"),
      });

      for await (const chunk of this.streamCompletion(
        [
          new ChatMessage({ role: "system", content: systemMessage.content }),
          new ChatMessage({
            role: "user",
            content: finalPrompt,
            additional_kwargs: {
              artifacts: artifacts.length ? artifacts : undefined,
            },
          }),
        ],
        "conversation"
      )) {
        yield {
          type: "response",
          content: chunk,
          artifacts: artifacts.length ? artifacts : undefined,
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
      this.logger.debug(`Error in call: ${error}`);
      throw error;
    }
  }
}
