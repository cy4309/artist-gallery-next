/****************************************************
 *            GOOGLE APPS SCRIPT FINAL API
 *             USERS + FAVORITES 全功能版
 *  （for Next.js Server 端 axios，不需要 CORS header）
 ****************************************************/

/**
 * ====== GET 用於測試 ======
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "GAS API running" }),
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * ====== POST 主入口 ======
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    const result = handleAction(action, data);

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.toString() }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/********************************************************
 *  Action Router
 ********************************************************/
function handleAction(action, data) {
  // Google user flow
  if (action === "checkGoogleUser") return checkGoogleUser(data.email);
  if (action === "createGoogleUser") return createGoogleUser(data.user);
  if (action === "updateGoogleUser") return updateGoogleUser(data.user);

  // LINE user flow
  if (action === "checkLineUser") return checkLineUser(data.userId);
  if (action === "createLineUser") return createLineUser(data.user);
  if (action === "updateLineUser") return updateLineUser(data.user);

  // Favorite
  if (action === "toggleFavorite")
    return toggleFavorite(data.userId, data.eventId, data);

  if (action === "checkFavorite")
    return checkFavorite(data.userId, data.eventId);

  if (action === "ensureFavorite") return ensureFavorite(data.userId, data);

  if (action === "listFavorites") return listFavorites(data.userId);

  // Push Notification
  if (action === "registerPushToken") return registerPushToken(data);

  // Events sheet cache（Next.js 負責 merge；GAS 只整批讀寫）
  if (action === "replaceEvents") return replaceEvents(data);
  if (action === "listEvents") return listEvents();

  return { error: "Unknown action" };
}

/********************************************************
 *  Util：找欄位 index（動態適配 headers）
 ********************************************************/
function getColumnIndex(sheet, columnName) {
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return -1; // 空表時 getRange(..., 0) 會爆

  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const target = String(columnName).trim();

  for (let i = 0; i < header.length; i++) {
    if (String(header[i] || "").trim() === target) return i;
  }

  return -1;
}

/********************************************************
 * Util：格式化時間（如果之後要用可以直接呼叫）
 ********************************************************/
function formatDate(date = new Date()) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

/********************************************************
 * USERS — checkGoogleUser (Google Only)
 * 用 email 尋找，LINE Login 沒 email 不會用到這支
 ********************************************************/
function checkGoogleUser(email) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("USERS");
  const values = sheet.getDataRange().getValues();

  const col = {
    id: getColumnIndex(sheet, "id"),
    provider: getColumnIndex(sheet, "provider"),
    lineUserId: getColumnIndex(sheet, "lineUserId"),
    email: getColumnIndex(sheet, "email"),
    name: getColumnIndex(sheet, "name"),
    picture: getColumnIndex(sheet, "picture"),
    created_at: getColumnIndex(sheet, "created_at"),
    updated_at: getColumnIndex(sheet, "updated_at"),
  };

  for (let i = 1; i < values.length; i++) {
    if (values[i][col.email] === email) {
      return {
        exists: true,
        user: {
          id: values[i][col.id],
          provider: values[i][col.provider],
          lineUserId: values[i][col.lineUserId],
          email: values[i][col.email],
          name: values[i][col.name],
          picture: values[i][col.picture],
          created_at: values[i][col.created_at],
          updated_at: values[i][col.updated_at],
        },
      };
    }
  }

  return { exists: false };
}

/********************************************************
 * USERS — createGoogleUser (Google 新用戶)
 ********************************************************/
function createGoogleUser(user) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("USERS");
  const now = formatDate();

  const col = {
    id: getColumnIndex(sheet, "id"),
    provider: getColumnIndex(sheet, "provider"),
    lineUserId: getColumnIndex(sheet, "lineUserId"),
    email: getColumnIndex(sheet, "email"),
    name: getColumnIndex(sheet, "name"),
    picture: getColumnIndex(sheet, "picture"),
    created_at: getColumnIndex(sheet, "created_at"),
    updated_at: getColumnIndex(sheet, "updated_at"),
  };

  const row = new Array(sheet.getLastColumn()).fill("");

  row[col.id] = user.id; // google_xxx
  row[col.provider] = "google";
  row[col.lineUserId] = ""; // ⭐ Google 永遠空
  row[col.email] = user.email;
  row[col.name] = user.name;
  row[col.picture] = user.picture;
  row[col.created_at] = now;
  row[col.updated_at] = now;

  sheet.appendRow(row);

  return {
    success: true,
    user: {
      ...user,
      provider: "google",
      lineUserId: "",
      created_at: now,
      updated_at: now,
    },
  };
}

