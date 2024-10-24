import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

const MAX_LENGTH = 50000;

function trimText(text: string, maxLength: number = MAX_LENGTH): string {
  if (text.length <= maxLength) return text;

  // Find the last complete sentence within the limit
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastQuestion = truncated.lastIndexOf("?");
  const lastExclamation = truncated.lastIndexOf("!");

  // Find the last sentence ending
  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);

  if (lastSentenceEnd === -1) {
    // If no sentence ending found, cut at the last space
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace === -1 ? truncated : truncated.substring(0, lastSpace);
  }

  return truncated.substring(0, lastSentenceEnd + 1);
}
function formatToMarkdown(text: string): string {
  // First trim the text if it's too long
  const trimmedText = trimText(text);

  // Remove multiple consecutive dots (keeping ellipsis if exactly three dots)
  const cleanedText = trimmedText.replace(/\.{4,}/g, ".");

  const lines = cleanedText.split("\n").map((line) => line.trim());
  let markdown = "";
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\.{4,}/g, "."); // Also clean each line individually
    // Handle headers
    if (line.match(/^[A-Z][\w\s]{0,20}$/)) {
      markdown += `\n## ${line}\n\n`;
      continue;
    }
    // Handle bullet points
    if (line.startsWith("•") || line.startsWith("-")) {
      if (!inList) {
        markdown += "\n";
        inList = true;
      }
      markdown += `${line}\n`;
      continue;
    }
    // Handle numbered lists
    if (line.match(/^\d+\./)) {
      if (!inList) {
        markdown += "\n";
        inList = true;
      }
      markdown += `${line}\n`;
      continue;
    }
    // End list if encountered non-list item
    if (
      inList &&
      !line.startsWith("•") &&
      !line.startsWith("-") &&
      !line.match(/^\d+\./)
    ) {
      markdown += "\n";
      inList = false;
    }
    // Handle paragraphs
    if (line.length > 0) {
      markdown += `${line} `;
    } else if (markdown.slice(-2) !== "\n\n") {
      markdown += "\n\n";
    }
  }

  return markdown
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+$/gm, "")
    .replace(/\.{4,}/g, ".")
    .trim();
}
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("File received:", file.name, "Size:", file.size, "bytes");

    const arrayBuffer = await file.arrayBuffer();
    console.log("ArrayBuffer size:", arrayBuffer.byteLength, "bytes");

    const uint8Array = new Uint8Array(arrayBuffer);
    console.log("Uint8Array length:", uint8Array.length);

    try {
      const data = await pdf(uint8Array as Buffer);
      console.log("PDF parsed successfully. Text length:", data.text.length);

      const markdown = formatToMarkdown(data.text);
      const wasTrimmed = data.text.length > MAX_LENGTH;

      return NextResponse.json({
        markdown,
        wasTrimmed,
        originalLength: data.text.length,
        trimmedLength: markdown.length,
      });
    } catch (pdfError) {
      console.error("Error in pdf-parse:", pdfError);
      return NextResponse.json(
        { error: "Failed to parse PDF content" },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
