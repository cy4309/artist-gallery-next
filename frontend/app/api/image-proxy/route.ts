// 因為政府舊寫法圖片可能會有http，但在https環境會強迫https，因此自己寫一個proxy來處理
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "ArtistGalleryBot/1.0 (+https://artistgallery.tw)",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return new Response("Image fetch failed", { status: 404 });
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType && !contentType.startsWith("image/")) {
      return new Response("Not an image", { status: 415 });
    }
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    return new Response("Proxy error", { status: 500 });
  }
}
