// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { PluginNames } from "@/lib/plugins";
import { createWikipediaSearchChain } from "@/tools/wikipedia";
import { createSejmStatsTool } from "@/tools/sejmstats";
import { TogetherLLM } from "@/lib/TogetherLLm";

const pluginChainCreators = {
  [PluginNames.Wikipedia]: createWikipediaSearchChain,
  [PluginNames.SejmStats]: createSejmStatsTool,
};

// Initialize the TogetherLLM
const llm = new TogetherLLM({
  apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY!,
  model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
});

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, plugins, memoryVariables, stream } =
      await req.json();
    console.log("Messages:", memoryVariables);
    const enabledPlugin = plugins.find((plugin: any) => plugin.enabled);
    let pluginChain = null;

    if (enabledPlugin) {
      const createPluginChain =
        pluginChainCreators[enabledPlugin.name as PluginNames];
      if (createPluginChain) {
        pluginChain = createPluginChain(llm, () => {});
      }
    }

    const langChainMessages = [
      new SystemMessage(systemPrompt || "You are a helpful assistant."),
      ...(Array.isArray(memoryVariables)
        ? memoryVariables
        : [new AIMessage(memoryVariables || "")]),
      ...messages.map((msg: any) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        } else {
          const content = msg.pluginData
            ? `${msg.content}\n\nPlugin Data: ${msg.pluginData}`
            : msg.content;
          return new AIMessage(content);
        }
      }),
    ];

    if (stream) {
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
      let response;
      if (enabledPlugin && pluginChain) {
        const lastUserMessage = messages[messages.length - 1].content;
        response = await pluginChain.invoke({ question: lastUserMessage });
      } else {
        response = await llm.invoke(langChainMessages);
      }

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
