import { NextRequest, NextResponse } from "next/server";
import { SystemMessage, ChatMessage } from "@langchain/core/messages";
import { OpenAI } from "@langchain/openai";
import { createSejmStatsTool } from "@/tools/sejmstats";
import { convertRPMessageToLangChainMessage } from "@/lib/utils";
import { TogetherAPIError, TogetherLLM } from "@/lib/llms/TogetherLLm";
import { AgentRP } from "@/lib/agent";
import { generateUniqueId } from "@/utils/common";
import { PluginNames } from "@/lib/plugins";
import { createWikipediaTool } from "@/tools/wikipedia";
import { OpenAILLM } from "@/lib/llms/OpenAILLm";
import { AbstractLLM } from "@/lib/llms/LLM";
const MAX_CHUNK_SIZE = 4000;
const PLUGIN_MAPPING: Record<PluginNames, (model: TogetherLLM) => any> = {
  [PluginNames.SejmStats]: createSejmStatsTool,
  [PluginNames.Wikipedia]: createWikipediaTool,
};

function createLLM(modelName: string, options: any) {
  if (modelName.startsWith("gpt")) {
    return new OpenAILLM({
      apiKey: process.env.OPENAI_API_KEY!,
      model: modelName,
      ...options,
    });
  }

  return new TogetherLLM({
    apiKey: process.env.TOGETHER_API_KEY!,
    model: modelName,
    ...options,
  });
}
function splitIntoChunks(content: string, maxSize: number): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  // Split by newlines while preserving them
  const lines = content.split(/(\n)/);

  for (const part of lines) {
    if ((currentChunk + part).length > maxSize) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      // If single part is longer than maxSize, split it while preserving words
      if (part.length > maxSize) {
        let remainingText = part;
        while (remainingText.length > 0) {
          // Find last space within maxSize limit
          let splitIndex = maxSize;
          if (remainingText.length > maxSize) {
            splitIndex = remainingText.lastIndexOf(" ", maxSize);
            if (splitIndex === -1) splitIndex = maxSize; // If no space found, split at maxSize
          }

          chunks.push(remainingText.slice(0, splitIndex));
          remainingText = remainingText.slice(splitIndex).trimStart();
        }
      } else {
        currentChunk = part;
      }
    } else {
      currentChunk += part;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function writeChunkedResponse(
  writer: WritableStreamDefaultWriter,
  type: string,
  content: string,
  artifacts?: any[],
  data?: any[]
) {
  const chunks = splitIntoChunks(content, MAX_CHUNK_SIZE);
  const encoder = new TextEncoder();

  for (let i = 0; i < chunks.length; i++) {
    const isLastChunk = i === chunks.length - 1;
    const response = {
      type,
      messages: [
        {
          id: generateUniqueId(),
          role: "assistant" as const,
          content: chunks[i],
          // Only include artifacts and data in the last chunk
          ...(isLastChunk && artifacts ? { artifacts } : {}),
          ...(isLastChunk && data ? { data } : {}),
        },
      ],
    };

    await writer.write(
      encoder.encode("data: " + JSON.stringify(response) + "\n\n")
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const referer = req.headers.get("referer");
    const expectedReferer = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    if (!referer || !referer.startsWith(expectedReferer || "")) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    const { messages, systemPrompt, enabledPluginIds, modelName, options } =
      await req.json();
    const langChainMessages: ChatMessage[] = [
      new ChatMessage({ role: "system", content: systemPrompt }),
      ...messages.map(convertRPMessageToLangChainMessage),
    ];

    const llm = createLLM(modelName, options);
    const plugins = enabledPluginIds.map((id: PluginNames) =>
      PLUGIN_MAPPING[id](llm as TogetherLLM)
    );
    const agent = new AgentRP(llm as AbstractLLM, plugins, true);

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    (async () => {
      try {
        for await (const progress of agent.invoke(langChainMessages)) {
          switch (progress.type) {
            case "status":
            case "response":
              await writeChunkedResponse(
                writer,
                progress.type,
                progress.content
              );
              break;

            case "tool_execution":
              await writeChunkedResponse(
                writer,
                progress.type,
                progress.content,
                progress.artifacts,
                progress.data
              );
              break;
          }
        }

        await writer.close();
      } catch (error) {
        const errorMessage = {
          type: "error",
          error:
            error instanceof TogetherAPIError
              ? `API Error: ${error.message}${
                  error.statusCode ? ` (Status: ${error.statusCode})` : ""
                }`
              : error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        };
        await writer.write(
          new TextEncoder().encode(`data: ${JSON.stringify(errorMessage)}\n\n`)
        );
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      {
        error:
          error instanceof TogetherAPIError
            ? `API Error: ${error.message}`
            : "Internal server error",
      },
      {
        status:
          error instanceof TogetherAPIError ? error.statusCode || 500 : 500,
      }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "OK" });
}
