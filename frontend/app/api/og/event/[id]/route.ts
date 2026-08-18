import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  fetchCultureImageResponse,
  fetchOrgEventById,
} from "@/services/server/orgDataServer";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const event = await fetchOrgEventById(id);
    if (!event?.imageUrl) {
      return getPlaceholderImage();
    }

    const upstream = await fetchCultureImageResponse(event.imageUrl);
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
