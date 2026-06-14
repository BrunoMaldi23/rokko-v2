import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "RokkoCotizador/1.0" },
    });
    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: response.status });
    }
    const blob = await response.blob();
    const headers: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": response.headers.get("Content-Type") || "image/png",
      "Cache-Control": "public, max-age=86400",
    };
    return new NextResponse(blob, { headers });
  } catch {
    return new NextResponse("Error fetching image", { status: 502 });
  }
}

export const dynamic = "force-dynamic";
