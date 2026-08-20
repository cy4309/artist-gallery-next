import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fetchCultureImageResponse } from "@/services/server/orgDataServer";
import { fetchOrgEventByRouteId } from "@/services/server/eventsServer";
import { decodeEventPathId } from "@/utils/eventId";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getPlaceholderImage(): Promise<Response> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "images",
    "placeholder-no-image.png",
  );
  const buffer = await readFile(filePath);

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "public, max-age=86400",
    },
  });
}

async function fetchEventImage(imageUrl: string): Promise<Response | null> {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    try {
      const res = await fetch(imageUrl, { cache: "no-store" });
      if (res.ok) return res;
    } catch {
      // fallthrough
    }
  }

  return fetchCultureImageResponse(imageUrl);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = decodeEventPathId(rawId);

  try {
    const event = await fetchOrgEventByRouteId(id);
    if (!event?.imageUrl) {
      return getPlaceholderImage();
    }

    const upstream = await fetchEventImage(event.imageUrl);
    if (!upstream) {
      return getPlaceholderImage();
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return getPlaceholderImage();
  }
}
