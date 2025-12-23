import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/server/authService";
import { GAS_ACTION } from "@/types/gas/actionConstants";

const GAS_URL = process.env.GAS_URL!;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ favorites: [] });
    }

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: GAS_ACTION.LIST_FAVORITES,
        userId: user.id,
      }),
    });

    if (!res.ok) {
      throw new Error("GAS listFavorites failed");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[/api/favorites/list]", err);
    return NextResponse.json({ favorites: [] }, { status: 500 });
  }
}

// export const dynamic = "force-dynamic"; // 強制這支 route 每次請求都「動態執行」，不要被預先快取或當成 static。
// export const runtime = "nodejs"; // 這支 route 要跑在 Node.js Runtime，而不是 Edge Runtime。

// import { NextResponse } from "next/server";
// import { listFavorites } from "@/services/repo/favoriteRepo";
// import { getCurrentUser } from "@/services/server/authService";

// export async function GET() {
//   try {
//     const user = await getCurrentUser();

//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const data = await listFavorites(user.id);
//     return NextResponse.json({ success: true, ...data });
//   } catch (err: any) {
//     console.error("[/api/favorites/list] ERROR:", err);
//     return NextResponse.json(
//       {
//         success: false,
//         error: err?.message || String(err),
//       },
//       { status: 500 }
//     );
//   }
// }
