# CYC Zine（Next.js）

以 Next.js App Router 開發的文化活動／獨立雜誌站。資料後端可切換 **Cloudflare Workers + D1**（預設方向）或 **Google Apps Script + Sheet**（備援）。

## 技術棧

- **Next.js 16** App Router（Route Handlers、Server Components）
- **React 18** + TypeScript + Tailwind CSS
- **登入**：Google OAuth 2.0、LINE Login / LIFF
- **Session**：使用者 Cookie `cyc_session`；後台 Cookie `cyc_admin`（httpOnly，約 7 天）
- **資料後端**：`DATA_BACKEND=cloudflare|gas` → `postToDataBackend`（`src/services/server/dataBackendClient.ts`）
- **Cloudflare**：`frontend/cloudflare-data-api`（Workers + D1）；細節見該目錄 [README](./cloudflare-data-api/README.md)
- **後台**：`/admin`（`ADMIN_SECRET`）— 統計、活動 CRUD、使用者／收藏／Push 列表、手動 sync、GAS→CF 遷移
- **活動資料**：文化部 API + 新北 API → Next normalize／merge／dedupe → 寫入目前後端快取
- **排程**：Vercel Cron 每日自動 sync 活動
- **其他**：next-themes、SweetAlert2、GA、OG 圖 API

> Vercel 專案 **Root Directory** 請設為 `frontend/`（`vercel.json` 才會生效）。

---

## 四項資料何時進後端／admin

在 `DATA_BACKEND=cloudflare`（且已設 `CF_DATA_API_*`）時：

| 資料 | 寫入時機 | Admin 分頁 |
|------|----------|------------|
| 使用者 | Google／LINE 登入、LINE follow | 使用者 |
| 收藏 | 收藏／取消收藏 API | 收藏 |
| Push token | App `/api/push/register` | Push |
| 活動 | Cron／admin 手動同步／admin CRUD（**不是**外部 API 即時推入） | 活動 |

歷史資料需在 `/admin`「資料同步與遷移」從 GAS 遷移；之後新操作會即時寫入 D1。Admin 畫面需手動重新整理才會看到新資料。

正式站請在 **Vercel** 設與本機相同的 `DATA_BACKEND`、`CF_DATA_API_URL`、`CF_DATA_API_SECRET`、`ADMIN_SECRET`，否則 production 仍可能打 GAS。

---

## 活動資料流（重要）

```
文化部節慶 + 全 category ─┐
新北 API（白名單）────────┼─► sync → 目前後端 EVENTS 快取（CF D1 或 GAS Sheet）
                          │
活動頁：選縣市 → 選類型 → GET /api/events?city&categories（快取篩選，失敗才 live）
```

- **文化部**：節慶 + category 1–8、11、13–17（寫入為中文：節慶／展覽／音樂…）
- **新北**：只收 `活動、表演與節慶`、`展覽`（類型寫成「新北文化局」）
- 進頁不預載；確認類型後才打 API
- 讀取端有短暫記憶體快取；description 截斷減輕 payload
- **Canonical id**：`culture:…`、`ntpc:…`；網址 `/events/culture-901` 等
- 前端透過 `/api/events` 取資料，再 map 成 `OrgEvent`

相關程式：

| 路徑 | 用途 |
|------|------|
| `src/services/events/adapters/` | 各來源 adapter |
| `src/services/events/merge.ts` | 合併／去重 |
| `src/services/events/filterActive.ts` | 過期過濾 |
| `app/api/events/route.ts` | 讀取（後端快取 → fallback live） |
| `app/api/events/sync/route.ts` | Cron／手動同步寫入 |
| `app/api/admin/sync/route.ts` | Admin 手動同步（在**目前這台 Next**執行） |
| `cloudflare-data-api/` | CF Worker + D1 |
| `scripts/CURRENT_GAS.js` | GAS 原始碼（需手動部署到 Apps Script） |

---

## Vercel Cron 排程（活動 Sync）

