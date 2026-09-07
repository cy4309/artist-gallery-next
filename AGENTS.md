# Agent 令（短）

- **詳情 `/events/[id]`**：保持 Server Component 方向；不要為了方便整頁改成 Client／灌 Redux。路徑用 dash（`culture-…`）；分享優先乾淨 URL，非全選類型才可帶 `?categories=` 篩 peers。
- **列表 `/events`**：縣市瀏覽以 **URL query（`city`、`categories` 英文代號）為 source of truth**；無 `city` 不要灌全國（`city=all` + 全選除外可 `{}`）。
- **狀態**：不要為列表 hover／clickedId／捲動開 Redux；捲動可用 sessionStorage。
- **改效能前先量**：重複請求再談 TanStack Query；慢再查後端／payload；先量再改。
- **測試**：保護「已選類型 + 點縣市 → `/api/events` 帶 city」；假 id →「找不到這個活動」。
- **語系**：client 持久化（對齊 theme／`cyc-locale`）；UI 文案走 locale，勿再硬編碼中文類型／縣市標籤。
