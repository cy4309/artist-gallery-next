# Events 列表 URL Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.  
> **狀態：** 已實作。URL 後續改為英文代號；詳情 Server Component 另案完成——以 `docs/events-optimization-roadmap.md` 為準。

**Goal:** 把縣市／類型寫進 `/events` query，並用最小測試保護「台北 + 類型 → API 帶 city」與「假 id → 找不到這個活動」。

**Architecture:** 純函式 `eventsListUrl` 負責 parse／serialize；桌面 `page.tsx` 與 `EventsMobileList` 在選縣市／確認類型／重置時 `router.replace`；進入頁以 URL 優先於 sessionStorage。Vitest 測 helper 與 fetch 參數契約，不裝空 E2E。

**Tech Stack:** Next.js App Router (`useSearchParams` / `useRouter`), 既有 `getOrgData`, Vitest

## Global Constraints

- 方案 B：`city` + 全選類型則省略 `categories`（現行：英文代號）
- 無 `city` 禁止灌全國；`city=all` + 全選允許 `{}`
- 不 commit 除非使用者要求

## 檔案

| 檔案 | 職責 |
|------|------|
| `frontend/src/utils/eventsListUrl.ts` | parse／build query、browse fetch options |
| `frontend/src/utils/eventsListUrl.test.ts` | 契約測試 |
| `frontend/app/events/page.tsx` | 桌面讀寫 URL |
| `frontend/src/components/events/EventsMobileList.tsx` | 手機讀寫 URL |
| `frontend/src/utils/eventDetailCopy.ts` (+ test) | 假 id 文案常數／判定 |
| `AGENTS.md`（repo root） | 短令 |
| `frontend/package.json` + `vitest.config.ts` | 測試腳本 |

---

### Task 1: URL helper + vitest

- [x] 新增 `eventsListUrl.ts`：`parseEventsListSearchParams`、`eventsListPath`、`buildCityBrowseFetchOptions`
- [x] 安裝 vitest，加 `test` script
- [x] 測試：台北 + 展覽 → fetch options 含 `city: "台北市"`；無 city 不產生全國 browse options

### Task 2: 接上桌面／手機列表

- [x] 選縣市／確認類型後 `replace` URL
- [x] 進入頁 URL 優先還原

### Task 3: 假 id 文案 + AGENTS

- [x] `eventDetailCopy` + 測試
- [x] root `AGENTS.md`
