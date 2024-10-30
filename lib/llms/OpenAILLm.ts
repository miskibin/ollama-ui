import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { GenerationChunk } from "@langchain/core/outputs";
import OpenAI from "openai";
import { ChatMessage } from "@langchain/core/messages";
import { AbstractLLM, AbstractLLMInput } from "./LLM";

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

interface OpenAILLMInput extends AbstractLLMInput {
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export class OpenAILLM extends AbstractLLM {
  private client: OpenAI;
  private topP?: number;
  private frequencyPenalty?: number;
  private presencePenalty?: number;

  constructor(fields: OpenAILLMInput) {
    super(fields);
    this.client = new OpenAI({
      apiKey: fields.apiKey || process.env.OPENAI_API_KEY,
    });
    this.topP = fields.topP;
    this.frequencyPenalty = fields.frequencyPenalty;
    this.presencePenalty = fields.presencePenalty;
  }

  _llmType() {
    return "openai";
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
        store: true,
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
    runManager?: CallbackManagerForLLMRun,
    metadata?: Record<string, any>
  ): AsyncGenerator<GenerationChunk> {
    try {
      const openAIMessages = this.convertMessagesToJSON(messages);
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
        metadata: metadata,
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
