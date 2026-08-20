# CYC Zine（Next.js）

以 Next.js App Router 開發的文化活動／獨立雜誌站，後端資料以 **Google Apps Script（GAS）+ Google Sheet** 為主。

## 技術棧

- **Next.js 16** App Router（Route Handlers、Server Components）
- **React 18** + TypeScript + Tailwind CSS
- **登入**：Google OAuth 2.0、LINE Login / LIFF
- **Session**：Cookie（`cyc_session`）
- **資料庫**：Google Sheet，經 GAS 薄層 API
- **活動資料**：文化部 API + 新北 API → Next 端 normalize／merge／dedupe → 寫入 Sheet 快取
- **排程**：Vercel Cron 每日自動 sync 活動
- **其他**：next-themes、SweetAlert2、GA、OG 圖 API

> Vercel 專案 **Root Directory** 請設為 `frontend/`（`vercel.json` 才會生效）。

---

## 活動資料流（重要）

```
文化部 API ─┐
            ├─► fetchAllCanonicalEvents（merge／去重）
新北 API ───┘         │
                      ▼
              filterActiveEvents（台灣日曆，結束日 < 今天才濾掉）
                      │
                      ▼
         POST/GET /api/events/sync ──► GAS replaceEvents ──► Sheet「EVENTS」
                      │
                      ▼
         GET /api/events ◄── GAS listEvents（空／失敗則 fallback live merge）
                      │
                      ▼
              前端列表／詳情／sitemap／OG
```

- **Canonical id**：`culture:901`、`ntpc:…`（內部）
- **網址**：`/events/culture-901`、`/events/ntpc-…`（dash，不用 `%3A`）
- 前端透過 `/api/events` 取資料，再 map 成舊 UI 用的 `OrgEvent`

相關程式：

| 路徑 | 用途 |
|------|------|
| `src/services/events/adapters/` | 各來源 adapter |
| `src/services/events/merge.ts` | 合併／去重 |
| `src/services/events/filterActive.ts` | 過期過濾 |
| `app/api/events/route.ts` | 讀取（Sheet → fallback live） |
| `app/api/events/sync/route.ts` | 同步寫入 Sheet |
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

環境變數只要一個：**`CRON_SECRET`**

| 情境 | 驗證方式 |
|------|----------|
| Vercel Cron 自動打 | `Authorization: Bearer <CRON_SECRET>`（Vercel 會自動帶） |
| 手動觸發 | 同上，或 Header `x-cron-secret: <CRON_SECRET>` |
| 本機未設 `CRON_SECRET` | 不擋（方便開發） |
| Production 有設 secret、請求不對 | `401 Unauthorized` |

Sync 本體：抓兩來源 → 過濾過期 → `GAS replaceEvents` **整批覆寫** Sheet `EVENTS` 分頁。

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

### Production 必備 env（活動相關）

| Key | 說明 |
|-----|------|
| `GAS_URL` | Apps Script Web App URL |
| `CRON_SECRET` | Cron／手動 sync 共用密鑰（**必設**，否則 sync 對外開放） |
| `NEXT_PUBLIC_BASE_URL` | 站台網址（分享、OG、sitemap） |

不需要另設 `EVENTS_SYNC_SECRET`（已統一成 `CRON_SECRET`）。

---

## Google OAuth Login

流程概要：

1. `/auth/login` → Google OAuth 授權  
2. Redirect 回 `/api/auth/login`  
3. 用 code 換 token，打 Google UserInfo  
4. 經 GAS 寫入／更新 Sheet（`updateGoogleUser`：空 `picture` 不覆寫既有頭像）  
5. 設 `cyc_session` Cookie，導向 dashboard  
6. logout 清除 Cookie  

另支援 LINE Login／LIFF（見 `.env.local` 的 `LINE_*`、`NEXT_PUBLIC_LIFF_ID_*`）。

### 必備設定連結

1. **Google OAuth Client**  
   https://console.cloud.google.com/auth/clients?project=cyc-studio-oauth  

   Authorized redirect URIs 需包含：

   - `http://localhost:3000/api/auth/login`
   - `https://your-domain.com/api/auth/login`

2. **Google Sheet**（GAS 寫入）  
   https://docs.google.com/spreadsheets/d/1CPBJowgWYTUNJGgI2ExwuvriPmHjXk2DKI9YmRrNdeg/edit?gid=1907587179#gid=1907587179

---

## 本機開發

```bash
npm install
npm run dev
```

GAS 變更請同步更新 `scripts/CURRENT_GAS.js`，並手動部署到 Apps Script。
