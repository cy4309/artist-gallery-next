import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const cookie = req.cookies.get("cyc_session");

  if (!cookie) return NextResponse.json({ user: null });

  try {
    const user = JSON.parse(cookie.value);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
