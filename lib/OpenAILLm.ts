import { LLM, BaseLLMParams } from "@langchain/core/language_models/llms";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { GenerationChunk } from "@langchain/core/outputs";
import OpenAI from "openai";
import {
  ChatMessage,
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Custom error class for OpenAI-related issues
export class OpenAIAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = "OpenAIAPIError";
  }
}

interface OpenAILLMInput extends BaseLLMParams {
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  streaming?: boolean;
}

export class OpenAILLM extends LLM {
  private client: OpenAI;
  model: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;

  constructor(fields: OpenAILLMInput) {
    super(fields);
    this.client = new OpenAI({
      apiKey: fields.apiKey || process.env.OPENAI_API_KEY,
    });
    this.model = fields.model;
    this.streaming = fields.streaming ?? false;
    this.temperature = fields.temperature ?? 0.7;
    this.maxTokens = fields.maxTokens ?? 512;
    this.topP = fields.topP;
    this.frequencyPenalty = fields.frequencyPenalty;
    this.presencePenalty = fields.presencePenalty;
  }

  _llmType() {
    return "openai";
  }

  private getMessageRole(
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

  private convertMessageToOpenAIFormat(
    message: ChatMessage
  ): ChatCompletionMessageParam {
    const artifacts = message.additional_kwargs?.artifacts
    
    return {
      role: this.getMessageRole(message),
      content: typeof message.content === "string" ? message.content : "",
    };
  }

  async _call(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: this.topP,
        frequency_penalty: this.frequencyPenalty,
        presence_penalty: this.presencePenalty,
        stream: false,
      });

      if (response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      throw new OpenAIAPIError("Response content is undefined");
    } catch (error: any) {
      if (error instanceof OpenAI.APIError) {
        throw new OpenAIAPIError(error.message, error.status);
      }
      throw error;
    }
  }

  async *run(
    messages: Array<ChatMessage>,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<GenerationChunk> {
    try {
      const openAIMessages = messages.map((msg) =>
        this.convertMessageToOpenAIFormat(msg)
      );
      console.log("Debug messages", openAIMessages);

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: openAIMessages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: this.topP,
        frequency_penalty: this.frequencyPenalty,
        presence_penalty: this.presencePenalty,
        stream: true,
        store: true,
      });

      try {
        for await (const chunk of stream) {
          if (chunk.choices[0]?.delta?.content) {
            const text = chunk.choices[0].delta.content;
            yield new GenerationChunk({ text });
            await runManager?.handleLLMNewToken(text);
          }
        }
      } catch (streamError: any) {
        if (streamError instanceof OpenAI.APIError) {
          throw new OpenAIAPIError(streamError.message, streamError.status);
        }
        throw streamError;
      }
    } catch (error: any) {
      if (error instanceof OpenAI.APIError) {
        throw new OpenAIAPIError(error.message, error.status);
      }
      throw error;
    }
  }
}
