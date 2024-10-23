import { BaseMessage, AIMessage, ChatMessage } from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
import { TogetherLLM } from "./TogetherLLm";
import { PROMPTS } from "./prompts";
import { LoggerService } from "./logger";
import { Artifact } from "@/lib/types";

interface AgentProgress {
  type: "status" | "tool_execution" | "response";
  content: string;
  artifacts?: Artifact[];
}
interface AgentOptions {
  llm: TogetherLLM;
  tools: StructuredToolInterface[];
  verbose?: boolean;
}

export class AgentRP {
  private llm: TogetherLLM;
  private tools: StructuredToolInterface[];
  private logger: LoggerService;

  constructor(options: AgentOptions) {
    this.llm = options.llm;
    this.tools = options.tools;
    this.logger = new LoggerService(process.env.NODE_ENV === "development");
  }

  private async analyzeToolRelevance(
    query: string,
    tool: StructuredToolInterface
  ): Promise<boolean> {
    this.logger.debug(`Analyzing relevance for tool: ${tool.name}`);

    const prompt = await PROMPTS.analyzeToolRelevance.format({
      query,
      toolName: tool.name,
      toolDescription: tool.description,
    });
    this.logger.debug(prompt);
    const response = await this.llm.invoke(prompt);
    const lines = response.split("\n");
    const relevantLine =
      lines.find((line) => line.startsWith("RELEVANT:"))?.trim() || "";
    const isRelevant = relevantLine.includes("YES");

    return isRelevant;
  }

  private async analyzeQuery(query: string): Promise<string[]> {
    const relevantTools: string[] = [];

    for (const tool of this.tools) {
      const isRelevant = await this.analyzeToolRelevance(query, tool);
      if (isRelevant) {
        relevantTools.push(tool.name);
      }
    }

    return relevantTools;
  }

  private async executeTool(
    tool: StructuredToolInterface,
    query: string
  ): Promise<{ result: string; artifact?: Artifact }> {
    try {
      const rawResult = await tool.invoke({ question: query });
      const result = rawResult.toString();

      // Try to parse the result for artifact
      try {
        const parsed = JSON.parse(result);
        if (parsed.artifact) {
          return {
            result: parsed.result || result,
            artifact: parsed.artifact,
          };
        }
      } catch (e) {
        // Not JSON or no artifact, return raw result
      }

      return { result };
    } catch (e) {
      return { result: `Error: Failed to execute tool ${tool.name}` };
    }
  }

  private async processWithoutTools(messages: ChatMessage[]): Promise<string> {
    // Take last two messages if available
    const contextMessages = messages.slice(-2);
    const context = contextMessages.map((msg) => {
      const content = this.messageToString(msg);
      const artifacts: Artifact[] = Array.isArray(
        msg.additional_kwargs?.artifacts
      )
        ? msg.additional_kwargs.artifacts
        : [];

      return {
        role: msg.role,
        content,
        artifacts,
      };
    });

    // Format context for the model
    const formattedContext = context
      .map(
        (msg) =>
          `${msg.role}: ${msg.content}\n${msg.artifacts
            .map(
              (a) => `[Artifact: ${a.type}]\n${JSON.stringify(a.data, null, 2)}`
            )
            .join("\n")}`
      )
      .join("\n\n");

    // Generate response using the context
    const prompt = await PROMPTS.generateResponse.format({
      question: this.messageToString(messages[messages.length - 1]),
      tool_results: formattedContext,
    });

    return await this.llm.invoke(prompt);
  }

  private messageToString(message: ChatMessage): string {
    // Handle content
    let content =
      typeof message.content === "string"
        ? message.content
        : Array.isArray(message.content)
        ? message.content.join(" ")
        : String(message.content);

    const artifacts = message.additional_kwargs?.artifacts || [];
    if (artifacts && Array.isArray(artifacts) && artifacts.length > 0) {
      const artifactContent = artifacts
        .map((artifact) => {
          if (artifact.data) {
            return `Data: ${artifact.type}:\n${JSON.stringify(
              artifact.data,
              null,
              2
            )}\n`;
          }
          return "";
        })
        .join("\n");

      content = artifactContent + "\n" + content;
    }

    return content;
  }
  async *invoke(input: string | ChatMessage[]): AsyncGenerator<AgentProgress> {
    const messages = Array.isArray(input)
      ? input
      : [new ChatMessage({ content: input, role: "user" })];
    const query = this.messageToString(messages[messages.length - 1]);

    // Initial status
    yield {
      type: "status",
      content: "Analizuję zapytanie...",
    };

    const relevantToolNames = await this.analyzeQuery(query);

    if (relevantToolNames.length === 0) {
      yield {
        type: "status",
        content: "Generuję odpowiedź na podstawie kontekstu...",
      };

      // Process without tools if we have messages context
      if (Array.isArray(input)) {
        const response = await this.processWithoutTools(messages);
        yield {
          type: "response",
          content: response,
        };
        return;
      }
    }

    // Rest of the existing tool processing logic
    if (relevantToolNames.length > 0) {
      yield {
        type: "status",
        content: `Postanowiłem użyć ${
          relevantToolNames.length
        } narzędzi: ${relevantToolNames.join(", ")}`,
      };
    }

    const toolResults = [];
    const artifacts: Artifact[] = [];

    for (const toolName of relevantToolNames) {
      const tool = this.tools.find((t) => t.name === toolName);
      if (!tool) continue;

      yield {
        type: "status",
        content: `Czekam na odpowiedź od ${toolName}...`,
      };

      const { result, artifact } = await this.executeTool(tool, query);

      if (artifact) {
        artifacts.push(artifact);
      }

      toolResults.push({
        tool: toolName,
        result,
      });

      yield {
        type: "tool_execution",
        content: `Wykonanie narzędzia ${toolName} zakończone`,
        artifacts: artifact ? [artifact] : undefined,
      };
    }

    const formattedResults = toolResults
      .map((r) => `${r.tool}: ${r.result}`)
      .join("\n");

    yield {
      type: "status",
      content: "Generuję ostateczną odpowiedź...",
    };

    let finalPrompt;
    if (artifacts.length > 0) {
      finalPrompt = await PROMPTS.processDataPrompt.format({
        question: query,
        dataString: formattedResults,
      });
    } else {
      finalPrompt = query;
    }

    this.logger.debug(finalPrompt);
    const stream = await this.llm._streamResponseChunks(finalPrompt, {});

    for await (const chunk of stream) {
      yield {
        type: "response",
        content: chunk.text,
        artifacts: artifacts,
      };
    }
  }

  async call(
    input: string | ChatMessage[]
  ): Promise<{ content: string; artifacts: Artifact[] }> {
    let lastContent = "";
    let allArtifacts: Artifact[] = [];

    for await (const progress of this.invoke(input)) {
      if (progress.type === "response") {
        lastContent += progress.content;
        if (progress.artifacts) {
          allArtifacts = progress.artifacts;
        }
      }
    }

    if (!lastContent) {
      throw new Error("Nie wygenerowano odpowiedzi");
    }

    return {
      content: lastContent,
      artifacts: allArtifacts,
    };
  }
}
