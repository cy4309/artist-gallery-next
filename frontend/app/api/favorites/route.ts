import { toggleFavorite } from "@/services/favoriteService";
import { pushLineTextMessage } from "@/services/line/messaging";

export async function POST(req: Request) {
  try {
    const { userId, lineUserId, eventId, eventTitle } = await req.json();

    await toggleFavorite(userId, eventId);

    if (lineUserId) {
      await pushLineTextMessage({
        lineUserId,
        text: `❤️ 已加入收藏\n${eventTitle}`,
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[favorites api]", err);
    return Response.json({ success: false }, { status: 500 });
  }
}
