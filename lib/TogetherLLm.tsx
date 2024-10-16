import { LLM, BaseLLMParams } from "@langchain/core/language_models/llms";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { GenerationChunk } from "@langchain/core/outputs";
import Together from "together-ai";

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
  topP: number;
  topK: number;
  repetitionPenalty: number;
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
    this.topP = fields.topP ?? 0.7;
    this.topK = fields.topK ?? 50;
    this.repetitionPenalty = fields.repetitionPenalty ?? 1;
  }

  _llmType() {
    return "together";
  }

  async _call(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      top_p: this.topP,
      top_k: this.topK,
      repetition_penalty: this.repetitionPenalty,
      stop: ["<|eot_id|>", "<|eom_id|>"],
      stream: false,
    });

    if (response.choices[0]?.message?.content) {
      return response.choices[0].message.content;
    }
    throw new Error("Response content is undefined");
  }

  async *_streamResponseChunks(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<GenerationChunk> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      top_p: this.topP,
      top_k: this.topK,
      repetition_penalty: this.repetitionPenalty,
      stop: ["<|eot_id|>", "<|eom_id|>"],
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        const text = chunk.choices[0].delta.content;
        yield new GenerationChunk({ text });
        await runManager?.handleLLMNewToken(text);
      }
    }
  }
}