/********************************************************
 * USERS — updateGoogleUser (Google user 更新)
 * picture：有新值才覆寫；空字串不覆蓋既有頭像
 ********************************************************/
function updateGoogleUser(user) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("USERS");
  const values = sheet.getDataRange().getValues();
  const now = formatDate();

  const col = {
    email: getColumnIndex(sheet, "email"),
    name: getColumnIndex(sheet, "name"),
    picture: getColumnIndex(sheet, "picture"),
    updated_at: getColumnIndex(sheet, "updated_at"),
  };

  for (let i = 1; i < values.length; i++) {
    if (values[i][col.email] === user.email) {
      const rowIndex = i + 1;

      sheet.getRange(rowIndex, col.name + 1).setValue(user.name);
      // ⭐ 只在有新 picture 時覆寫，避免清空頭像
      if (user.picture) {
        sheet.getRange(rowIndex, col.picture + 1).setValue(user.picture);
      }
      sheet.getRange(rowIndex, col.updated_at + 1).setValue(now);

      const pictureValue = user.picture
        ? user.picture
        : values[i][col.picture];

      return {
        success: true,
        user: {
          ...user,
          provider: "google",
          lineUserId: "",
          picture: pictureValue,
          updated_at: now,
        },
      };
    }
  }

  return { error: "Google user not found" };
}

/********************************************************
 * USERS — checkLineUser (Line Only)
 * 使用 LINE id 當 primary key（沒有 email）
 ********************************************************/
function checkLineUser(userId) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("USERS");
  const values = sheet.getDataRange().getValues();

  const col = {
    id: getColumnIndex(sheet, "id"),
    provider: getColumnIndex(sheet, "provider"),
    lineUserId: getColumnIndex(sheet, "lineUserId"),
    email: getColumnIndex(sheet, "email"),
    name: getColumnIndex(sheet, "name"),
    picture: getColumnIndex(sheet, "picture"),
    created_at: getColumnIndex(sheet, "created_at"),
    updated_at: getColumnIndex(sheet, "updated_at"),
  };

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][col.id]) === String(userId)) {
      return {
        exists: true,
        user: {
          id: values[i][col.id],
          provider: values[i][col.provider],
          lineUserId: values[i][col.lineUserId],
          email: values[i][col.email],
          name: values[i][col.name],
          picture: values[i][col.picture],
          created_at: values[i][col.created_at],
          updated_at: values[i][col.updated_at],
        },
      };
    }
  }

  return { exists: false };
}

/********************************************************
 * USERS — createLineUser (Line Only)
 * 使用 LINE id 當 primary key（沒有 email）
 ********************************************************/
function createLineUser(user) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("USERS");
  const now = formatDate();

  const col = {
    id: getColumnIndex(sheet, "id"),
    provider: getColumnIndex(sheet, "provider"),
    lineUserId: getColumnIndex(sheet, "lineUserId"),
    email: getColumnIndex(sheet, "email"),
    name: getColumnIndex(sheet, "name"),
    picture: getColumnIndex(sheet, "picture"),
    created_at: getColumnIndex(sheet, "created_at"),
    updated_at: getColumnIndex(sheet, "updated_at"),
  };

  const row = new Array(sheet.getLastColumn()).fill("");

  row[col.id] = user.id; // line_xxx
  row[col.provider] = "line";
  row[col.lineUserId] = user.lineUserId; // 真正 LINE userId
  row[col.email] = ""; // LINE 沒 email
  row[col.name] = user.name;
  row[col.picture] = user.picture;
  row[col.created_at] = now;
  row[col.updated_at] = now;

  sheet.appendRow(row);

  return {
    success: true,
    user: {
      ...user,
      provider: "line",
      created_at: now,
      updated_at: now,
    },
  };
}

/********************************************************
 * USERS — updateLineUser (Line Only)
 * 使用 LINE id 當 primary key（沒有 email）
 ********************************************************/
