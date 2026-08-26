/**
 * 統一資料後端客戶端：依 DATA_BACKEND 打 Cloudflare Worker 或 GAS。
 *
 * DATA_BACKEND=cloudflare | gas
 * 未設定時：有 CF_DATA_API_URL → cloudflare，否則 → gas
 */

import { postToGas } from "@/services/server/gasClient";

export type DataBackend = "cloudflare" | "gas";

export function getDataBackend(): DataBackend {
  const explicit = process.env.DATA_BACKEND?.trim().toLowerCase();
  if (explicit === "cloudflare" || explicit === "gas") return explicit;
  return process.env.CF_DATA_API_URL ? "cloudflare" : "gas";
}

async function postToCloudflare<T>(
  body: Record<string, unknown>,
): Promise<T> {
  const url = process.env.CF_DATA_API_URL;
  if (!url) throw new Error("CF_DATA_API_URL not set");

  const secret = process.env.CF_DATA_API_SECRET;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret) {
    headers["X-Data-Api-Secret"] = secret;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: T;
  try {
    json = JSON.parse(text) as T;
  } catch {
    throw new Error(
      `CF data API non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`,
    );
  }

  if (!res.ok) {
    const err =
      json && typeof json === "object" && "error" in json
        ? String((json as { error?: string }).error)
        : `HTTP ${res.status}`;
    throw new Error(`CF data API failed: ${err}`);
  }

  return json;
}

/** 強制打 Cloudflare（遷移用，忽略 DATA_BACKEND） */
export async function postToCloudflareOnly<T = Record<string, unknown>>(
  body: Record<string, unknown>,
): Promise<T> {
  return postToCloudflare<T>(body);
}

export async function postToDataBackend<T = Record<string, unknown>>(
  body: Record<string, unknown>,
): Promise<T> {
  const backend = getDataBackend();
  if (backend === "cloudflare") {
    return postToCloudflare<T>(body);
  }
  return postToGas<T>(body);
}
