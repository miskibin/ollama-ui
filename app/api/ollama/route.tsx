import { NextResponse } from "next/server";

export type OllamaRequestBody = {
  model: string;
  prompt: string;
  system?: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    seed?: number;
    repeat_penalty?: number;
  };
};

export async function POST(request: Request) {
  const { model, prompt, system, stream, options } =
    (await request.json()) as OllamaRequestBody;
  console.log("model: ",model)
  console.log("prompt:", prompt)
  console.log("system:", system)
  console.log("options:", options)
  const ollamaController = new AbortController();

  try {
    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        system,
        prompt,
        stream,
        options,
      }),
      signal: ollamaController.signal,
    });

    if (!stream) {
      // Handle non-streaming response
      const data = await ollamaResponse.json();
      console.log(data)
      return NextResponse.json(data);
    }

    // Handle streaming response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const AIstream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body!.getReader();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line) {
              try {
                const data = JSON.parse(line);
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

          buffer = lines[lines.length - 1];
        }
      },
      cancel() {
        console.log("Stream cancelled by the client");
        ollamaController.abort();
      },
    });

    return new NextResponse(AIstream);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Ollama request was aborted");
    } else {
      console.error("Error in Ollama request:", error);
    }
    return NextResponse.json(
      { error: "An error occurred while processing the request." },
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
