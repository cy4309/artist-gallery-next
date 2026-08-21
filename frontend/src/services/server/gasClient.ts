/**
 * Google Apps Script Web App 呼叫輔助。
 *
 * /exec 常回 302 → googleusercontent.com/macros/echo?...
 * 正確做法：redirect:manual，再對 Location 發 GET 取結果。
 * 偶發會得到 doGet 的 {"status":"GAS API running"}，需重試。
 */

const GAS_URL = process.env.GAS_URL!;
const MAX_ATTEMPTS = 3;

function isDoGetProbe(json: unknown): boolean {
  return (
    !!json &&
    typeof json === "object" &&
    "status" in json &&
    (json as { status?: string }).status === "GAS API running" &&
    !("ok" in json) &&
    !("success" in json) &&
    !("error" in json)
  );
}

async function postToGasOnce<T>(
  payload: string,
): Promise<T> {
  const headers = { "Content-Type": "application/json" };

  const res = await fetch(GAS_URL, {
    method: "POST",
    headers,
    body: payload,
    redirect: "manual",
  });

  let finalRes = res;

  // 302/303：跟到 echo URL（必須用 GET，保留 POST 結果）
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location");
    if (!location) {
      throw new Error(`GAS redirect ${res.status} without Location`);
    }
    finalRes = await fetch(location, {
      method: "GET",
      redirect: "follow",
    });
  } else if (res.status === 200) {
    // 少數情況直接 200；若是 doGet 探測，交給外層重試
    finalRes = res;
  } else if (res.status === 0 || res.type === "opaqueredirect") {
    // 極端：手動 redirect 拿不到 Location 時再試 follow
    finalRes = await fetch(GAS_URL, {
      method: "POST",
      headers,
      body: payload,
      redirect: "follow",
    });
  }

  const text = await finalRes.text();
  let json: T;
  try {
    json = JSON.parse(text) as T;
  } catch {
    throw new Error(
      `GAS returned non-JSON (HTTP ${finalRes.status}): ${text.slice(0, 200)}`,
    );
  }

  if (isDoGetProbe(json)) {
    throw new Error("GAS_DOGET_PROBE");
  }

  return json;
}

export async function postToGas<T = Record<string, unknown>>(
  body: Record<string, unknown>,
): Promise<T> {
  if (!GAS_URL) throw new Error("GAS_URL not set");

  const payload = JSON.stringify(body);
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await postToGasOnce<T>(payload);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const retryable =
        message === "GAS_DOGET_PROBE" ||
        message.includes("fetch failed") ||
        message.includes("ECONNRESET");

      if (!retryable || attempt === MAX_ATTEMPTS) break;

      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }

  if (
    lastError instanceof Error &&
    lastError.message === "GAS_DOGET_PROBE"
  ) {
    throw new Error(
      "GAS request hit doGet instead of doPost after retries (redirect mishandled).",
    );
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError));
}