function updateLineUser(user) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("USERS");
  const values = sheet.getDataRange().getValues();
  const now = formatDate();

  const col = {
    id: getColumnIndex(sheet, "id"),
    name: getColumnIndex(sheet, "name"),
    picture: getColumnIndex(sheet, "picture"),
    updated_at: getColumnIndex(sheet, "updated_at"),
  };

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][col.id]) === String(user.id)) {
      const rowIndex = i + 1;

      sheet.getRange(rowIndex, col.name + 1).setValue(user.name);
      sheet.getRange(rowIndex, col.picture + 1).setValue(user.picture);
      sheet.getRange(rowIndex, col.updated_at + 1).setValue(now);

      return {
        success: true,
        user: {
          ...user,
          provider: "line",
          updated_at: now,
        },
      };
    }
  }

  return { error: "LINE user not found" };
}

/********************************************************
 * FAVORITES — checkFavorite
 ********************************************************/
function checkFavorite(userId, eventId) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("USER_FAVORITES");
  const values = sheet.getDataRange().getValues();

  const col = {
    userId: getColumnIndex(sheet, "userId"),
    eventId: getColumnIndex(sheet, "eventId"),
  };

  for (let i = 1; i < values.length; i++) {
    if (
      String(values[i][col.userId]) === String(userId) &&
      String(values[i][col.eventId]) === String(eventId)
    ) {
      return { success: true, isFavorite: true };
    }
  }

  return { success: true, isFavorite: false };
}

/********************************************************
 * FAVORITES — toggleFavorite（加入 / 取消收藏，使用者主動用）
 * eventId = actId（string or number）
 ********************************************************/
function toggleFavorite(userId, eventId, payload) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("USER_FAVORITES");
  const values = sheet.getDataRange().getValues();

  const col = {
    id: getColumnIndex(sheet, "id"),
    userId: getColumnIndex(sheet, "userId"),
    eventId: getColumnIndex(sheet, "eventId"),
    eventTitle: getColumnIndex(sheet, "eventTitle"),
    eventStartDate: getColumnIndex(sheet, "eventStartDate"),
    eventEndDate: getColumnIndex(sheet, "eventEndDate"),
    eventLocation: getColumnIndex(sheet, "eventLocation"),
    eventUrl: getColumnIndex(sheet, "eventUrl"),
    imageUrl: getColumnIndex(sheet, "imageUrl"),
    createdAt: getColumnIndex(sheet, "createdAt"),
  };

  let targetRow = -1;

  // ① 檢查是否已收藏
  for (let i = 1; i < values.length; i++) {
    if (
      String(values[i][col.userId]) === String(userId) &&
      String(values[i][col.eventId]) === String(eventId)
    ) {
      targetRow = i + 1;
      break;
    }
  }

  // ② 已存在 → 取消收藏（❗這條路徑不能要求 payload）
  if (targetRow > -1) {
    sheet.deleteRow(targetRow);
    return { success: true, isFavorite: false };
  }

  // ③ 新增收藏 → 這時才需要 eventTitle
  if (!payload || !payload.eventTitle) {
    throw new Error("toggleFavorite: eventTitle required when adding");
  }

  const row = new Array(sheet.getLastColumn()).fill("");
  const now = formatDate();

  if (col.id > -1) row[col.id] = Utilities.getUuid();
  if (col.userId > -1) row[col.userId] = String(userId);
  if (col.eventId > -1) row[col.eventId] = String(eventId);

  if (col.eventTitle > -1) row[col.eventTitle] = payload.eventTitle;
  if (col.eventStartDate > -1 && payload.eventStartDate)
    row[col.eventStartDate] = payload.eventStartDate;
  if (col.eventEndDate > -1 && payload.eventEndDate)
    row[col.eventEndDate] = payload.eventEndDate;
  if (col.eventLocation > -1 && payload.eventLocation)
    row[col.eventLocation] = payload.eventLocation;
  if (col.eventUrl > -1 && payload.eventUrl)
    row[col.eventUrl] = payload.eventUrl;
  if (payload.imageUrl && col.imageUrl > -1)
    row[col.imageUrl] = payload.imageUrl;

  if (col.createdAt > -1) row[col.createdAt] = now;

  sheet.appendRow(row);

  return { success: true, isFavorite: true };
}

/********************************************************
 * FAVORITES — ensureFavorite（加入 / 取消收藏，系統被動確認用）
 * eventId = actId（string or number）
 ********************************************************/
