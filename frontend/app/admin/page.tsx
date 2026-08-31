"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ReloadOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import type { CanonicalEvent } from "@/types/event";
import type { SearchImagePreview } from "@/services/events/enrichEventSearchImages";
import { getCultureImageUrl } from "@/utils/imageProxy";

type Stats = {
  events?: number;
  eventsMissingImage?: number;
  users?: number;
  favorites?: number;
  pushTokens?: number;
  eventsSyncedAt?: string | null;
};

type Tab = "overview" | "events" | "users" | "favorites" | "push";

const EVENT_FIELD_LABELS: { key: keyof CanonicalEvent; label: string }[] = [
  { key: "id", label: "id" },
  { key: "source", label: "source" },
  { key: "sourceId", label: "sourceId" },
  { key: "category", label: "category" },
  { key: "title", label: "title" },
  { key: "startTime", label: "startTime" },
  { key: "endTime", label: "endTime" },
  { key: "cityName", label: "cityName" },
  { key: "address", label: "address" },
  { key: "description", label: "description" },
  { key: "website", label: "website" },
  { key: "imageUrl", label: "imageUrl" },
  { key: "imageSource", label: "imageSource" },
  { key: "syncedAt", label: "syncedAt" },
];

const USER_FIELD_LABELS = [
  { key: "id", label: "id" },
  { key: "provider", label: "provider" },
  { key: "lineUserId", label: "lineUserId" },
  { key: "email", label: "email" },
  { key: "name", label: "name" },
  { key: "picture", label: "picture" },
  { key: "created_at", label: "created_at" },
  { key: "updated_at", label: "updated_at" },
] as const;

const FAVORITE_FIELD_LABELS = [
  { key: "id", label: "id" },
  { key: "userId", label: "userId" },
  { key: "userName", label: "userName" },
  { key: "eventId", label: "eventId" },
  { key: "eventTitle", label: "eventTitle" },
  { key: "eventStartDate", label: "eventStartDate" },
  { key: "eventEndDate", label: "eventEndDate" },
  { key: "eventLocation", label: "eventLocation" },
  { key: "eventUrl", label: "eventUrl" },
  { key: "imageUrl", label: "imageUrl" },
  { key: "createdAt", label: "createdAt" },
] as const;

const PUSH_FIELD_LABELS = [
  { key: "expoPushToken", label: "expoPushToken" },
  { key: "platform", label: "platform" },
  { key: "userId", label: "userId" },
  { key: "updatedAt", label: "updatedAt" },
  { key: "createdAt", label: "createdAt" },
] as const;

/** 時間顯示為台灣時區可讀格式；非時間字串原樣回傳 */
function formatTaiwanDisplay(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  const s = String(value).trim();
  // 純日期或已是台灣本地戳 → 直接顯示
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) return s;
  // ISO（含 T / Z）→ 轉成 Asia/Taipei
  if (!/^\d{4}-\d{2}-\d{2}/.test(s) && !s.includes("T")) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

/** 可接受的缺圖比例上限（例如 1500 活動 → 缺圖 ≤ 300） */
const MISSING_IMAGE_MAX_RATIO = 0.2;

type EnrichBatchResult = {
  remaining?: number;
  queueTotal?: number;
  updated?: number;
  matched?: number;
  attemptedIds?: string[];
  passComplete?: boolean;
  skipped?: string;
};

function missingImageGoal(total: number | undefined): number | null {
  if (typeof total !== "number" || total <= 0) return null;
  return Math.ceil(total * MISSING_IMAGE_MAX_RATIO);
}

