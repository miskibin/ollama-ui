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
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new TogetherLLM({
  apiKey: process.env.TOGETHER_API_KEY!,
  model: "meta-llama/Llama-Vision-Free",
});

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
    const answer = await PROMPTS.processDataPrompt
      .pipe(model)
      .pipe(new StringOutputParser())
      .invoke({ question, dataString });
    console.debug("Data processed successfully");
    return answer;
  } catch (error) {
    console.error("Error in processData:", error);
    throw error;
  }
};

export async function POST(req: NextRequest) {
  console.debug("POST request received");
  try {
    const { messages, systemPrompt, memoryVariables, stream, isPluginEnabled } =
      await req.json();
    console.debug("Request parsed successfully");

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

            const answer = await processData(data, question, llm);
            console.debug("Data processed, answer length:", answer.length);

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  status: "plugin_completed",
                })}\n\n`
              )
            );

            for (const char of answer) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ response: char })}\n\n`
                )
              );
            }
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
      cancel() {
        console.debug("Stream cancelled by the client");
      },
    });

    console.debug("Returning AIstream response");
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