function ensureFavorite(userId, payload) {
  if (!payload || !payload.eventId) {
    throw new Error("ensureFavorite: eventId required");
  }

  const check = checkFavorite(userId, payload.eventId);

  // ⭐ 不存在 → 新增
  if (!check.isFavorite) {
    toggleFavorite(userId, payload.eventId, payload);

    // ⭐⭐ 關鍵：包一層，保證 success 一定存在
    return {
      success: true,
      isFavorite: true,
      created: true,
    };
  }

  // ⭐ 已存在
  return {
    success: true,
    isFavorite: true,
    created: false,
  };
}

/********************************************************
 * FAVORITES — listFavorites（列出使用者全部收藏）
 ********************************************************/
function listFavorites(userId) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("USER_FAVORITES");
  const values = sheet.getDataRange().getValues();

  const col = {
    userId: getColumnIndex(sheet, "userId"),
    eventId: getColumnIndex(sheet, "eventId"),
    eventTitle: getColumnIndex(sheet, "eventTitle"),
    eventStartDate: getColumnIndex(sheet, "eventStartDate"),
    eventEndDate: getColumnIndex(sheet, "eventEndDate"),
    eventLocation: getColumnIndex(sheet, "eventLocation"),
    eventUrl: getColumnIndex(sheet, "eventUrl"),
    imageUrl: getColumnIndex(sheet, "imageUrl"),
    createdAt: getColumnIndex(sheet, "createdAt"),
  };

  const list = [];

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][col.userId]) === String(userId)) {
      list.push({
        eventId: col.eventId > -1 ? String(values[i][col.eventId]) : "",
        eventTitle: col.eventTitle > -1 ? values[i][col.eventTitle] : "",
        eventStartDate:
          col.eventStartDate > -1 ? values[i][col.eventStartDate] : "",
        eventEndDate: col.eventEndDate > -1 ? values[i][col.eventEndDate] : "",
        eventLocation:
          col.eventLocation > -1 ? values[i][col.eventLocation] : "",
        eventUrl: col.eventUrl > -1 ? values[i][col.eventUrl] : "",
        imageUrl: col.imageUrl > -1 ? values[i][col.imageUrl] : "",
        createdAt: col.createdAt > -1 ? values[i][col.createdAt] : "",
      });
    }
  }

  return { success: true, favorites: list };
}

/********************************************************
 * PUSH — getOrCreateDevicePushTokensSheet
 * 工作表 DEVICE_PUSH_TOKENS；沒有就建立
 * 欄位順序可變：只保證必要標題存在，缺的才補在標題列後面
 ********************************************************/
function getOrCreateDevicePushTokensSheet() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName("DEVICE_PUSH_TOKENS");
  const requiredHeaders = [
    "expoPushToken",
    "platform",
    "userId",
    "updatedAt",
    "createdAt",
  ];

  if (!sheet) {
    sheet = ss.insertSheet("DEVICE_PUSH_TOKENS");
    sheet.appendRow(requiredHeaders);
    return sheet;
  }

  // 既有表：不重排欄位，只把缺少的標題補到最後
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const existing = header.map(function (h) {
    return String(h || "").trim();
  });

  // 空表（沒標題）→ 寫入必要標題
  const hasAnyHeader = existing.some(function (h) {
    return h !== "";
  });
  if (!hasAnyHeader) {
    sheet
      .getRange(1, 1, 1, requiredHeaders.length)
      .setValues([requiredHeaders]);
    return sheet;
  }

  requiredHeaders.forEach(function (name) {
    if (existing.indexOf(name) === -1) {
      const newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue(name);
      existing.push(name);
    }
  });

  return sheet;
}

/********************************************************
 * PUSH — registerPushToken
 * 以 expoPushToken 當唯一鍵；同一 token 再來 → 更新，不重複新增
 * userId 可空（未登入也能註冊）
 * 欄位用 getColumnIndex 動態找，順序可變
 * Next.js 會送：{ action, expoPushToken, platform, userId? }
 ********************************************************/
