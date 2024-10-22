import {
  BaseMessage,
  AIMessage,
  SystemMessage,
  HumanMessage,
  ChatMessage,
} from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
import { TogetherLLM } from "./TogetherLLm";
import { GenerationChunk } from "@langchain/core/outputs";
import { PromptTemplate } from "@langchain/core/prompts";
import winston from "winston";

interface AgentOptions {
  llm: TogetherLLM;
  tools: StructuredToolInterface[];
  verbose?: boolean;
}

interface LogContext {
  requestId: string;
}

export class AgentRP {
  private llm: TogetherLLM;
  private tools: StructuredToolInterface[];
  private verbose: boolean;
  private requestCounter: number = 0;
  private logger: winston.Logger;

  private readonly analyzeTemplate =
    PromptTemplate.fromTemplate(`You are an AI assistant that determines if a tool is needed to answer a question.
      Answer only with YES or NO.
      
      Question: {query}
      
      Tool Information:
      Name: {toolName}
      Description: {toolDescription}
      
      Is this tool needed to answer the question?
      Answer with either:
      RELEVANT: YES
      or
      RELEVANT: NO
      `);

  private readonly RESPONSE_PROMPT = `You are a helpful AI assistant. Using the information gathered from the tools, provide a clear and direct answer to the user's question.
      Focus on being concise and informative based on the tool outputs provided.
      
      Question: {question}
      Tool Results: {tool_results}`;

  constructor(options: AgentOptions) {
    this.llm = options.llm;
    this.tools = options.tools;
    this.verbose = options.verbose ?? true;

    // Initialize Winston logger
    this.logger = winston.createLogger({
      level: this.verbose ? "debug" : "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, requestId, ...meta }) => {
            const reqId = requestId ? `[${requestId}] ` : "";
            const metaStr = Object.keys(meta).length
              ? `\n${JSON.stringify(meta, null, 2)}`
              : "";
            return `${timestamp} ${reqId}${level}: ${message}${metaStr}`;
          }
        )
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: "error.log",
          level: "error",
        }),
        new winston.transports.File({
          filename: "combined.log",
        }),
      ],
    });
  }

  private createLogContext(): LogContext {
    this.requestCounter++;
    return {
      requestId: `req_${this.requestCounter.toString().padStart(4, "0")}`,
    };
  }

  private log(
    context: LogContext,
    level: "info" | "warn" | "error" | "debug",
    message: string,
    meta?: any
  ) {
    this.logger.log(level, message, { ...meta, requestId: context.requestId });
  }

  private async analyzeToolRelevance(
    query: string,
    tool: StructuredToolInterface,
    context: LogContext
  ): Promise<boolean> {
    this.log(context, "debug", `Analyzing relevance for tool: ${tool.name}`);

    const prompt = await this.analyzeTemplate.format({
      query,
      toolName: tool.name,
      toolDescription: tool.description,
    });

    this.log(context, "debug", "Generated analysis prompt", { prompt });

    const response = await this.llm.invoke(prompt);
    const lines = response.split("\n");
    const relevantLine =
      lines.find((line) => line.startsWith("RELEVANT:"))?.trim() || "";
    const isRelevant = relevantLine.includes("YES");

    this.log(
      context,
      "debug",
      `Tool ${tool.name} relevance analysis complete`,
      {
        isRelevant,
      }
    );

    return isRelevant;
  }

  private async analyzeQuery(
    query: string,
    context: LogContext
  ): Promise<string[]> {
    this.log(context, "info", "Starting query analysis", { query });

    const analyses = await Promise.all(
      this.tools.map(async (tool) => ({
        name: tool.name,
        relevant: await this.analyzeToolRelevance(query, tool, context),
      }))
    );

    const relevantToolNames = analyses
      .filter((analysis) => analysis.relevant)
      .map((analysis) => analysis.name);

    this.log(
      context,
      "info",
      `Query analysis complete. Found ${relevantToolNames.length} relevant tools`,
      { relevantTools: relevantToolNames }
    );

    return relevantToolNames;
  }

  private async executeTool(
    tool: StructuredToolInterface,
    context: LogContext
  ): Promise<string> {
    this.log(context, "info", `Executing tool: ${tool.name}`);

    try {
      const result = await tool.invoke({});
      this.log(context, "debug", `Tool ${tool.name} execution completed`, {
        result,
      });
      return result.toString();
    } catch (e) {
      this.log(context, "error", `Error executing tool ${tool.name}`, {
        error: e,
      });
      return `Error: Failed to execute tool ${tool.name}`;
    }
  }

  private messageToString(message: ChatMessage): string {
    return typeof message.content === "string"
      ? message.content
      : Array.isArray(message.content)
      ? message.content.join(" ")
      : String(message.content);
  }

  private async *streamResponse(
    prompt: string,
    context: LogContext
  ): AsyncGenerator<AIMessage> {
    this.log(context, "debug", "Starting response stream", { prompt });

    const stream = await this.llm._streamResponseChunks(prompt, {});
    let contentBuffer = "";

    for await (const chunk of stream) {
      contentBuffer += chunk.text;
      yield new AIMessage({ content: chunk.text });
    }

    this.log(context, "debug", "Response stream complete", {
      totalLength: contentBuffer.length,
    });
  }

  async *invoke(input: string | ChatMessage[]): AsyncGenerator<AIMessage> {
    const context = this.createLogContext();
    this.log(context, "info", "Starting new agent invocation");

    const query = Array.isArray(input)
      ? this.messageToString(input[input.length - 1])
      : input;

    this.log(context, "debug", "Processed input query", { query });

    const relevantToolNames = await this.analyzeQuery(query, context);

    const toolResults = [];
    for (const toolName of relevantToolNames) {
      const tool = this.tools.find((t) => t.name === toolName);
      if (!tool) {
        this.log(context, "warn", `Tool ${toolName} not found`);
        continue;
      }

      const result = await this.executeTool(tool, context);
      toolResults.push({
        tool: toolName,
        result,
      });

      yield new AIMessage({
        content: `Executed ${toolName} tool...`,
      });
    }

    const formattedResults = toolResults
      .map((r) => `${r.tool}: ${r.result}`)
      .join("\n");

    this.log(context, "debug", "Preparing final response", {
      toolResults: formattedResults,
    });

    const finalPrompt = this.RESPONSE_PROMPT.replace(
      "{question}",
      query
    ).replace("{tool_results}", formattedResults);

    for await (const chunk of this.streamResponse(finalPrompt, context)) {
      yield chunk;
    }

    this.log(context, "info", "Agent invocation complete");
  }

  async call(input: string | ChatMessage[]): Promise<AIMessage> {
    const context = this.createLogContext();
    this.log(context, "info", "Starting synchronous agent call");

    let lastMessage: AIMessage | undefined;

    for await (const message of this.invoke(input)) {
      lastMessage = message;
    }

    if (!lastMessage) {
      this.log(context, "error", "No response generated");
      throw new Error("No response generated");
    }

    this.log(context, "info", "Synchronous agent call complete");
    return lastMessage;
  }
}