設定檔：`vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/events/sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 排程時間

| 項目 | 說明 |
|------|------|
| Cron 表達式 | `0 2 * * *` |
| Vercel 時區 | **UTC** |
| 對應台灣時間 | 每天 **上午 10:00**（UTC+8） |
| 打的路徑 | `GET /api/events/sync`（Vercel Cron 預設用 GET） |

### 驗證邏輯

環境變數：**`CRON_SECRET`**

| 情境 | 驗證方式 |
|------|----------|
| Vercel Cron 自動打 | `Authorization: Bearer <CRON_SECRET>`（Vercel 會自動帶） |
| 手動觸發 | 同上，或 Header `x-cron-secret: <CRON_SECRET>` |
| 本機未設 `CRON_SECRET` | 不擋（方便開發） |
| Production 有設 secret、請求不對 | `401 Unauthorized` |

Sync：抓兩來源 → 過濾過期 → `replaceEvents` **整批覆寫** 目前後端的活動表（CF 或 GAS）。

### 手動觸發範例

```bash
curl -X POST "https://你的網域/api/events/sync" \
  -H "Authorization: Bearer 你的CRON_SECRET"
```

或：

```bash
curl -X POST "https://你的網域/api/events/sync" \
  -H "x-cron-secret: 你的CRON_SECRET"
```

也可在 `/admin` 按「手動同步」（走本機／當前部署的 Next，不依賴 `NEXT_PUBLIC_BASE_URL`）。

### Production 建議 env

| Key | 說明 |
|-----|------|
| `DATA_BACKEND` | `cloudflare` 或 `gas` |
| `CF_DATA_API_URL` | Worker URL（cloudflare 時必填） |
| `CF_DATA_API_SECRET` | 與 Wrangler `DATA_API_SECRET` 相同 |
| `ADMIN_SECRET` | `/admin` 登入 |
| `GAS_URL` | 備援／遷移來源 |
| `CRON_SECRET` | Cron／手動 sync（**必設**，否則 sync 對外開放） |
| `NEXT_PUBLIC_BASE_URL` | 站台網址（分享、OG、sitemap） |

不需要另設 `EVENTS_SYNC_SECRET`（已統一成 `CRON_SECRET`）。

---

## 後台 `/admin`

- 入口：頁尾 **©** 連到 `/admin`（外觀不變）
- 登入：輸入 `ADMIN_SECRET`；記住方式為 cookie `cyc_admin`
- 功能：總覽統計、活動／使用者／收藏／Push 列表、活動編輯、GAS→CF 分項遷移、手動活動同步
- 時間顯示為台灣時區可讀格式（非 ISO `…Z`）

---

## Google OAuth Login

流程概要：

1. `/auth/login` → Google OAuth 授權  
2. Redirect 回 `/api/auth/login`  
3. 用 code 換 token，打 Google UserInfo  
4. 經 `postToDataBackend` 寫入／更新使用者（`updateGoogleUser`：空 `picture` 不覆寫既有頭像）  
5. 設 `cyc_session` Cookie，導向 dashboard  
6. logout 清除 Cookie  

另支援 LINE Login／LIFF（見 `.env.local` 的 `LINE_*`、`NEXT_PUBLIC_LIFF_ID_*`）。

### 必備設定連結

1. **Google OAuth Client**  
   https://console.cloud.google.com/auth/clients?project=cyc-studio-oauth  

   Authorized redirect URIs 需包含：

   - `http://localhost:3000/api/auth/login`
   - `https://your-domain.com/api/auth/login`

2. **Google Sheet**（GAS 備援／遷移來源）  
   https://docs.google.com/spreadsheets/d/1CPBJowgWYTUNJGgI2ExwuvriPmHjXk2DKI9YmRrNdeg/edit?gid=1907587179#gid=1907587179

---

## 本機開發

```bash
# Next
cd frontend
npm install
npm run dev

# 可選：本機 Worker（見 cloudflare-data-api/README.md）
cd cloudflare-data-api
npm i && npm run db:local && npm run dev
```

- CF 模式：`.env.local` 設 `DATA_BACKEND=cloudflare` 與 `CF_DATA_API_*`（可指遠端 Worker 或 `http://127.0.0.1:8787`）
- GAS 變更請同步更新 `scripts/CURRENT_GAS.js`，並手動部署到 Apps Script
