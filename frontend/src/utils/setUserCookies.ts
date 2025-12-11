import { NextResponse } from "next/server";

export function setUserCookies(res: NextResponse, user: any) {
  const isProd = process.env.NODE_ENV === "production";

  const json = JSON.stringify(user);

  res.cookies.set("cyc_session", json, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  res.cookies.set("cyc_user", json, {
    httpOnly: false,
    sameSite: "lax",
    secure: isProd,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
