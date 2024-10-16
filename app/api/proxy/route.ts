import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  console.log(url);
  const targetUrl = `https://api.together.xyz${url.pathname.replace(
    "/api/proxy",
    ""
  )}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  // Add your API key here
  headers.set("Authorization", `Bearer ${process.env.TOGETHER_API_KEY}`);

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
    });

    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Proxy error", { status: 500 });
  }
}
