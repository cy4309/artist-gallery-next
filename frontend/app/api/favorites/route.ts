import { toggleFavoriteAndNotify } from "@/services/server/favoriteService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

// import { toggleFavorite } from "@/services/favoriteService";
// import { pushFavoriteFlexMessage } from "@/services/line/messaging";

// export async function POST(req: Request) {
//   try {
//     const {
//       userId,
//       eventId,
//       lineUserId,
//       eventTitle,
//       imageUrl,
//       dateText,
//       locationText,
//       eventUrl,
//     } = await req.json();

//     const isFavorite = await toggleFavorite(userId, eventId);

//     if (isFavorite && lineUserId) {
//       console.log("[favorites api] pushing LINE message");

//       await pushFavoriteFlexMessage({
//         lineUserId,
//         title: eventTitle,
//         imageUrl,
//         dateText,
//         locationText,
//         eventUrl,
//       });
//     }

//     return Response.json({
//       success: true,
//       isFavorite,
//     });
//   } catch (err) {
//     console.error("[favorites api]", err);
//     return Response.json({ success: false }, { status: 500 });
//   }
// }
