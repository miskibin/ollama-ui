import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { GenerationChunk } from "@langchain/core/outputs";
import Together from "together-ai";
import { ChatMessage } from "@langchain/core/messages";
import { AbstractLLM, AbstractLLMInput } from "./LLM";

// Custom error class for Together-related issues
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

interface TogetherLLMInput extends AbstractLLMInput {
  topP?: number;
  topK?: number;
  repetitionPenalty?: number;
}

export class TogetherLLM extends AbstractLLM {
  private client: Together;
  private topP?: number;
  private topK?: number;
  private repetitionPenalty?: number;
  private readonly stopTokens: string[] = ["<|eot_id|>", "<|eom_id|>"];

  constructor(fields: TogetherLLMInput) {
    super(fields);
    this.client = new Together({
      apiKey: fields.apiKey || process.env.TOGETHER_API_KEY,
    });
    this.topP = fields.topP;
    this.topK = fields.topK;
    this.repetitionPenalty = fields.repetitionPenalty;
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
        top_p: this.topP,
        top_k: this.topK,
        repetition_penalty: this.repetitionPenalty,
        stop: this.stopTokens,
        stream: false,
      });

      if (response.choices[0]?.message?.content) {
        return response.choices[0].message.content;
      }
      throw new TogetherAPIError("Response content is undefined");
    } catch (error: any) {
      if (error instanceof Error) {
        throw new TogetherAPIError(error.message);
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
      const togetherMessages = this.convertMessagesToJSON(messages);
      console.log("Debug messages", togetherMessages);

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: togetherMessages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: this.topP,
        top_k: this.topK,
        repetition_penalty: this.repetitionPenalty,
        stop: this.stopTokens,
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
        if (streamError.name === "AbortError") {
          throw new TogetherAPIError("Stream was aborted");
        }
        throw new TogetherAPIError(
          `Stream processing error: ${streamError.message}`
        );
      }
    } catch (error: any) {
      if (error instanceof Error) {
        throw new TogetherAPIError(error.message);
      }
      throw error;
    }
  }
}
