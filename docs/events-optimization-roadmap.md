# 活動列表／詳情優化路線圖

> 來源：產品側整理的優先事項（2026-09）。  
> 用途：日後對照「做了什麼、還沒做什麼」，避免重複討論或裝錯 library。  
> **最後對齊程式：** 2026-09-07（含 URL 代號、詳情 Server、語系／類型 UI i18n）。

---

## 最初 Client 版 vs 現在（差異總覽）

### 一句話

| | 最初 | 現在 |
|---|------|------|
| **列表狀態** | 多半靠 React state + `sessionStorage`／`localStorage` | **URL 為 source of truth**（代號）；storage 輔助捲動／偏好 |
| **列表資料** | Client `getOrgData` → `/api/events` | **仍是 Client 打 API**（尚未改成列表 Server Component） |
| **詳情資料** | Client 再打 `/api/events?id=`，loading 再出內容 | **Server 直接取同城 peers**，HTML 帶內容；Carousel 才是 Client 島 |
| **分享／重整列表** | 容易丟縣市／類型 | `/events?city=taipei&categories=music` 可還原 |
| **URL 可讀性** | 無篩選 query，或曾用中文（會 `%E5…`） | 英文代號 `CityCode`／`EventCategoryCode`；全選類型省略 `categories` |
| **詳情路徑** | 曾可能出現 `culture:%3A…` 或裸 id | 乾淨 dash：`/events/culture-…`（內部仍 `culture:`） |
| **語系** | `useState("zh")` 重整會丟 | `localStorage` key `cyc-locale`（對齊 theme） |

### 使用者流程對照

**列表（選類型 → 點台北）**

```
最初：
  選類型 → 存在 localStorage
  點台北 → setState + getOrgData({ city, categories })
  重整／分享 → 常只剩空白地圖／要重選

現在：
  選類型 → localStorage 仍記偏好；URL 寫 categories 代號（全選則不寫）
  點台北 → URL 變 ?city=taipei&categories=… + 同一次 getOrgData
  重整／分享該 URL → 直接還原篩選再打 API
  city=all + 全選類型 → fetch {}（等同舊版全台列表；非「禁止請求」）
  city=all + 縮小類型 → 只帶 categories
```

**詳情（點某一筆）**

```
最初：
  開 /events/[id]（Client 整頁）
  → loading
  → 瀏覽器 fetch /api/events?id=…（類型靠 localStorage）
  → 再畫 Carousel

現在：
  開 /events/culture-…（可選 ?categories=exhibition；全選則不帶）
  → Server fetchOrgEventCityPeersByRouteId（與 API 同邏輯）
  → HTML 已有資料；Client 島只負責輪播／replaceState
  → 假 id → EventDetailStatus + t.events.notFound（中文契約常數仍為「找不到這個活動」）
```

### 資料流示意（現在）

```
列表 /events（仍 Client）
  URL(city/categories 代號) ──parse──► 中文縣市 + EventCategoryId
       │
       ▼
  getOrgData ──► GET /api/events?city=台北市&categories=…（API 仍用中文／內部 id）

詳情 /events/[id]（Server page）
  params.id（dash ↔ canonical）(+ 可選 categories 代號)
       │
       ▼
  eventsServer.fetchOrgEventCityPeersByRouteId
       │
       ▼
  EventDetailClient（Carousel）／找不到 → EventDetailStatus
```

### 刻意還沒改的

- 列表頁本身仍是 Client（不是「列表也 Server」）
- 回地圖再點同一縣市可能再打一次 API（TanStack Query：痛了再做）
- 第一次點縣市若慢：先量 `/api/events`，再談 cache／縮小 payload

---

## 優先做（判斷已完成，卡點也明確）

### 1. 縣市（必要時含類型）寫進 URL — [x] 已完成（2026-09-07）

這是 Phase 1–2 整條線的解鎖：source of truth 在網址，列表才能改走詳情那扇 server 門。

**約束：**

- 無 `city` 不發「縣市瀏覽」請求（`buildCityBrowseFetchOptions` → `null`）
- 要能分享／重整還在
- 這比裝任何 library 都先

**實作摘要：**

- URL 形狀：`/events?city=taipei&categories=exhibition,music`（方案 B；縣市／類型皆英文代號）
- 全選類型時省略 `categories`（只留 `city`）；全部縣市為 `city=all`
- `city=all` + 全選 → `getOrgData({})`；`city=all` + 縮小類型 → 只帶 `categories`
- `CityCode`（`city.ts`）、`EventCategoryCode`（`eventCategories.ts`）；UI／API 內部仍用中文
- Helper：`frontend/src/utils/eventsListUrl.ts`
- 桌面／手機列表讀寫 URL：`app/events/page.tsx`、`EventsMobileList.tsx`
- Hook：`frontend/src/hooks/useEventsListUrl.ts`
- Spec／計畫：`docs/superpowers/specs/2026-09-07-events-list-url-design.md`、`docs/superpowers/plans/2026-09-07-events-list-url.md`（spec 已對齊英文代號）

