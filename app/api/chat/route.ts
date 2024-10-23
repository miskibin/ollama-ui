import { NextRequest, NextResponse } from "next/server";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  ChatMessage,
} from "@langchain/core/messages";
import { createSejmStatsTool } from "@/tools/sejmstats";
import {
  convertLangChainMessageToRPMessage,
  convertRPMessageToLangChainMessage,
} from "@/lib/utils";
import { TogetherLLM } from "@/lib/TogetherLLm";
import { AgentRP } from "@/lib/agent";
import { generateUniqueId } from "@/utils/common";
import { PluginNames } from "@/lib/plugins";
import { PlugIcon } from "lucide-react";
import { createWikipediaTool } from "@/tools/wikipedia";

const PLUGIN_MAPPING: Record<PluginNames, (model: TogetherLLM) => any> = {
  [PluginNames.SejmStats]: createSejmStatsTool,
  [PluginNames.Wikipedia]: createWikipediaTool,
};

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, enabledPluginIds, modelName } =
      await req.json();

    const langChainMessages: ChatMessage[] = [
      new SystemMessage(systemPrompt),
      ...messages,
    ].map(convertRPMessageToLangChainMessage);

    const llm = new TogetherLLM({
      apiKey: process.env.TOGETHER_API_KEY!,
      model: modelName,
      streaming: true,
      temperature: 0.7,
    });
    const plugins = enabledPluginIds.map((id: PluginNames) =>
      PLUGIN_MAPPING[id](llm)
    );

    const agent = new AgentRP({
      llm,
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
          error: error instanceof Error ? error.message : "An error occurred",
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "OK" });
}
