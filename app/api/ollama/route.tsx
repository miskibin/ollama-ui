// app/api/ollama/route.ts
import { NextResponse } from "next/server";

type OllamaRequestBody = {
  model: string;
  prompt: string;
  template?: string;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
  };
};

export async function POST(request: Request) {
  const { model, prompt, template, options } =
    (await request.json()) as OllamaRequestBody;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: template ? `${template}\n\n${prompt}` : prompt,
        options,
      }),
    });

    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body!.getReader();
        let accumulatedResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.trim() !== "") {
              try {
                const data = JSON.parse(line);
                accumulatedResponse += data.response;
                controller.enqueue(encoder.encode(data.response));

                if (data.done) {
                  controller.close();
                  return;
                }
              } catch (jsonError) {
                console.error("JSON Parse Error:", jsonError);
                console.error("Invalid line:", line);
              }
            }
          }
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch("http://localhost:11434/api/tags");
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching models." },
      { status: 500 }
    );
  }
}