async function runEnrichBatchLoop(options: {
  endpoint: string;
  shouldAbort: () => boolean;
  onProgress: (message: string) => void;
  maxRounds?: number;
  maxPasses?: number;
}): Promise<{
  totalUpdated: number;
  totalMatched: number;
  passes: number;
  rounds: number;
  stopReason: string;
}> {
  const maxRounds = options.maxRounds ?? 1000;
  const maxPasses = options.maxPasses ?? 50;

  let totalUpdated = 0;
  let totalMatched = 0;
  let rounds = 0;
  let passes = 0;
  let passUpdated = 0;
  let excludeIds: string[] = [];
  let stopReason = "";

  while (!options.shouldAbort() && rounds < maxRounds && passes < maxPasses) {
    const res = await fetch(options.endpoint, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ excludeIds }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        typeof data.error === "string" ? data.error : "補圖請求失敗",
      );
    }

    const result = data.result as EnrichBatchResult;

    rounds += 1;
    const roundUpdated = result.updated ?? 0;
    totalUpdated += roundUpdated;
    totalMatched += result.matched ?? 0;
    passUpdated += roundUpdated;

    if (Array.isArray(result.attemptedIds) && result.attemptedIds.length) {
      excludeIds = [...excludeIds, ...result.attemptedIds];
    }

    options.onProgress(
      `本批 +${roundUpdated}，仍缺圖 ${result.queueTotal ?? "?"}，累計 +${totalUpdated}`,
    );

    if (result.skipped) {
      stopReason = result.skipped;
      break;
    }
    if ((result.queueTotal ?? 0) === 0) {
      stopReason = "佇列已空";
      break;
    }
    if (result.passComplete) {
      passes += 1;
      if (passUpdated === 0) {
        stopReason = `已掃描 ${passes} 遍，本遍無新圖`;
        break;
      }
      passUpdated = 0;
      excludeIds = [];
    }
  }

  if (!stopReason && options.shouldAbort()) {
    stopReason = "手動停止";
  } else if (!stopReason && rounds >= maxRounds) {
    stopReason = `已達批次上限（${maxRounds} 批）`;
  } else if (!stopReason && passes >= maxPasses) {
    stopReason = `已達遍數上限（${maxPasses} 遍）`;
  } else if (!stopReason) {
    stopReason = "完成";
  }

  return { totalUpdated, totalMatched, passes, rounds, stopReason };
}

