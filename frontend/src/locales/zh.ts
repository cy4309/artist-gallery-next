import { Descriptions } from "antd";

export const zh = {
  header: {
    events: "活動",
    favorites: "收藏",
    interviews: "專欄",
    about: "關於我們",
    switchToZh: "中文",
    switchToEn: "ENGLISH",
    switchToDark: "深色模式",
    switchToLight: "淺色模式",
    logout: "登出",
    login: "登入",
  },
  footer: {
    title: "© 2022 CYC 獨立雜誌",
    privacy: "隱私權政策",
    terms: "使用條款",
  },
  notification: {
    unfavoriteConfirm: {
      title: "確定取消收藏？",
      text: "此活動將從你的收藏清單中移除",
      confirm: "確定取消",
      cancel: "保留收藏",
    },
    unfavoriteSuccess: {
      title: "已取消收藏",
    },
    favoriteSuccess: {
      title: "已加入收藏",
    },
    auth: {
      login: {
        title: "登入成功",
        text: "歡迎回來👋",
      },
      logout: {
        title: "登出成功",
        text: "下次再見👋",
      },
    },
  },
  auth: {
    processing: {
      title: "正在登入中…",
      description: "請稍候，我們正在完成登入流程。",
    },
    title: "CYC 獨立雜誌",
    subtitle: "探索台灣的文化故事，打造你的靈感地圖。",
    intro: {
      title: "登入後你可以：",
      item1: "⭐ 收藏並管理你喜歡的活動",
      item2: "🧭 快速回到你關注的活動",
      note: "* CYC Zine 僅使用你的 Google 基本資料（姓名、Email、頭像）作為登入用途。",
    },
    footer: {
      prefix: "登入即表示你同意我們的",
      privacy: "隱私權政策",
      and: "與",
      terms: "使用條款",
    },
  },
  home: {
    title: "探索文化故事。",
    body: ["我們精選城市中的展覽、音樂與創作，", "收藏屬於你的靈感地圖。"],
  },
  about: {
    title: "從一個故事開始，探索文化。",
    body: [
      "CYC Zine 是一個獨立的數位文化專案，致力於呈現台灣多元的文化樣貌——從展覽、演出到由社群驅動的文化行動。",
      "我們的目標很單純：幫助人們發現有意義的活動，同時看見活動背後的故事與創作者。",
      "如果你是創作者、策展人、文化工作者，或只是喜歡我們正在做的事——都歡迎與我們聯繫。",
    ],
    contact: "聯絡我們",
  },
  interviews: {
    continue: "持續新增中...",
    hero: {
      title: "專欄精選。",
      description:
        "這裡收錄我們精選的台灣文化人物與故事。不只是閱讀，而是一步步建立你的文化靈感地圖。",
    },
    filter: {
      group: {
        type: "類型",
        culture: "文化",
        role: "角色",
        medium: "媒介",
      },
    },
    tagMap: {
      all: "全部",
      // type類型
      music: "音樂",
      visual: "視覺",
      // culture文化
      underground: "地下文化",
      indie: "獨立",
      // role角色
      curation: "策展",
      artManagement: "藝文經紀",
      // medium媒介
      tattoo: "刺青",
      threeDAnimation: "3D 動畫",
      digitalArt: "數位藝術",
      photography: "攝影",
    },
  },
  events: {
    title: "請選擇城市",
  },
  favorites: {
    sortedHint: "依收藏時間排序（新 → 舊）",
    hint: "已結束活動排在最後",
  },
};
