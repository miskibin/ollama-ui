import { LLM, BaseLLMParams } from "@langchain/core/language_models/llms";
import {
  ChatMessage,
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";

export interface BaseMessage {
  role: "system" | "user" | "assistant";
  content: string;
  artifacts?: Array<{
    type: string;
    identifier: string;
    data: any;
  }>;
}

export interface AbstractLLMInput extends BaseLLMParams {
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

export abstract class AbstractLLM extends LLM {
  protected model: string;
  protected temperature: number;
  protected maxTokens: number;
  protected streaming: boolean;

  constructor(fields: AbstractLLMInput) {
    super(fields);
    this.model = fields.model;
    this.temperature = fields.temperature ?? 0.7;
    this.maxTokens = fields.maxTokens ?? 512;
    this.streaming = fields.streaming ?? false;
  }

  protected getMessageRole(
    message: ChatMessage | SystemMessage | HumanMessage | AIMessage
  ): "system" | "user" | "assistant" {
    if (message instanceof SystemMessage) return "system";
    if (message instanceof HumanMessage) return "user";
    if (message instanceof AIMessage) return "assistant";

    // For ChatMessage type, check the role property
    switch (message.role) {
      case "system":
        return "system";
      case "assistant":
        return "assistant";
      case "user":
      default:
        return "user";
    }
  }

  protected convertMessageToJSON(
    message: ChatMessage | SystemMessage | HumanMessage | AIMessage
  ): BaseMessage {
    const role = this.getMessageRole(message);
    const artifacts = message.additional_kwargs?.artifacts;
    let content = typeof message.content === "string" ? message.content : "";

    // If artifacts exist, append them to the content
    if (artifacts && Array.isArray(artifacts) && artifacts.length > 0) {
      // Keep the original content
      const artifactContent = artifacts
        .map(
          (artifact) =>
            `<artifact type="${artifact.type}">
          ${JSON.stringify(artifact.data)}</artifact>`
        )
        .join("\n");

      // Combine original content with artifacts
      content = `${content}\n${artifactContent}`;
    }

    const baseMessage: BaseMessage = {
      role,
      content,
    };

    return baseMessage;
  }
  protected convertMessagesToJSON(
    messages: Array<ChatMessage | SystemMessage | HumanMessage | AIMessage>
  ): Array<BaseMessage> {
    return messages.map((message) => this.convertMessageToJSON(message));
  }

  // Abstract methods that must be implemented by child classes
  abstract _call(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<string>;

  abstract run(
    messages: Array<ChatMessage>,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun,
    metadata?: any
  ): AsyncGenerator<any>;

  _llmType(): string {
    return "abstract";
  }
}
