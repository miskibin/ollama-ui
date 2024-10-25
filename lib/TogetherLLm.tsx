import { LLM, BaseLLMParams } from "@langchain/core/language_models/llms";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { GenerationChunk } from "@langchain/core/outputs";
import Together from "together-ai";

// Custom error class for network-related issues
export class TogetherAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = "TogetherAPIError";
  }
}

interface TogetherLLMInput extends BaseLLMParams {
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  repetitionPenalty?: number;
  streaming?: boolean;
}

export class TogetherLLM extends LLM {
  private client: Together;
  model: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;

  constructor(fields: TogetherLLMInput) {
    super(fields);
    this.client = new Together({
      apiKey: fields.apiKey || process.env.TOGETHER_API_KEY,
    });
    this.model = fields.model;
    this.streaming = fields.streaming ?? false;
    this.temperature = fields.temperature ?? 0.7;
    this.maxTokens = fields.maxTokens ?? 512;
  }

  _llmType() {
    return "together";
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
        stop: ["<|eot_id|>", "<|eom_id|>"],
        stream: false,
      });

      if (response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      throw new TogetherAPIError("Response content is undefined");
    } catch (error: any) {
      return error;
    }
  }

  async *_streamResponseChunks(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<GenerationChunk> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stop: ["<|eot_id|>", "<|eom_id|>"],
        stream: true,
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
        // Handle errors during stream processing
        if (streamError.name === "AbortError") {
          throw new TogetherAPIError("Stream was aborted");
        }
        throw new TogetherAPIError(
          `Stream processing error: ${streamError.message}`
        );
      }
    } catch (error: any) {
      console.error(error);
    }
  }
}
