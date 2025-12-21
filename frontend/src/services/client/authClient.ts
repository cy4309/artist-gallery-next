//* client =「前端呼叫 API 的代理」，特徵有 fetch('/api/...')，「幫 React 呼叫後端 API 的薄包裝」
import { logoutRequest } from "@/services/server/authService";
import { useUser } from "@/hooks/useUser";

export async function fetchCurrentUser() {
  const res = await fetch("/api/auth/check-cyc-cookies", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch current user");
  }

  return res.json();
}

export async function logoutClient() {
  const { logout } = useUser();
  // 1. 清前端狀態
  logout(); // 這裡才是真正「登出」
  // 2. 告知後端
  try {
    await logoutRequest();
  } catch (err) {
    console.error("Logout API failed", err);
    // 可選：rollback or ignore
  }
}
