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

const AGENT_SYSTEM_TEMPLATE = `You are Polish laywer and you are helping a friend who is a journalist. You never answer if you are not sure.
If you don't know how to answer a question, use the available tools to look up relevant information. You should particularly do this for questions about Polish parliament.`;
export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, _, modelName } =
      await req.json();

    const langChainMessages = [
      new SystemMessage(systemPrompt || AGENT_SYSTEM_TEMPLATE),
      ...messages.map(convertRPMessageToLangChainMessage),
    ];

    const llm = new TogetherLLM({
      apiKey: process.env.TOGETHER_API_KEY!,
      model: modelName,
      streaming: true,
      temperature: 0.7,
    });

    const sejmStatsTool = createSejmStatsTool(llm);
    const agent = new AgentRP({
      llm,
      tools: [sejmStatsTool],
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
