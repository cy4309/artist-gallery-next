import { cookies } from "next/headers";
import type { User } from "@/types/user";

/**
 * Server-only
 * 從 httpOnly cookie 讀取目前登入使用者
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const session = cookieStore.get("cyc_session");

  if (!session) return null;

  try {
    const user = JSON.parse(session.value);
    return user;
  } catch (err) {
    console.error("[getCurrentUser] parse error:", err);
    return null;
  }
}

export async function logoutRequest() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }
}
