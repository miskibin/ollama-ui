"use server";
import { NextRequest, NextResponse } from "next/server";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createSejmStatsTool } from "@/tools/sejmstats";
import { TogetherLLM } from "@/lib/TogetherLLm";
import { PROMPTS } from "@/tools/sejmstats-prompts";

const processData = async (
  data: any[],
  question: string,
  model: TogetherLLM
) => {
  try {
    console.debug("Processing data with input:", {
      question,
      dataLength: data.length,
    });
    const dataString = JSON.stringify(data);
    const streamingResponse = await PROMPTS.processDataPrompt
      .pipe(model)
      .stream({
        question,
        dataString,
      });
    console.debug("Data processed successfully");
    return streamingResponse;
  } catch (error) {
    console.error("Error in processData:", error);
    throw error;
  }
};

export async function POST(req: NextRequest) {
  console.debug("POST request received");
  try {
    const {
      messages,
      systemPrompt,
      memoryVariables,
      stream,
      isPluginEnabled,
      modelName,
    } = await req.json();
    console.debug("Request parsed successfully", modelName);
    const llm = new TogetherLLM({
      apiKey: process.env.TOGETHER_API_KEY!,
      model: modelName,
    });
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
            console.debug("Plugin enabled, invoking sejmStatsTool");
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
            console.debug(
              "Received data from sejmStatsTool:",
              data.length,
              "items"
            );
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  status: "plugin_data_fetched",
                  pluginData: data,
                })}\n\n`
              )
            );

            const streamingResponse = await processData(data, question, llm);
            console.debug("Starting to stream processed data");

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  status: "plugin_processing",
                })}\n\n`
              )
            );

            for await (const chunk of streamingResponse) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ response: chunk })}\n\n`
                )
              );
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  status: "plugin_completed",
                })}\n\n`
              )
            );
          } else {
            console.debug("Plugin disabled, streaming LLM response");
            const streamingResponse = await llm.stream(langChainMessages);

            for await (const chunk of streamingResponse) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ response: chunk })}\n\n`
                )
              );
            }
          }
          console.debug("Streaming completed successfully");
        } catch (error) {
          console.error("Error in streaming:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
      cancel() {},
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
  return NextResponse.json({ status: "OK" });
}
