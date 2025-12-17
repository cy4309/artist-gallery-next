import { toggleFavoriteAndNotify } from "@/services/server/favoriteService";
import type { ToggleFavoritePayload } from "@/types/favorite";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ToggleFavoritePayload;

    const result = await toggleFavoriteAndNotify(body);

    return Response.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error("[favorites api]", err);
    return Response.json({ success: false }, { status: 500 });
  }
}
