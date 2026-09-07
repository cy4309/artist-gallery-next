# Events 列表 URL 為 source of truth

**日期：** 2026-09-07  
**狀態：** 已實作（方案 B；後續改為英文代號）

## 目標

縣市（必要時含類型）寫進 `/events` 查詢字串，作為列表瀏覽的 source of truth，以便分享／重整後仍在同一篩選，並解鎖後續列表走與詳情相同的 server 資料門。

## 非目標（本階段不做／另案已做）

- 關鍵字搜尋 `q`、日期篩選進 URL（仍不做）
- TanStack Query、Redux、CI E2E（仍不做）
- ~~詳情頁改成 Server Component~~ → **已另案完成**（見 roadmap）
- ~~URL 用中文縣市／類型~~ → **已改英文代號**（見下）

## URL 形狀（現行）

```
/events?city=taipei
/events?city=taipei&categories=exhibition,music
/events?city=all&categories=music
```

- `city`／`categories` 皆用英文代號（`CityCode`／`EventCategoryCode`）；舊中文仍可 parse
- 有選縣市才寫 `city`（含 `all`＝全部城市）
- 全選類型時**省略** `categories`
- **無 `city`** → 不發縣市瀏覽請求（`buildCityBrowseFetchOptions` → `null`）
- **`city=all` + 全選類型** → `getOrgData({})`（等同舊版全台；例外允許）
- **`city=all` + 縮小類型** → 只帶 `categories`
- 詳情路徑：`/events/culture-…`（可選 `?categories=`；全選則乾淨路徑）

## 優先序（進入 `/events`）

1. URL 有 `city` → 還原並 `getOrgData`（參數見上）
2. 否則 sessionStorage 瀏覽狀態（相容舊行為）→ 還原後**回寫 URL**
3. 否則類型 localStorage／類型選擇／地圖初始

## 行為契約（測試要保護）

1. 已選類型 + 點台北 → fetch options 帶 `city: "台北市"`（及非全選時的 categories）
2. 假活動 id →「找不到這個活動」（中文契約；UI 另走 `t.events.notFound`）

## AGENTS.md

短令：詳情保持 Server Component；列表勿無 city 灌全國；勿為列表開 Redux；先量再改；列表縣市瀏覽以 URL 為準；詳情分享優先乾淨路徑。
