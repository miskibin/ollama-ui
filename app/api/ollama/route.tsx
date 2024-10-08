import { NextResponse } from "next/server";

type OllamaRequestBody = {
  model: string;
  prompt: string;
  system?: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;

    repeat_penalty?: number;
  };
};

export async function POST(request: Request) {
  const { model, prompt, system, stream, options } =
    (await request.json()) as OllamaRequestBody;
  console.log(model, prompt, system, stream, options)
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let ollamaController: AbortController | null = null;

  const AIstream = new ReadableStream({
    async start(controller) {
      ollamaController = new AbortController();
      try {
        const ollamaResponse = await fetch(
          "http://localhost:11434/api/generate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model,
              system: system,
              prompt: prompt,
              stream: stream,
              options,
            }),
            signal: ollamaController.signal,
          }
        );

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
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Ollama request was aborted");
        } else {
          console.error("Error in Ollama stream:", error);
          controller.error(error);
        }
      } finally {
        if (ollamaController) {
          ollamaController.abort();
        }
      }
    },
    cancel() {
      console.log("Stream cancelled by the client");
      if (ollamaController) {
        ollamaController.abort();
      }
    },
  });

  return new NextResponse(AIstream);
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
