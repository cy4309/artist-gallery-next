export const runtime = "nodejs";
// ❗ 這支 API 必須是 dynamic，否則 Next 在 build / dev 時
// 會嘗試做 static optimization，導致政府 API fetch 失敗（500）
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const ORG_API =
  "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindFestivalTypeJ";

export async function GET() {
  try {
    const res = await fetch(ORG_API, {
      // ✅ 用 Next 的 Data Cache + ISR revalidate， 10 分鐘快取，接下來10分鐘內的請求都直接用快取結果，fetch的內建 Server Cache
      next: { revalidate: 60 * 10 },
      // headers: {
      //   "User-Agent": "cyc-zine/1.0", // 🔥 很多政府 API 需要
      //   Accept: "application/json",
      // },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[/api/org] upstream not ok:", res.status, text);

      return NextResponse.json(
        { error: "ORG API failed", status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();

    // 可選：也能在 response header 告訴瀏覽器/代理層快取（不影響 Next 的 cache）
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=600, stale-while-revalidate=60",
      },
    });
  } catch (err: any) {
    console.error("[/api/org] error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// const ORG_API =
//   "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindFestivalTypeJ";

// export async function GET() {
//   try {
//     const res = await fetch(ORG_API, {
//       cache: "no-store", // 🔥 先別 cache，確保能跑
//       headers: {
//         "User-Agent": "cyc-zine/1.0", // 🔥 很多政府 API 需要
//         Accept: "application/json",
//       },
//     });

//     if (!res.ok) {
//       const text = await res.text();
//       console.error("[ORG API ERROR]", res.status, text);
//       return NextResponse.json(
//         { error: "ORG API failed", status: res.status },
//         { status: 502 }
//       );
//     }

//     const data = await res.json();

//     return NextResponse.json(data);
//   } catch (err: any) {
//     console.error("[/api/org] error", err);
//     return NextResponse.json(
//       { error: err?.message ?? "Internal error" },
//       { status: 500 }
//     );
//   }
// }
