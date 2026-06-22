import { NextRequest, NextResponse } from "next/server";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
];

function getAllowedHosts() {
  const hosts = new Set<string>();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      hosts.add(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname);
    } catch {
      // Ignore malformed optional config and fall back to explicit hosts.
    }
  }

  for (const host of (process.env.IMAGE_PROXY_ALLOWED_HOSTS || "").split(",")) {
    const normalized = host.trim().toLowerCase();
    if (normalized) hosts.add(normalized);
  }

  return hosts;
}

function isAllowedImageUrl(value: string) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (!["https:", "http:"].includes(parsed.protocol)) return false;
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname))) return false;

  const allowedHosts = getAllowedHosts();
  if (allowedHosts.size === 0) return parsed.protocol === "https:";
  return allowedHosts.has(parsed.hostname.toLowerCase());
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }
  if (!isAllowedImageUrl(url)) {
    return new NextResponse("Image host is not allowed", { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "RokkoCotizador/1.0" },
    });
    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: response.status });
    }

    const contentLength = Number(response.headers.get("Content-Length") || 0);
    const contentType = response.headers.get("Content-Type") || "image/png";
    if (contentLength > MAX_IMAGE_BYTES || !contentType.startsWith("image/")) {
      return new NextResponse("Unsupported image response", { status: 415 });
    }

    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      return new NextResponse("Image too large", { status: 413 });
    }

    const headers: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    };
    return new NextResponse(bytes, { headers });
  } catch {
    return new NextResponse("Error fetching image", { status: 502 });
  }
}

export const dynamic = "force-dynamic";
