import { NextRequest, NextResponse } from "next/server";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createSejmStatsTool } from "@/tools/sejmstats";
import { TogetherLLM } from "@/lib/TogetherLLm";
import { PROMPTS } from "@/tools/sejmstats-prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const llm = new TogetherLLM({
  apiKey: process.env.TOGETHER_API_KEY!,
  model: "meta-llama/Llama-Vision-Free",
});

const processData = async (
  data: any[],
  question: string,
  model: TogetherLLM
) => {
  const dataString = JSON.stringify(data);
  const answer = await PROMPTS.processData
    .pipe(model)
    .pipe(new StringOutputParser())
    .invoke({ question, dataString });
  return answer;
};

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, memoryVariables, stream, isPluginEnabled } =
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

    const lastUserMessage = messages[messages.length - 1].content;

    const encoder = new TextEncoder();

    const AIstream = new ReadableStream({
      async start(controller) {
        try {
          if (isPluginEnabled) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  pluginData: "Zapytajmy sejm-stats...",
                })}\n\n`
              )
            );

            const { question, data } = await sejmStatsTool.invoke({
              question: lastUserMessage,
            });
            console.log("Received data:", data);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  status: "plugin_data_fetched",
                  pluginData: data,
                })}\n\n`
              )
            );

            console.log("Processing data...");
            const answer = await processData(data, question, llm);

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  status: "plugin_completed",
                })}\n\n`
              )
            );

            // Stream the processed answer
            for (const char of answer) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ response: char })}\n\n`
                )
              );
            }
          } else {
            const streamingResponse = await llm.stream(langChainMessages);

            for await (const chunk of streamingResponse) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ response: chunk })}\n\n`
                )
              );
            }
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
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "OK", model: llm.model });
}
