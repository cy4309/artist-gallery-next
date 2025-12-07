import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;

  // 文化部查單筆（用 actId 過濾）
  const url =
    "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=6";

  const res = await fetch(url);
  const data = await res.json();

  const found = data.find(
    (item: any) => String(item.actId) === String(eventId)
  );

  if (!found) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ event: found });
}
