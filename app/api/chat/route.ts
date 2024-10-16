import { NextRequest, NextResponse } from "next/server";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createSejmStatsTool } from "@/tools/sejmstats";
import { TogetherLLM } from "@/lib/TogetherLLm";

const llm = new TogetherLLM({
  apiKey: process.env.TOGETHER_API_KEY!,
  model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
});

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, memoryVariables, stream } =
      await req.json();
    console.log("Memory Variables:", memoryVariables);

    const sejmStatsTool = createSejmStatsTool(llm);
    const langChainMessages = [
      new SystemMessage(systemPrompt || "You are a helpful assistant."),
      ...(Array.isArray(memoryVariables)
        ? memoryVariables
        : [new AIMessage(memoryVariables || "")]),
      ...messages.map((msg: any) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      }),
    ];

    if (stream && false) {
      const encoder = new TextEncoder();

      const AIstream = new ReadableStream({
        async start(controller) {
          try {
            const streamingResponse = await llm.stream(langChainMessages);

            for await (const chunk of streamingResponse) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ response: chunk })}\n\n`
                )
              );
            }
          } catch (error) {
            console.error("Error in streaming:", error);
            controller.error(error);
          } finally {
            controller.close();
          }
        },
        cancel() {
          console.log("Stream cancelled by the client");
        },
      });

      return new NextResponse(AIstream, {
        headers: { "Content-Type": "text/event-stream" },
      });
    } else {
      console.log("Starting field selection...");
      const lastUserMessage = messages[messages.length - 1].content;
      const response = await sejmStatsTool.invoke({
        question: lastUserMessage,
      });

      return NextResponse.json({ response });
    }
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "OK", model: llm.model });
}