---

### 2. 保護你點名的那條行為 — [x] 已完成（2026-09-07）

「點台北且已選類型 → `/api/events` 帶 `city`」。現在仍是你手動看 Network。值得做的第一個測試就是這條（E2E 或 mock 掉 `getOrgData` 的 component）。假 id →「找不到這個活動」可以當第二條，你本來就在手動打網址驗。

**實作摘要：**

- Vitest：`npm test`（`frontend/package.json`）
- 契約測試：`frontend/src/utils/eventsListUrl.test.ts`  
  - 台北 + 類型 → `buildCityBrowseFetchOptions` 含 `city: "台北市"`  
  - 無 city → `null`（禁止無 city 灌全國）
  - `全部` + 全選 → `{}`；`全部` + 縮小 → 只 `categories`
- 假 id：`eventDetailCopy.ts`（中文常數供測試）+ UI `t.events.notFound`／`EventDetailStatus`
- 說明：目前是 **unit 測 fetch 參數契約**，不是完整 E2E

---

### 3. 真的要讓 AI 改產品時，先放一份很短的 AGENTS.md — [x] 已完成（2026-09-07）

只放令，不貼 01–09。例如：詳情 page 保持 Server Component；不要為了方便開 Redux；列表不要灌全國；先量再改。

**實作摘要：**

- 檔案：`AGENTS.md`（repo 根目錄）

---

## 值得做，但有前提（痛出現再做）

### 4. lint + build 的 CI — [ ] 未做

當你厭倦每次自己跑。只排這兩段。沒有測試就不要空 E2E job。

> 註：現已有 `npm test`，若開 CI 可順帶跑 unit；仍不要為了湊數加空 E2E。

---

### 5. TanStack Query 包列表那包 — [ ] 未做

對準的是「回地圖再點台北又打一次」，不是第一次等 API 變快。Network 量到重複請求真的煩，再用 `getOrgData` 當 `queryFn`，key 含 `city`／`categories`。不要動詳情那扇 server 門，不要把 hover／`clickedId` 塞進去。

---

### 6. 第一次點縣市若真的等很久 — [ ] 未做

先量那筆 `/api/events` 多久。瓶頸在後端／payload，才考慮 server cache 或縮小回應。這不是 Redux，也不是「先裝 Query 試試看」。

---

## 勾選總覽

| # | 項目 | 狀態 |
|---|------|------|
| 1 | 縣市（必要時含類型）寫進 URL | [x] |
| 2 | 測試保護「台北 + 類型 → 帶 city」與假 id 文案 | [x] |
| 3 | 短版 AGENTS.md | [x] |
| 4 | lint + build CI | [ ] |
| 5 | TanStack Query（列表快取，防重複請求） | [ ] |
| 6 | 量測慢請求後再優化後端／payload | [ ] |
| — | 詳情頁 Server Component + Client 輪播島 | [x] |
| — | URL 英文代號（縣市／類型）＋全選省略 categories | [x] |
| — | 語系持久化（`cyc-locale`）＋類型／縣市 UI i18n | [x] |

---

## 後續已做（不在原 1–6 內）

### 詳情頁改走 Server Component — [x] 已完成（2026-09-07）

- `app/events/[id]/page.tsx`：Server 用 `fetchOrgEventCityPeersByRouteId` 拉同城 peers
- Client 島：`EventDetailClient`（Carousel／URL replaceState）
- 找不到／載入失敗：`EventDetailStatus`（版面與成功態同列返回鈕；文案走 locale）
- 路徑：`/events/culture-…`／`ntpc-…`（`eventDetailPath`）；內部 canonical 仍 `culture:`／`ntpc:`
- 可選 `?categories=` 代號；列表卡片在**非全選**時帶入篩 peers；全選／分享則乾淨路徑
- 共用邏輯：`buildEventDetailCityPeers`（API 與 Server 同一套）

### URL 代號（縣市／類型）— [x] 已完成（2026-09-07）

- `EventCategoryCode`、`CityCode` enum
- 範例列表：`/events?city=taipei&categories=music,festival`
- 範例詳情（限縮類型）：`/events/culture-…?categories=exhibition`（注意複數 `categories`，不是 `category`）
- 舊中文 query 仍可解析

### 語系／文案 — [x] 已完成（2026-09-07）

- `LocaleContext`：`localStorage` `cyc-locale`（對齊 next-themes）
- 縣市／類型標籤：`t.cities`／`t.categories`（含「全部城市」／All cities）
- 變更類型看板、手機 CityPicker、筆數／空狀態等走 locale
