# Cloudflare data-api（Workers + D1）

放在 `frontend/cloudflare-data-api/`，與 Next 同目錄管理，但 **npm／部署仍獨立**（Wrangler，不是 `next build`）。

取代 GAS 冷啟動；Next.js 透過 `DATA_BACKEND` 切換。D1 binding 名稱為 **`cyc_data`**（見 `wrangler.toml`）。

## 資料表

| 表 | 用途 |
|----|------|
| `events` | 活動快取（sync／admin CRUD） |
| `users` | Google／LINE 使用者 |
| `user_favorites` | 收藏 |
| `device_push_tokens` | Expo Push token |
| `meta` | 例如上次活動 sync 時間 |

時間戳以 **Asia/Taipei**（`YYYY-MM-DD HH:mm:ss`）寫入。

## 一次部署

```bash
cd frontend/cloudflare-data-api
npm i
npx wrangler login
npx wrangler d1 create cyc-data
# 把回傳的 database_id 填進 wrangler.toml
npm run db:remote
npx wrangler secret put DATA_API_SECRET
npm run deploy
```

記下 Worker URL，例如 `https://cyc-data-api.<account>.workers.dev`。

之後程式有改：

```bash
npm run deploy
```

## Next.js 環境變數

在 `frontend/.env.local` **與 Vercel Production** 都要設：

```env
# cloudflare | gas（未設時：有 CF_DATA_API_URL → cloudflare）
DATA_BACKEND=cloudflare
CF_DATA_API_URL=https://cyc-data-api.xxxxx.workers.dev
CF_DATA_API_SECRET=與 wrangler secret DATA_API_SECRET 相同
ADMIN_SECRET=後台登入用長字串

# 備援／遷移來源（建議保留）
GAS_URL=https://script.google.com/macros/s/.../exec
CRON_SECRET=活動排程同步用
```

切回 GAS：`DATA_BACKEND=gas`。

## 資料怎麼進 D1

| 類型 | 寫入時機 |
|------|----------|
| **使用者** | Google／LINE 登入、LINE follow webhook → upsert |
| **收藏** | `/api/favorites/*` |
| **Push** | `/api/push/register` |
| **活動** | Vercel Cron `/api/events/sync`、admin「手動同步」、admin CRUD |

`DATA_BACKEND=cloudflare` 時，上述皆經 `postToDataBackend` 打本 Worker。  
Admin（`/admin`）讀的也是同一後端；列表需重新整理才會更新（非即時推播）。

## 從 GAS 遷移（歷史資料）

程式碼路徑已接好；GAS 需已部署含 `listAllUsers`／`listAllFavorites`／`listAllPushTokens` 的版本（見 `frontend/scripts/CURRENT_GAS.js`）。

1. 設好 `GAS_URL` + `CF_DATA_API_*`（可先 `DATA_BACKEND=gas` 或已切 cloudflare 皆可）
2. 開 `/admin`，用 `ADMIN_SECRET` 登入
3. 展開「資料同步與遷移」，依序：
   - 遷移活動／使用者／收藏／Push（可分項；失敗可重跑該項）
   - 或之後用「手動同步」從外部 API 重抓活動進 CF
4. 確認 `DATA_BACKEND=cloudflare`，Vercel／本機重啟後即讀 D1

遷移會 **整批覆寫** 對應 CF 表（含去重），請確認再按。

## 本地開發 Worker

```bash
cd frontend/cloudflare-data-api
npm run db:local
npm run dev
```

Next `.env.local`：

```env
CF_DATA_API_URL=http://127.0.0.1:8787
```

## 驗證請求

Worker 若設了 `DATA_API_SECRET`，請求需帶：

```http
X-Data-Api-Secret: <secret>
```

Next 的 `CF_DATA_API_SECRET` 會自動帶上。
