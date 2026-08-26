import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/services/server/adminAuth";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import { postToGas } from "@/services/server/gasClient";
import { postToCloudflareOnly } from "@/services/server/dataBackendClient";
import type { CanonicalEvent } from "@/types/event";

type MigrateBody = {
  /** events | users | favorites | push | all（預設 all） */
  scope?: string;
};

type StepResult = {
  ok: boolean;
  count?: number;
  error?: string;
};

/**
 * 從 GAS 整表匯出 → Cloudflare 整批覆寫。
 * 逐步執行：某步失敗不中斷後面，回傳每步結果。
 */
export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GAS_URL || !process.env.CF_DATA_API_URL) {
    return NextResponse.json(
      { error: "Need both GAS_URL and CF_DATA_API_URL" },
      { status: 400 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as MigrateBody;
  const scope = (body.scope || "all").toLowerCase();
  const doEvents = scope === "all" || scope === "events";
  const doUsers = scope === "all" || scope === "users";
  const doFavorites = scope === "all" || scope === "favorites";
  const doPush = scope === "all" || scope === "push";

  const steps: Record<string, StepResult> = {};

  if (doEvents) {
    steps.events = await migrateEvents();
  }
  if (doUsers) {
    steps.users = await migrateUsers();
  }
  if (doFavorites) {
    steps.favorites = await migrateFavorites();
  }
  if (doPush) {
    steps.pushTokens = await migratePush();
  }

  const failed = Object.entries(steps).filter(([, s]) => !s.ok);
  const succeeded = Object.entries(steps).filter(([, s]) => s.ok);

  return NextResponse.json({
    ok: failed.length === 0,
    partial: failed.length > 0 && succeeded.length > 0,
    steps,
    report: Object.fromEntries(
      Object.entries(steps).map(([k, v]) => [
        k,
        v.ok ? (v.count ?? 0) : `FAIL: ${v.error}`,
      ]),
    ),
    hint:
      failed.length > 0
        ? "若錯誤含 HTTP 404／non-JSON：GAS_URL 部署網址無效，請到 Apps Script「管理部署」複製最新 /exec，更新 .env.local 後重啟 next。Push 可單獨再遷：scope=push"
        : undefined,
  });
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

async function migrateEvents(): Promise<StepResult> {
  try {
    const fromGas = await postToGas<{
      ok?: boolean;
      events?: CanonicalEvent[];
      error?: string;
    }>({ action: GAS_ACTION.LIST_EVENTS });

    if (!fromGas.ok) {
      return { ok: false, error: fromGas.error || "GAS listEvents failed" };
    }

    const events = fromGas.events || [];
    const columns = [
      "id",
      "source",
      "sourceId",
      "category",
      "title",
      "startTime",
      "endTime",
      "cityName",
      "address",
      "description",
      "website",
      "imageUrl",
      "syncedAt",
    ] as const;

    const rows = events.map((e) =>
      columns.map((col) => {
        const v = e[col];
        return v === null || v === undefined ? "" : String(v);
      }),
    );

    const result = await postToCloudflareOnly<{
      ok?: boolean;
      count?: number;
      error?: string;
    }>({
      action: GAS_ACTION.REPLACE_EVENTS,
      columns,
      rows,
    });

    if (!result.ok) {
      return { ok: false, error: result.error || "CF replaceEvents failed" };
    }
    return { ok: true, count: result.count ?? events.length };
  } catch (err) {
    return { ok: false, error: errMsg(err) };
  }
}

async function migrateUsers(): Promise<StepResult> {
  try {
    const fromGas = await postToGas<{
      ok?: boolean;
      users?: Record<string, unknown>[];
      error?: string;
    }>({ action: GAS_ACTION.LIST_ALL_USERS });

    if (fromGas.error && !fromGas.ok) {
      return {
        ok: false,
        error:
          fromGas.error ||
          "GAS listAllUsers failed（請部署最新 CURRENT_GAS.js）",
      };
    }

    const users = fromGas.users || [];
    const result = await postToCloudflareOnly<{
      ok?: boolean;
      count?: number;
      error?: string;
    }>({
      action: GAS_ACTION.REPLACE_USERS,
      users,
    });

    if (!result.ok) {
      return { ok: false, error: result.error || "CF replaceUsers failed" };
    }
    return { ok: true, count: result.count ?? users.length };
  } catch (err) {
    return { ok: false, error: errMsg(err) };
  }
}

async function migrateFavorites(): Promise<StepResult> {
  try {
    const fromGas = await postToGas<{
      ok?: boolean;
      favorites?: Record<string, unknown>[];
      error?: string;
    }>({ action: GAS_ACTION.LIST_ALL_FAVORITES });

    if (fromGas.error && !fromGas.ok) {
      return {
        ok: false,
        error:
          fromGas.error ||
          "GAS listAllFavorites failed（請部署最新 CURRENT_GAS.js）",
      };
    }

    const favorites = fromGas.favorites || [];
    const result = await postToCloudflareOnly<{
      ok?: boolean;
      count?: number;
      error?: string;
    }>({
      action: GAS_ACTION.REPLACE_FAVORITES,
      favorites,
    });

    if (!result.ok) {
      return { ok: false, error: result.error || "CF replaceFavorites failed" };
    }
    return { ok: true, count: result.count ?? favorites.length };
  } catch (err) {
    return { ok: false, error: errMsg(err) };
  }
}

async function migratePush(): Promise<StepResult> {
  try {
    const fromGas = await postToGas<{
      ok?: boolean;
      tokens?: Record<string, unknown>[];
      error?: string;
    }>({ action: GAS_ACTION.LIST_ALL_PUSH_TOKENS });

    if (fromGas.error && !fromGas.ok) {
      return {
        ok: false,
        error:
          fromGas.error ||
          "GAS listAllPushTokens failed（請部署最新 CURRENT_GAS.js）",
      };
    }

    const tokens = fromGas.tokens || [];
    const result = await postToCloudflareOnly<{
      ok?: boolean;
      count?: number;
      error?: string;
    }>({
      action: GAS_ACTION.REPLACE_PUSH_TOKENS,
      tokens,
    });

    if (!result.ok) {
      return { ok: false, error: result.error || "CF replacePushTokens failed" };
    }
    return { ok: true, count: result.count ?? tokens.length };
  } catch (err) {
    return { ok: false, error: errMsg(err) };
  }
}
