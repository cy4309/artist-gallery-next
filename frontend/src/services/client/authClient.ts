//* client =「前端呼叫 API 的代理」，特徵有 fetch('/api/...')，「幫 React 呼叫後端 API 的薄包裝」
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
