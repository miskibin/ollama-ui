import { NextRequest, NextResponse } from "next/server";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createSejmStatsTool } from "@/tools/sejmstats";
import { PROMPTS } from "@/tools/sejmstats-prompts";
import {
  convertLangChainMessageToRPMessage,
  convertRPMessageToLangChainMessage,
} from "@/lib/utils";
import { TogetherLLM } from "@/lib/TogetherLLm";
import { AgentRP } from "@/lib/agent";

const AGENT_SYSTEM_TEMPLATE = `You are Polish laywer and you are helping a friend who is a journalist. You never answer if you are not sure.
If you don't know how to answer a question, use the available tools to look up relevant information. You should particularly do this for questions about Polish parliament.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, isPluginEnabled, modelName } =
      await req.json();

    // Convert incoming messages to LangChain format
    const langChainMessages = [
      new SystemMessage(systemPrompt || AGENT_SYSTEM_TEMPLATE),
      ...messages.map(convertRPMessageToLangChainMessage),
    ];

    // Initialize LLM
    const llm = new TogetherLLM({
      apiKey: process.env.TOGETHER_API_KEY!,
      model: modelName,
      streaming: true, // Enable streaming
      temperature: 0.7,
    });

    // Create tools
    const sejmStatsTool = createSejmStatsTool(llm);

    // Initialize agent
    const agent = new AgentRP({
      llm,
      tools: [sejmStatsTool],
    });

    // Create a TransformStream for streaming the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start the agent execution in the background
    (async () => {
      try {
        let fullContent = "";

        // Process each chunk from the agent
        for await (const chunk of agent.invoke(langChainMessages)) {
          // Convert chunk to your response format
          const responseChunk = {
            messages: [convertLangChainMessageToRPMessage(chunk)],
          };

          // Accumulate content for tools execution messages
          if (chunk.content.includes("Executed")) {
            fullContent += chunk.content + "\n";
            continue;
          }

          // Write the chunk to the stream
          await writer.write(
            encoder.encode(`data: ${JSON.stringify(responseChunk)}\n\n`)
          );
        }

        // Close the stream
        await writer.close();
      } catch (error) {
        // Handle any errors during streaming
        const errorMessage = {
          error: error instanceof Error ? error.message : "An error occurred",
        };
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`)
        );
        await writer.close();
      }
    })();

    // Return the streaming response
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
