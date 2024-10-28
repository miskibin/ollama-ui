import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};
// 
const MAX_LENGTH = 10000 * 4; // 1 token = 4 chars.  10k tokens = 0.0015$ = 0.0060PLN
// 10 requests = 0.06PLN 
function trimText(text: string, maxLength: number = MAX_LENGTH): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastQuestion = truncated.lastIndexOf("?");
  const lastExclamation = truncated.lastIndexOf("!");
  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
  return lastSentenceEnd === -1 
    ? truncated.substring(0, truncated.lastIndexOf(" ") || maxLength)
    : truncated.substring(0, lastSentenceEnd + 1);
}

function formatToMarkdown(text: string): string {
  const trimmedText = trimText(text);
  const cleanedText = trimmedText.replace(/\.{4,}/g, ".");
  const lines = cleanedText.split("\n").map((line) => line.trim());
  let markdown = "";
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\.{4,}/g, ".");
    if (line.match(/^[A-Z][\w\s]{0,20}$/)) {
      markdown += `\n## ${line}\n\n`;
      continue;
    }
    if (line.startsWith("•") || line.startsWith("-")) {
      if (!inList) {
        markdown += "\n";
        inList = true;
      }
      markdown += `${line}\n`;
      continue;
    }
    if (line.match(/^\d+\./)) {
      if (!inList) {
        markdown += "\n";
        inList = true;
      }
      markdown += `${line}\n`;
      continue;
    }
    if (inList && !line.startsWith("•") && !line.startsWith("-") && !line.match(/^\d+\./)) {
      markdown += "\n";
      inList = false;
    }
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
    // Check content length before processing
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json({ 
        error: "File too large. Maximum size is 50MB." 
      }, { status: 413 });
    }

    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) { // Double-check size after getting the file
      return NextResponse.json({ 
        error: "File too large. Maximum size is 50MB." 
      }, { status: 413 });
    }

    console.log("Processing file:", file.name, "Size:", file.size, "bytes");

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    try {
      const data = await pdf(uint8Array as Buffer);
      const markdown = formatToMarkdown(data.text);
      
      return NextResponse.json({
        markdown,
        wasTrimmed: data.text.length > MAX_LENGTH,
        originalLength: data.text.length,
        trimmedLength: markdown.length,
        fileName: file.name,
      });
    } catch (pdfError) {
      console.error("PDF parsing error:", pdfError);
      return NextResponse.json({ 
        error: "Failed to parse PDF content",
        details: pdfError instanceof Error ? pdfError.message : 'Unknown error'
      }, { status: 422 });
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json({ 
      error: "Failed to process request",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}