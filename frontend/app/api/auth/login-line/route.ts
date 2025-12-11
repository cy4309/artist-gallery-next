import { NextResponse } from "next/server";
import axios from "axios";
import { setUserCookies } from "@/utils/setUserCookies";

const NEXT_PUBLIC_GAS_URL = process.env.NEXT_PUBLIC_GAS_URL!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId, displayName, pictureUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing LINE userId" },
        { status: 400 }
      );
    }

    /** ----------------------------------------
     * STEP 1 — Normalize LINE User
     * -------------------------------------- */
    const normalizedUser = {
      id: `line_${userId}`,
      name: displayName,
      picture: pictureUrl ?? "",
      provider: "line",
    };

    /** ----------------------------------------
     * STEP 2 — Check if LINE user exists in GAS
     * -------------------------------------- */
    const checkRes = await axios.post(NEXT_PUBLIC_GAS_URL, {
      action: "checkLineUser",
      userId: normalizedUser.id,
    });

    /** ----------------------------------------
     * STEP 3 — Create or Update user in GAS
     * -------------------------------------- */
    if (!checkRes.data.exists) {
      await axios.post(NEXT_PUBLIC_GAS_URL, {
        action: "createLineUser",
        user: normalizedUser,
      });
    } else {
      await axios.post(NEXT_PUBLIC_GAS_URL, {
        action: "updateLineUser",
        user: normalizedUser,
      });
    }

    /** ----------------------------------------
     * STEP 4 — Set cookies (session + public)
     * -------------------------------------- */
    const res = NextResponse.json({
      user: normalizedUser,
      message: "LINE login success",
    });

    setUserCookies(res, normalizedUser);

    return res;
  } catch (err) {
    console.error("LINE login error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
