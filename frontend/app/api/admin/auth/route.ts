import { NextRequest, NextResponse } from "next/server";
import {
  adminCookieName,
  getAdminSecret,
  isAdminAuthenticated,
} from "@/services/server/adminAuth";

export async function GET() {
  const ok = await isAdminAuthenticated();
  return NextResponse.json({
    ok,
    backend: process.env.DATA_BACKEND || "auto",
  });
}

export async function POST(req: NextRequest) {
  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_SECRET not configured" },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    secret?: string;
  } | null;
  if (!body?.secret || body.secret !== secret) {
    return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
