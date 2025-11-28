import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies(); // ← 需要 await！
  const session = cookieStore.get("cyc_session");

  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = JSON.parse(session.value);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
