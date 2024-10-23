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
    this.logger = new LoggerService(options.verbose ?? true);
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

  private messageToString(message: ChatMessage): string {
    return typeof message.content === "string"
      ? message.content
      : Array.isArray(message.content)
      ? message.content.join(" ")
      : String(message.content);
  }

  async *invoke(input: string | ChatMessage[]): AsyncGenerator<AgentProgress> {
    const query = Array.isArray(input)
      ? this.messageToString(input[input.length - 1])
      : input;

    // Initial status
    yield {
      type: "status",
      content: "Analizuję zapytanie...",
    };

    const relevantToolNames = await this.analyzeQuery(query);

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
        content: `Wykonuję narzędzie ${toolName}...`,
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

    const finalPrompt = await PROMPTS.processDataPrompt.format({
      question: query,
      dataString: formattedResults,
    });

    const stream = await this.llm._streamResponseChunks(finalPrompt, {});
    let contentBuffer = "";

    for await (const chunk of stream) {
      contentBuffer += chunk.text;
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