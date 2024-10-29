import { BaseMessage, AIMessage, ChatMessage } from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
import { TogetherLLM } from "./TogetherLLm";
import { FirstIrrelevantUserQuestion, PROMPTS } from "./prompts";
import { LoggerService } from "./logger";
import { Artifact } from "@/lib/types";
import { OpenAI } from "@langchain/openai";
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
  private llm: TogetherLLM | OpenAI;
  private tools: StructuredToolInterface[];
  private logger: LoggerService;

  constructor(options: AgentOptions) {
    this.llm = options.llm;
    this.tools = options.tools;
    this.logger = new LoggerService(process.env.NODE_ENV === "development");
  }
  private async analyzeToolRelevance(
    query: string,
    tool: StructuredToolInterface,
    messages: ChatMessage[]
  ): Promise<boolean> {
    this.logger.debug(`Analyzing relevance for tool: ${tool.name}`);

    // Get the last AI response if it exists
    const lastAIResponse = messages
      .slice()
      .reverse()
      .find((msg) => msg instanceof AIMessage || msg.role === "assistant");

    const previousResponse = lastAIResponse
      ? this.messageToString(lastAIResponse, true)
      : "";
    let prompt;
    if (!previousResponse) {
      prompt = await PROMPTS.initialToolRelevance.format({
        query,
        toolDescription: tool.description,
      });
    } else {
      prompt = await PROMPTS.analyzeToolRelevance.format({
        query,
        toolDescription: tool.description,
        previousResponse: previousResponse.slice(0, 900), // Limit context size
      });
    }
    this.logger.debug(prompt);
    const response = await this.llm.invoke(prompt);
    this.logger.debug(response);
    const lines = response.split("\n");
    const relevantLine =
      lines.find((line) => line.startsWith("RELEVANT:"))?.trim() || "";
    const isRelevant = relevantLine.includes("YES");

    return isRelevant;
  }

  private async analyzeQuery(
    query: string,
    messages: ChatMessage[]
  ): Promise<string[]> {
    const relevantTools: string[] = [];

    for (const tool of this.tools) {
      const isRelevant = await this.analyzeToolRelevance(query, tool, messages);
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
  private async *processWithoutTools(
    messages: ChatMessage[]
  ): AsyncGenerator<string> {
    // Get last three messages and find most recent artifacts
    console.log(messages);
    if (messages.length < 3) {
      yield FirstIrrelevantUserQuestion;
      return;
    }
    const lastThreeMessages = messages.slice(-5);
    const artifacts = (lastThreeMessages
      .reverse()
      .find((msg) => (msg.additional_kwargs?.artifacts as any)?.length)
      ?.additional_kwargs?.artifacts || []) as Artifact[];

    // Get last user message for context
    const userMessage = messages[messages.length - 1];
    const context = [
      {
        role: userMessage.role,
        content: this.messageToString(userMessage, false), // Don't include artifacts in the message
      },
    ];
    const artifactContent =
      artifacts.length > 0
        ? artifacts
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
            .join("\n")
        : "";
    const prompt = `${artifactContent.slice(0, 16000)}${JSON.stringify(
      context
    )}\n\nUser: ${this.messageToString(userMessage, false)}`;

    this.logger.debug(prompt);

    // Use streaming API instead of invoke
    const stream = await this.llm._streamResponseChunks(prompt, {});

    for await (const chunk of stream) {
      yield chunk.text;
    }
  }
  private messageToString(
    message: ChatMessage,
    includeArtifacts: boolean = false
  ): string {
    // Handle content
    let content =
      typeof message.content === "string"
        ? message.content
        : Array.isArray(message.content)
        ? message.content.join(" ")
        : String(message.content);

    // Only include artifacts if specifically requested
    if (includeArtifacts) {
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
    }

    return content;
  }

  async *invoke(input: string | ChatMessage[]): AsyncGenerator<AgentProgress> {
    console.log(input[0]);
    const messages = Array.isArray(input)
      ? input
      : [new ChatMessage({ content: input, role: "user" })];
    const query = this.messageToString(messages[messages.length - 1], false);

    yield {
      type: "status",
      content: "Analizuję zapytanie...",
    };
    const relevantToolNames = await this.analyzeQuery(query, messages);
    if (relevantToolNames.length === 0) {
      yield {
        type: "status",
        content: "Generuję odpowiedź na podstawie kontekstu...",
      };
      if (Array.isArray(input)) {
        // Iterate through the streaming response
        for await (const chunk of this.processWithoutTools(messages)) {
          yield {
            type: "response",
            content: chunk,
          };
        }
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
        systemPrompt: messages[0].content,
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
