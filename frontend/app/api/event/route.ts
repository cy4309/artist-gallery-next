import { NextResponse } from "next/server";

export async function GET() {
  const url =
    "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=6";

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json({ events: data });
}