function registerPushToken(data) {
  const token = String(data.expoPushToken || "").trim();
  const platform = String(data.platform || "").trim();
  const userId =
    data.userId === null || data.userId === undefined || data.userId === ""
      ? ""
      : String(data.userId).trim();

  if (!token || token.indexOf("ExponentPushToken[") !== 0) {
    return { success: false, error: "Invalid expoPushToken" };
  }

  if (platform !== "ios" && platform !== "android") {
    return { success: false, error: "Invalid platform" };
  }

  const sheet = getOrCreateDevicePushTokensSheet();
  const now = formatDate();

  let col = {
    expoPushToken: getColumnIndex(sheet, "expoPushToken"),
    platform: getColumnIndex(sheet, "platform"),
    userId: getColumnIndex(sheet, "userId"),
    updatedAt: getColumnIndex(sheet, "updatedAt"),
    createdAt: getColumnIndex(sheet, "createdAt"),
  };

  // 必要欄位找不到就明確失敗，避免只寫到某一欄
  if (
    col.expoPushToken < 0 ||
    col.platform < 0 ||
    col.updatedAt < 0 ||
    col.createdAt < 0
  ) {
    return {
      success: false,
      error:
        "DEVICE_PUSH_TOKENS missing required headers (expoPushToken, platform, updatedAt, createdAt)",
    };
  }

  const values = sheet.getDataRange().getValues();

  // ① 已存在 → 更新 platform / userId / updatedAt（依標題找欄，不靠順序）
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][col.expoPushToken]) === token) {
      const rowIndex = i + 1;

      sheet.getRange(rowIndex, col.platform + 1).setValue(platform);
      if (col.userId > -1)
        sheet.getRange(rowIndex, col.userId + 1).setValue(userId);
      sheet.getRange(rowIndex, col.updatedAt + 1).setValue(now);

      return { success: true, created: false };
    }
  }

  // ② 新 token → 依標題 index 填入（同 USERS / USER_FAVORITES 寫法）
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const row = new Array(lastCol).fill("");

  row[col.expoPushToken] = token;
  row[col.platform] = platform;
  if (col.userId > -1) row[col.userId] = userId;
  row[col.updatedAt] = now;
  row[col.createdAt] = now;

  sheet.appendRow(row);

  return { success: true, created: true };
}

/********************************************************
 * EVENTS — getOrCreateEventsSheet
 * 工作表 EVENTS；沒有就建立
 * 預設欄位與 Next CanonicalEvent 對齊；既有表不重排，只補缺的標題
 ********************************************************/
function getOrCreateEventsSheet(preferredColumns) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName("EVENTS");
  const defaultHeaders = [
    "id",
    "source",
    "sourceId",
    "title",
    "startTime",
    "endTime",
    "cityName",
    "address",
    "description",
    "website",
    "imageUrl",
    "syncedAt",
  ];
  const requiredHeaders =
    preferredColumns && preferredColumns.length
      ? preferredColumns.map(function (h) {
          return String(h || "").trim();
        })
      : defaultHeaders;

  if (!sheet) {
    sheet = ss.insertSheet("EVENTS");
    sheet.appendRow(requiredHeaders);
    return sheet;
  }

  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const existing = header.map(function (h) {
    return String(h || "").trim();
  });

  const hasAnyHeader = existing.some(function (h) {
    return h !== "";
  });
  if (!hasAnyHeader) {
    sheet
      .getRange(1, 1, 1, requiredHeaders.length)
      .setValues([requiredHeaders]);
    return sheet;
  }

  requiredHeaders.forEach(function (name) {
    if (name && existing.indexOf(name) === -1) {
      const newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue(name);
      existing.push(name);
    }
  });

  return sheet;
}

/********************************************************
 * EVENTS — replaceEvents
 * 整批覆寫 EVENTS（先清資料列，再寫 header + rows）
 * Next.js 會送：{ action, columns: string[], rows: any[][] }
 * 不做 normalize / merge / dedupe
 ********************************************************/
