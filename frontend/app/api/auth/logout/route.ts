import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // 刪除 cyc_session cookie
  cookieStore.delete("cyc_session");

  // 回傳成功訊息
  return NextResponse.json({ message: "Logged out" });
}
