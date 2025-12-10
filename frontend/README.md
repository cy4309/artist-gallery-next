# CYC Zine – Google OAuth + Next.js App Router

這個專案是以 Next.js 15 App Router 開發，並整合：
✔ Google OAuth 2.0 Login
✔ Next.js Server Actions + Route Handlers
✔ Cookies-Based Session
✔ Google Apps Script（GAS）串接 Google Sheet 作為資料庫
✔ Protected Routes（以 middleware 進行登入保護）
✔ 自動注入 Google OAuth → GAS → Cookie → Dashboard

## Google OAuth Login

使用者透過 Google 帳號一鍵登入：

/auth/login → Google OAuth 授權

Google Redirect 回 /api/auth/login

Next.js 用 authorization code 換取 access_token & id_token

用 token 向 Google UserInfo API 取得 name, email, picture

將使用者資料寫入 Google Sheet（使用 GAS API）

設置 cyc_session Cookie，作為登入狀態

導向 /dashboard

logout: 清除 Cookie

## 必備設定（重要連結提醒）

1. Google OAuth Client 設定

👉 Google Cloud OAuth Client 設定：
https://console.cloud.google.com/auth/clients?project=cyc-studio-oauth

⚠️ 記得在 Authorized redirect URIs 加入：

http://localhost:3000/api/auth/login
https://your-domain.com/api/auth/login

2. 使用者資料儲存的 Google Sheet（由 GAS 負責寫入）

👉 Google Sheet：
https://docs.google.com/spreadsheets/d/1CPBJowgWYTUNJGgI2ExwuvriPmHjXk2DKI9YmRrNdeg/edit?gid=1907587179#gid=1907587179