function replaceEvents(data) {
  const columns = Array.isArray(data.columns) ? data.columns : [];
  const rows = Array.isArray(data.rows) ? data.rows : [];

  if (!columns.length) {
    return { ok: false, success: false, error: "replaceEvents: columns required" };
  }

  const headers = columns.map(function (h) {
    return String(h || "").trim();
  });
  const sheet = getOrCreateEventsSheet(headers);

  // 清掉舊資料（保留工作表本身）
  const lastRow = sheet.getLastRow();
  const lastCol = Math.max(sheet.getLastColumn(), headers.length);
  if (lastRow > 0) {
    sheet.getRange(1, 1, lastRow, lastCol).clearContent();
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  if (rows.length > 0) {
    // 依 columns 長度對齊每一列，避免欄數不一致
    const normalized = rows.map(function (row) {
      const out = new Array(headers.length).fill("");
      const src = Array.isArray(row) ? row : [];
      for (let i = 0; i < headers.length; i++) {
        out[i] =
          src[i] === null || src[i] === undefined ? "" : String(src[i]);
      }
      return out;
    });

    // getRange(row, column, numRows, numColumns) — 第三參數是「列數」，不是結束列
    sheet
      .getRange(2, 1, normalized.length, headers.length)
      .setValues(normalized);
  }

  return {
    ok: true,
    success: true,
    count: rows.length,
  };
}

/********************************************************
 * EVENTS — listEvents
 * 整批讀取 EVENTS → 回傳物件陣列（依 header 動態組 key）
 ********************************************************/
function listEvents() {
  const sheet = getOrCreateEventsSheet();
  const values = sheet.getDataRange().getValues();

  if (!values || values.length < 2) {
    return { ok: true, success: true, events: [] };
  }

  const headers = values[0].map(function (h) {
    return String(h || "").trim();
  });
  const events = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    let hasValue = false;

    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) continue;
      const cell = row[c];
      const value =
        cell === null || cell === undefined
          ? ""
          : cell instanceof Date
            ? cell.toISOString()
            : String(cell);
      obj[key] = value;
      if (value !== "") hasValue = true;
    }

    // 略過整列空白
    if (!hasValue) continue;
    events.push(obj);
  }

  return { ok: true, success: true, events: events };
}

// 以下收藏陣列寫法，不建議，gas直接抓一筆一筆比較快
// /****************************************************
//  * FAVORITES — JSON array eventIds
//  ****************************************************/
// function checkFavorite(userId, eventId) {
//   const sheet = SpreadsheetApp.getActive().getSheetByName("USER_FAVORITES");
//   const values = sheet.getDataRange().getValues();

//   const col = {
//     userId: getColumnIndex(sheet, "userId"),
//     eventIds: getColumnIndex(sheet, "eventIds"),
//   };

//   const uid = String(userId);
//   const eid = Number(eventId);

//   for (let i = 1; i < values.length; i++) {
//     if (String(values[i][col.userId]) === uid) {
//       const list = JSON.parse(values[i][col.eventIds] || "[]");
//       return { success: true, isFavorite: list.includes(eid) };
//     }
//   }

//   return { success: true, isFavorite: false };
// }

// function toggleFavorite(userId, eventId) {
//   const sheet = SpreadsheetApp.getActive().getSheetByName("USER_FAVORITES");
//   const values = sheet.getDataRange().getValues();

//   const col = {
//     userId: getColumnIndex(sheet, "userId"),
//     eventIds: getColumnIndex(sheet, "eventIds"),
//   };

//   const uid = String(userId);
//   const eid = Number(eventId);

//   let targetRow = -1;
//   let list = [];

//   for (let i = 1; i < values.length; i++) {
//     if (String(values[i][col.userId]) === uid) {
//       targetRow = i + 1;
//       list = JSON.parse(values[i][col.eventIds] || "[]");
//       break;
//     }
//   }

//   if (targetRow === -1) {
//     sheet.appendRow([uid, JSON.stringify([eid])]);
//     return { success: true, isFavorite: true };
//   }

//   if (list.includes(eid)) {
//     list = list.filter((id) => id !== eid);
//     sheet.getRange(targetRow, col.eventIds + 1).setValue(JSON.stringify(list));
//     return { success: true, isFavorite: false };
//   } else {
//     list.push(eid);
//     sheet.getRange(targetRow, col.eventIds + 1).setValue(JSON.stringify(list));
//     return { success: true, isFavorite: true };
//   }
// }

// function listFavorites(userId) {
//   const sheet = SpreadsheetApp.getActive().getSheetByName("USER_FAVORITES");
//   const values = sheet.getDataRange().getValues();

//   const col = {
//     userId: getColumnIndex(sheet, "userId"),
//     eventIds: getColumnIndex(sheet, "eventIds"),
//   };

//   const uid = String(userId);

//   for (let i = 1; i < values.length; i++) {
//     if (String(values[i][col.userId]) === uid) {
//       const list = JSON.parse(values[i][col.eventIds] || "[]");
//       return { success: true, favorites: list };
//     }
//   }

//   return { success: true, favorites: [] };
// }
