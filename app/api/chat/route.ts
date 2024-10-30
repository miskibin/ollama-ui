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
    console.log(messages);
    const llm = createLLM(modelName, options);
    const plugins = enabledPluginIds.map((id: PluginNames) =>
      PLUGIN_MAPPING[id](llm as TogetherLLM)
    );
    const agent = new AgentRP({
      llm: llm as AbstractLLM,
      tools: plugins,
    });

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        for await (const progress of agent.invoke(langChainMessages)) {
          const response = {
            type: progress.type,
            messages: [
              {
                id: generateUniqueId(),
                role: "assistant" as const,
                content: progress.content,
                artifacts: progress.artifacts || [],
              },
            ],
          };

          await writer.write(
            encoder.encode(`data: ${JSON.stringify(response)}\n\n`)
          );
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
          encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`)
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
