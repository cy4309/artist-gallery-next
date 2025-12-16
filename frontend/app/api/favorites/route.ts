import { toggleFavorite } from "@/services/favoriteService";
import { pushFavoriteFlexMessage } from "@/services/line/messaging";

export async function POST(req: Request) {
  try {
    const {
      userId,
      lineUserId,
      eventId,
      eventTitle,
      imageUrl,
      dateText,
      locationText,
      eventUrl,
    } = await req.json();

    const baseUrl = process.env.PUBLIC_BASE_URL;
    const orgBaseUrl = "http://cloud.culture.tw";
    const flexImageUrl = imageUrl
      ? `${baseUrl}/api/image-proxy?url=${encodeURIComponent(
          `${orgBaseUrl}${imageUrl}`
        )}`
      : undefined;

    const isFavorite = await toggleFavorite(userId, eventId);

    if (isFavorite && lineUserId) {
      console.log("[favorites api] pushing LINE message");

      await pushFavoriteFlexMessage({
        lineUserId,
        title: eventTitle,
        imageUrl: flexImageUrl,
        dateText,
        locationText,
        eventUrl,
      });
    }

    return Response.json({
      success: true,
      isFavorite,
    });
  } catch (err) {
    console.error("[favorites api]", err);
    return Response.json({ success: false }, { status: 500 });
  }
}