function FieldGrid({
  fields,
}: {
  fields: { label: string; value: unknown }[];
}) {
  return (
    <dl className="mt-2 px-6 grid gap-x-4 gap-y-1.5 sm:grid-cols-[9rem_minmax(0,1fr)]">
      {fields.map(({ label, value }) => (
        <div key={label} className="contents text-xs">
          <dt className="font-mono text-gray-500">{label}</dt>
          <dd className="min-w-0 break-all whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {formatTaiwanDisplay(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ExpandableItem({
  itemKey,
  expanded,
  onToggle,
  summary,
  fields,
  actions,
}: {
  itemKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
  summary: ReactNode;
  fields: { label: string; value: unknown }[];
  actions?: ReactNode;
}) {
  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onToggle(itemKey)}
          className="min-w-0 flex-1 text-left"
          aria-expanded={expanded}
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-xs text-gray-400">
              {expanded ? <UpOutlined /> : <DownOutlined />}
            </span>
            <div className="min-w-0 flex-1">{summary}</div>
          </div>
        </button>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
      {expanded ? <FieldGrid fields={fields} /> : null}
    </li>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [secret, setSecret] = useState("");
  const [backend, setBackend] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<CanonicalEvent[]>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [favorites, setFavorites] = useState<Record<string, unknown>[]>([]);
  const [tokens, setTokens] = useState<Record<string, unknown>[]>([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [edit, setEdit] = useState<CanonicalEvent | null>(null);
  const [syncPanelOpen, setSyncPanelOpen] = useState(false);
  const [imagePanelOpen, setImagePanelOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const enrichOgAbortRef = useRef(false);
  const searchPreviewAbortRef = useRef(false);
  const [searchPreviews, setSearchPreviews] = useState<SearchImagePreview[]>([]);
  const [searchPreviewMeta, setSearchPreviewMeta] = useState<{
    attempted: number;
    matched: number;
    queueTotal: number;
  } | null>(null);
  const [selectedSearchIds, setSelectedSearchIds] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const refreshAuth = useCallback(async () => {
    const res = await fetch("/api/admin/auth");
    const data = await res.json();
    setAuthed(Boolean(data.ok));
    setBackend(String(data.backend || ""));
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const login = async () => {
    setBusy("login");
    setMessage("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    const data = await res.json();
    setBusy("");
    if (!res.ok) {
      setMessage(data.error || "登入失敗");
      return;
    }
    setSecret("");
    await refreshAuth();
  };

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
    setStats(null);
  };

  const loadStats = async (opts?: { manageBusy?: boolean }) => {
    const manageBusy = opts?.manageBusy !== false;
    if (manageBusy) setBusy("stats");
    const res = await fetch("/api/admin/stats", { cache: "no-store" });
    const data = await res.json();
    if (manageBusy) setBusy("");
    setBackend(String(data.backend || backend));
    setStats(data.stats || null);
    setNote(data.note || "");
    if (!res.ok) {
      setMessage(data.error || "統計讀取失敗");
    }
  };

  const loadEvents = async (q = query, opts?: { manageBusy?: boolean }) => {
    const manageBusy = opts?.manageBusy !== false;
    if (manageBusy) setBusy("events");
    const res = await fetch(`/api/admin/events?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (manageBusy) setBusy("");
    setEvents(data.events || []);
    if (data.error) setMessage(data.error);
  };

  const loadUsers = async (q = query, opts?: { manageBusy?: boolean }) => {
    const manageBusy = opts?.manageBusy !== false;
    if (manageBusy) setBusy("users");
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (manageBusy) setBusy("");
    setUsers(data.users || []);
    if (data.error) setMessage(data.error);
  };

  const loadFavorites = async (q = query, opts?: { manageBusy?: boolean }) => {
    const manageBusy = opts?.manageBusy !== false;
    if (manageBusy) setBusy("favorites");
    const res = await fetch(`/api/admin/favorites?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (manageBusy) setBusy("");
    setFavorites(data.favorites || []);
    if (data.error) setMessage(data.error);
  };

  const loadTokens = async (q = query, opts?: { manageBusy?: boolean }) => {
    const manageBusy = opts?.manageBusy !== false;
    if (manageBusy) setBusy("push");
    const res = await fetch(
      `/api/admin/push-tokens?q=${encodeURIComponent(q)}`,
      { cache: "no-store" },
    );
    const data = await res.json();
    if (manageBusy) setBusy("");
    setTokens(data.tokens || []);
    if (data.error) setMessage(data.error);
  };

  const refreshAdmin = async () => {
    if (busy) return;
    setBusy("refresh");
    setMessage("");
    const silent = { manageBusy: false as const };
    try {
      await loadStats(silent);
      if (tab === "events") await loadEvents(query, silent);
      if (tab === "users") await loadUsers(query, silent);
      if (tab === "favorites") await loadFavorites(query, silent);
      if (tab === "push") await loadTokens(query, silent);
    } finally {
      setBusy("");
    }
  };

  useEffect(() => {
    if (!authed) return;
    void loadStats();
    if (tab === "events") void loadEvents();
    if (tab === "users") void loadUsers();
    if (tab === "favorites") void loadFavorites();
    if (tab === "push") void loadTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, tab]);

  const runSync = async () => {
    setBusy("sync");
    setMessage("");
    const res = await fetch("/api/admin/sync", { method: "POST" });
    const data = await res.json();
    setBusy("");
    setMessage(
      res.ok
        ? `同步完成：${JSON.stringify(data.result).slice(0, 280)}`
        : `同步失敗：${JSON.stringify(data).slice(0, 200)}`,
    );
    await loadStats();
  };

  const stopEnrichOg = () => {
    enrichOgAbortRef.current = true;
    setMessage("正在停止 og 補圖…");
  };

  const runEnrichOgImages = async () => {
    if (
      !confirm(
        "將自動執行：清除無效補圖 → 官網 og，各階段掃到無新圖為止。可能需數十分鐘，確定開始？",
      )
    ) {
      return;
    }

    enrichOgAbortRef.current = false;
    setBusy("enrich-og");
    setMessage("og 補圖準備中…");

    const summary: string[] = [];

    try {
      if (!enrichOgAbortRef.current) {
        setMessage("1/2 清除無效補圖…");
        const clearRes = await fetch("/api/admin/clear-invalid-search-images", {
          method: "POST",
          cache: "no-store",
        });
        const clearData = await clearRes.json();
        if (clearRes.ok) {
          const r = clearData.result;
          summary.push(`清除無效 ${r?.cleared ?? 0} 筆`);
        } else {
          summary.push("清除無效略過");
        }
        await loadStats({ manageBusy: false });
      }

      if (!enrichOgAbortRef.current) {
        const og = await runEnrichBatchLoop({
          endpoint: "/api/admin/enrich-images",
          shouldAbort: () => enrichOgAbortRef.current,
          onProgress: (line) => setMessage(`2/2 官網 og — ${line}`),
        });
        summary.push(`og +${og.totalUpdated}`);
        await loadStats({ manageBusy: false });
      }

      const statsRes = await fetch("/api/admin/stats", { cache: "no-store" });
      const statsData = await statsRes.json();
      const missing = statsData.stats?.eventsMissingImage as number | undefined;
      const total = statsData.stats?.events as number | undefined;
      const goal = missingImageGoal(total);
      const goalText =
        typeof missing === "number" && goal !== null
          ? missing <= goal
            ? `缺圖 ${missing}/${total ?? "?"}（已達目標 ≤${goal}）`
            : `缺圖 ${missing}/${total ?? "?"}（目標 ≤${goal}，仍差 ${missing - goal}）`
          : "";

      setMessage(
        enrichOgAbortRef.current
          ? `已停止。${summary.join(" · ")}${goalText ? ` · ${goalText}` : ""}`
          : `og 補圖完成：${summary.join(" · ")}${goalText ? ` · ${goalText}` : ""}`,
      );
    } catch (error) {
      setMessage(
        `og 補圖失敗：${error instanceof Error ? error.message : "未知錯誤"}${summary.length ? `（已完成 ${summary.join(" · ")}）` : ""}`,
      );
    } finally {
      enrichOgAbortRef.current = false;
      setBusy("");
      await loadStats({ manageBusy: false });
      if (tab === "events") await loadEvents();
    }
  };

  const stopSearchPreview = () => {
    searchPreviewAbortRef.current = true;
    setMessage("正在停止搜圖預覽…");
  };

  const runSearchPreview = async () => {
    if (
      searchPreviews.length > 0 &&
      !confirm("將清除目前預覽結果並重新搜尋所有缺圖活動，確定繼續？")
    ) {
      return;
    }
    if (
      searchPreviews.length === 0 &&
      !confirm(
        "將對所有缺圖活動執行關鍵字搜圖，僅產生預覽、不會自動發布。可能需較長時間，確定開始？",
      )
    ) {
      return;
    }

    searchPreviewAbortRef.current = false;
    setBusy("search-preview");
    setSearchPreviews([]);
    setSearchPreviewMeta(null);
    setSelectedSearchIds(new Set());
    setMessage("搜圖預覽準備中…");

    const previews: SearchImagePreview[] = [];
    let excludeIds: string[] = [];
    let totalAttempted = 0;
    let queueTotal = 0;
    const maxRounds = 500;

    try {
      for (let round = 0; round < maxRounds; round += 1) {
        if (searchPreviewAbortRef.current) break;

        const res = await fetch("/api/admin/enrich-search-images", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ excludeIds }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "搜圖請求失敗",
          );
        }

        const result = data.result as {
          queueTotal?: number;
          attempted?: number;
          matched?: number;
          attemptedIds?: string[];
          passComplete?: boolean;
          previews?: SearchImagePreview[];
        };

        queueTotal = result.queueTotal ?? queueTotal;
        totalAttempted += result.attempted ?? 0;

        if (Array.isArray(result.previews) && result.previews.length) {
          previews.push(...result.previews);
          setSearchPreviews([...previews]);
          setSelectedSearchIds(
            new Set(previews.map((preview) => preview.id)),
          );
        }

        if (Array.isArray(result.attemptedIds) && result.attemptedIds.length) {
          excludeIds = [...excludeIds, ...result.attemptedIds];
        }

        setSearchPreviewMeta({
          attempted: totalAttempted,
          matched: previews.length,
          queueTotal,
        });
        setMessage(
          `搜圖預覽：已試 ${totalAttempted}/${queueTotal || "?"}，找到 ${previews.length} 張`,
        );

        if (result.passComplete) break;
      }

      setSearchPreviewMeta({
        attempted: totalAttempted,
        matched: previews.length,
        queueTotal,
      });
      setMessage(
        searchPreviewAbortRef.current
          ? `搜圖預覽已停止：已試 ${totalAttempted} 筆，找到 ${previews.length} 張`
          : `搜圖預覽完成：已試 ${totalAttempted} 筆，找到 ${previews.length} 張，無結果 ${Math.max(0, totalAttempted - previews.length)} 筆`,
      );
    } catch (error) {
      setMessage(
        `搜圖預覽失敗：${error instanceof Error ? error.message : "未知錯誤"}`,
      );
    } finally {
      searchPreviewAbortRef.current = false;
      setBusy("");
    }
  };

  const toggleSearchPreviewSelection = (id: string) => {
    setSelectedSearchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const publishSelectedSearchPreviews = async () => {
    const selected = searchPreviews.filter((preview) =>
      selectedSearchIds.has(preview.id),
    );
    if (!selected.length) {
      setMessage("請至少勾選一筆要發布的示意圖");
      return;
    }
    if (
      !confirm(
        `確定發布 ${selected.length} 張示意圖至前台？發布後活動圖片會標示「示意圖」。`,
      )
    ) {
      return;
    }

    setBusy("publish-search");
    try {
      const res = await fetch("/api/admin/publish-search-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patches: selected.map((preview) => ({
            id: preview.id,
            imageUrl: preview.imageUrl,
            imageSource: "search",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "發布失敗");
      }

      const updated = data.result?.updated ?? 0;
      const publishedIds = new Set(selected.map((preview) => preview.id));
      setSearchPreviews((prev) =>
        prev.filter((preview) => !publishedIds.has(preview.id)),
      );
      setSelectedSearchIds((prev) => {
        const next = new Set(prev);
        for (const id of publishedIds) next.delete(id);
        return next;
      });
      setMessage(`已發布 ${updated} 張示意圖`);
      await loadStats({ manageBusy: false });
      if (tab === "events") await loadEvents();
    } catch (error) {
      setMessage(
        `發布失敗：${error instanceof Error ? error.message : "未知錯誤"}`,
      );
    } finally {
      setBusy("");
    }
  };

  const migrate = async (scope: "events" | "users" | "favorites" | "push") => {
    const labels = {
      events: "活動",
      users: "使用者",
      favorites: "收藏",
      push: "Push",
    } as const;
    if (
      !confirm(
        `確定遷移「${labels[scope]}」GAS → CF？會覆寫 Cloudflare 對應資料。`,
      )
    ) {
      return;
    }
    setBusy(`migrate-${scope}`);
    setMessage("");
    const res = await fetch("/api/admin/migrate-from-gas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope }),
    });
    const data = await res.json();
    setBusy("");
    setMessage(
      data.ok || data.partial
        ? `${labels[scope]}遷移${data.partial ? "部分成功" : "完成"}：${JSON.stringify(data.report)}${data.hint ? "｜" + data.hint : ""}`
        : data.error ||
            JSON.stringify(data.report) ||
            `${labels[scope]}遷移失敗`,
    );
    await loadStats();
  };

  const saveEvent = async () => {
    if (!edit) return;
    setBusy("save");
    const res = await fetch("/api/admin/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: edit }),
    });
    const data = await res.json();
    setBusy("");
    if (!res.ok) {
      setMessage(data.error || "儲存失敗");
      return;
    }
    setMessage("已儲存");
    setEdit(null);
    await loadEvents();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm(`刪除 ${id}？`)) return;
    setBusy("delete");
    const res = await fetch(`/api/admin/events?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setBusy("");
    if (!res.ok) {
      setMessage(data.error || "刪除失敗");
      return;
    }
    setMessage("已刪除");
    await loadEvents();
  };

  if (authed === null) {
    return <p className="p-8 text-sm text-gray-500">檢查登入狀態…</p>;
  }

  if (!authed) {
    return (
      <form
        className="mx-auto max-w-md space-y-4 p-8"
        onSubmit={(e) => {
          e.preventDefault();
          void login();
        }}
      >
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-gray-500">輸入 ADMIN_SECRET 登入</p>
        <div className="flex justify-center items-center gap-2">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 dark:border-slate-600 dark:bg-black/20"
            placeholder="ADMIN_SECRET"
            autoFocus
          />
          <button
            type="submit"
            disabled={busy === "login"}
            className="w-1/3 border-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white"
          >
            {busy === "login" ? "…" : "登入"}
          </button>
        </div>
        {message ? <p className="text-sm text-red-500">{message}</p> : null}
      </form>
    );
  }

  const missingGoal = missingImageGoal(stats?.events);
  const missingOk =
    typeof stats?.eventsMissingImage === "number" &&
    missingGoal !== null &&
    stats.eventsMissingImage <= missingGoal;
  const ogEnrichBusy = busy === "enrich-og";
  const searchPreviewBusy = busy === "search-preview";

  return (
    <div className="mx-auto w-full max-w-full min-w-0 overflow-x-hidden space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">資料後台</h1>
          <p className="text-sm text-gray-500">
            backend: {backend || "—"} · {busy ? `busy: ${busy}` : "ready"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refreshAdmin()}
            disabled={Boolean(busy)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-slate-300 text-base disabled:opacity-40 dark:border-slate-600"
            aria-label="重新整理"
            title="重新整理目前分頁與統計"
          >
            <ReloadOutlined spin={busy === "refresh"} />
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg border-2 border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
          >
            登出
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["overview", "總覽"],
            ["events", "活動"],
            ["users", "使用者"],
            ["favorites", "收藏"],
            ["push", "Push"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold border ${
              tab === id
                ? "border-primary bg-primary/10"
                : "border-slate-300 dark:border-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message ? (
        <p className="rounded-lg bg-black/5 px-3 py-2 text-sm dark:bg-white/10">
          {message}
        </p>
      ) : null}

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ["events", "活動"],
                ["users", "使用者"],
                ["favorites", "收藏"],
                ["pushTokens", "Push"],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-bold">{stats?.[key] ?? "—"}</p>
              </div>
            ))}
          </div>
          {note ? <p className="text-sm text-amber-600">{note}</p> : null}

          <div className="overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700">
            <div className="border-b border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setImagePanelOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={imagePanelOpen}
              >
                <div className="min-w-0">
                  <h2 className="text-base font-bold">活動圖片</h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    上次同步：{formatTaiwanDisplay(stats?.eventsSyncedAt)}
                    {typeof stats?.eventsMissingImage === "number" ? (
                      <>
                        {" "}
                        · 缺圖 {stats.eventsMissingImage}
                        {typeof stats.events === "number"
                          ? ` / ${stats.events}`
                          : ""}
                        {missingGoal !== null
                          ? `（目標 ≤ ${missingGoal}）`
                          : ""}
                        {missingOk ? " · 已達標" : ""}
                      </>
                    ) : null}
                  </p>
                </div>
                {imagePanelOpen ? <UpOutlined /> : <DownOutlined />}
              </button>

              {imagePanelOpen ? (
                <div className="space-y-4 border-t border-slate-200 px-4 py-4 dark:border-slate-700">
                  <p className="text-xs text-gray-500">
                    og：清除無效補圖後掃描官網 og，自動寫入。搜圖：對缺圖活動產生關鍵字候選圖，預覽後人工勾選發布。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (ogEnrichBusy) {
                          stopEnrichOg();
                          return;
                        }
                        void runEnrichOgImages();
                      }}
                      disabled={Boolean(busy) && !ogEnrichBusy}
                      className="rounded-xl border-2 border-primary bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {ogEnrichBusy ? "停止 og 補圖" : "一鍵補齊 og 圖片"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (searchPreviewBusy) {
                          stopSearchPreview();
                          return;
                        }
                        void runSearchPreview();
                      }}
                      disabled={Boolean(busy) && !searchPreviewBusy}
                      className="rounded-xl border-2 border-slate-400 px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                    >
                      {searchPreviewBusy
                        ? "停止搜圖預覽"
                        : searchPreviews.length > 0
                          ? "重新執行搜圖"
                          : "補齊搜圖圖片（預覽）"}
                    </button>
                  </div>

                  {searchPreviewMeta || searchPreviews.length > 0 ? (
                    <div className="space-y-3 rounded-xl border-2 border-slate-200 p-3 dark:border-slate-600">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          搜圖預覽
                          {searchPreviewMeta ? (
                            <span className="ml-2 font-normal text-gray-500">
                              已試 {searchPreviewMeta.attempted} 筆 · 找到{" "}
                              {searchPreviewMeta.matched} 張
                            </span>
                          ) : null}
                        </p>
                        {searchPreviews.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSearchIds(
                                  new Set(
                                    searchPreviews.map((preview) => preview.id),
                                  ),
                                )
                              }
                              disabled={Boolean(busy)}
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
                            >
                              全選
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedSearchIds(new Set())}
                              disabled={Boolean(busy)}
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-600"
                            >
                              全不選
                            </button>
                            <button
                              type="button"
                              onClick={() => void publishSelectedSearchPreviews()}
                              disabled={
                                Boolean(busy) || selectedSearchIds.size === 0
                              }
                              className="rounded-lg border-2 border-primary bg-primary px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              {busy === "publish-search"
                                ? "發布中…"
                                : `發布勾選（${selectedSearchIds.size}）`}
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {searchPreviews.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          尚無候選圖，請按「補齊搜圖圖片（預覽）」開始搜尋。
                        </p>
                      ) : (
                        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {searchPreviews.map((preview) => (
                            <li
                              key={preview.id}
                              className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                            >
                              <label className="flex cursor-pointer gap-2 p-2">
                                <input
                                  type="checkbox"
                                  checked={selectedSearchIds.has(preview.id)}
                                  onChange={() =>
                                    toggleSearchPreviewSelection(preview.id)
                                  }
                                  className="mt-1 shrink-0"
                                />
                                <div className="min-w-0 flex-1 space-y-1">
                                  <p className="line-clamp-2 text-sm font-semibold">
                                    {preview.title || preview.id}
                                  </p>
                                  {preview.cityName ? (
                                    <p className="text-xs text-gray-500">
                                      {preview.cityName}
                                    </p>
                                  ) : null}
                                  <p className="text-xs">
                                    <span className="text-gray-500">
                                      keyword：
                                    </span>
                                    <span className="font-mono break-all">
                                      {preview.keyword}
                                    </span>
                                  </p>
                                </div>
                              </label>
                              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={getCultureImageUrl(preview.imageUrl)}
                                  alt={preview.title || preview.id}
                                  className="absolute inset-0 h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setSyncPanelOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={syncPanelOpen}
              >
                <div>
                  <h2 className="text-base font-bold">資料同步與遷移</h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    平時收合；需要同步來源或從 GAS 遷移時再展開
                  </p>
                </div>
                {syncPanelOpen ? <UpOutlined /> : <DownOutlined />}
              </button>

              {syncPanelOpen ? (
                <div className="space-y-4 border-t border-slate-200 px-4 py-4 dark:border-slate-700">
                  <div className="rounded-xl border-2 border-slate-200 p-3 dark:border-slate-600">
                    <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">
                      來源 API
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void runSync()}
                        disabled={Boolean(busy)}
                        className="rounded-xl border-2 border-slate-400 px-4 py-2 text-sm font-semibold disabled:opacity-50"
                      >
                        {busy === "sync" ? "同步中…" : "僅同步文化部／新北"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-slate-200 p-3 dark:border-slate-600">
                    <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">
                      GAS → Cloudflare
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          ["events", "遷移活動"],
                          ["users", "遷移使用者"],
                          ["favorites", "遷移收藏"],
                          ["push", "遷移 Push"],
                        ] as const
                      ).map(([scope, label]) => (
                        <button
                          key={scope}
                          type="button"
                          onClick={() => void migrate(scope)}
                          disabled={Boolean(busy)}
                          className="rounded-xl border-2 border-slate-400 px-4 py-2 text-sm font-semibold disabled:opacity-50"
                        >
                          {busy === `migrate-${scope}` ? `${label}中…` : label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {tab === "events" && (
        <div className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void loadEvents();
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋標題／縣市／id…"
              className="flex-1 rounded-xl border px-3 py-2 dark:bg-black/20"
            />
            <button
              type="submit"
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              搜尋
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                void loadEvents("");
              }}
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              清除
            </button>
          </form>

          {edit ? (
            <div className="space-y-2 rounded-xl border p-4">
              <p className="font-semibold">編輯 {edit.id}</p>
              {EVENT_FIELD_LABELS.map(({ key, label }) => (
                <label key={key} className="block text-sm">
                  <span className="font-mono text-xs text-gray-500">
                    {label}
                  </span>
                  {key === "description" ? (
                    <textarea
                      value={String(edit[key] || "")}
                      onChange={(e) =>
                        setEdit({ ...edit, [key]: e.target.value })
                      }
                      className="mt-1 w-full rounded border px-2 py-1 dark:bg-black/20"
                      rows={4}
                    />
                  ) : (
                    <input
                      value={String(edit[key] ?? "")}
                      onChange={(e) =>
                        setEdit({ ...edit, [key]: e.target.value })
                      }
                      disabled={key === "id"}
                      className="mt-1 w-full rounded border px-2 py-1 disabled:opacity-60 dark:bg-black/20"
                    />
                  )}
                </label>
              ))}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => void saveEvent()}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white"
                >
                  儲存
                </button>
                <button
                  type="button"
                  onClick={() => setEdit(null)}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          ) : null}

          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {events.map((e) => {
              const key = `event:${e.id}`;
              return (
                <ExpandableItem
                  key={e.id}
                  itemKey={key}
                  expanded={expandedKeys.has(key)}
                  onToggle={toggleExpanded}
                  summary={
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {e.title || e.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {e.cityName} · {e.category} · {e.id}
                      </p>
                    </div>
                  }
                  fields={EVENT_FIELD_LABELS.map(({ key: field, label }) => ({
                    label,
                    value: e[field],
                  }))}
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={() => setEdit(e)}
                        className="text-sm underline"
                      >
                        編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteEvent(e.id)}
                        className="text-sm text-red-500 underline"
                      >
                        刪除
                      </button>
                    </>
                  }
                />
              );
            })}
          </ul>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void loadUsers();
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋 email／name／id…"
              className="flex-1 rounded-xl border px-3 py-2 dark:bg-black/20"
            />
            <button
              type="submit"
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              搜尋
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                void loadUsers("");
              }}
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              清除
            </button>
          </form>
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {users.map((u) => {
              const key = `user:${String(u.id)}`;
              return (
                <ExpandableItem
                  key={String(u.id)}
                  itemKey={key}
                  expanded={expandedKeys.has(key)}
                  onToggle={toggleExpanded}
                  summary={
                    <div>
                      <p className="font-semibold text-sm">
                        {String(u.name || "—")} · {String(u.provider || "")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {String(u.email || "")} · {String(u.id)}
                      </p>
                    </div>
                  }
                  fields={USER_FIELD_LABELS.map(({ key: field, label }) => ({
                    label,
                    value: u[field],
                  }))}
                />
              );
            })}
          </ul>
        </div>
      )}

      {tab === "favorites" && (
        <div className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void loadFavorites();
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋姓名／userId／eventId／標題…"
              className="flex-1 rounded-xl border px-3 py-2 dark:bg-black/20"
            />
            <button
              type="submit"
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              搜尋
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                void loadFavorites("");
              }}
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              清除
            </button>
          </form>
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {favorites.map((f) => {
              const key = `fav:${String(f.id || `${f.userId}-${f.eventId}`)}`;
              return (
                <ExpandableItem
                  key={key}
                  itemKey={key}
                  expanded={expandedKeys.has(key)}
                  onToggle={toggleExpanded}
                  summary={
                    <div>
                      <p className="text-sm font-semibold">
                        {String(f.eventTitle || f.eventId || "—")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {String(f.userName || "—")} · {String(f.userId || "")} ·{" "}
                        {String(f.eventId || "")}
                      </p>
                    </div>
                  }
                  fields={FAVORITE_FIELD_LABELS.map(
                    ({ key: field, label }) => ({
                      label,
                      value: f[field],
                    }),
                  )}
                />
              );
            })}
          </ul>
        </div>
      )}

      {tab === "push" && (
        <div className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void loadTokens();
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋 token／platform／userId…"
              className="flex-1 rounded-xl border px-3 py-2 dark:bg-black/20"
            />
            <button
              type="submit"
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              搜尋
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                void loadTokens("");
              }}
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              清除
            </button>
          </form>
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {tokens.map((t) => {
              const key = `push:${String(t.expoPushToken)}`;
              return (
                <ExpandableItem
                  key={String(t.expoPushToken)}
                  itemKey={key}
                  expanded={expandedKeys.has(key)}
                  onToggle={toggleExpanded}
                  summary={
                    <div>
                      <p className="break-all font-mono text-xs">
                        {String(t.expoPushToken)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {String(t.platform)} · user={String(t.userId || "—")} ·{" "}
                        {formatTaiwanDisplay(t.updatedAt)}
                      </p>
                    </div>
                  }
                  fields={PUSH_FIELD_LABELS.map(({ key: field, label }) => ({
                    label,
                    value: t[field],
                  }))}
                />
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
