export const GAS_ACTION = {
  // google
  CHECK_GOOGLE_USER: "checkGoogleUser",
  CREATE_GOOGLE_USER: "createGoogleUser",
  UPDATE_GOOGLE_USER: "updateGoogleUser",

  // line
  CHECK_LINE_USER: "checkLineUser",
  CREATE_LINE_USER: "createLineUser",
  UPDATE_LINE_USER: "updateLineUser",

  // favorite
  TOGGLE_FAVORITE: "toggleFavorite",
  CHECK_FAVORITE: "checkFavorite",
  ENSURE_FAVORITE: "ensureFavorite",
  LIST_FAVORITES: "listFavorites",

  // push
  REGISTER_PUSH_TOKEN: "registerPushToken",

  // events sheet
  REPLACE_EVENTS: "replaceEvents",
  LIST_EVENTS: "listEvents",

  // migration dumps (GAS → CF)
  LIST_ALL_USERS: "listAllUsers",
  LIST_ALL_FAVORITES: "listAllFavorites",
  LIST_ALL_PUSH_TOKENS: "listAllPushTokens",
  REPLACE_USERS: "replaceUsers",
  REPLACE_FAVORITES: "replaceFavorites",
  REPLACE_PUSH_TOKENS: "replacePushTokens",

  // admin (Cloudflare D1；GAS 可能不支援)
  UPSERT_EVENT: "upsertEvent",
  PATCH_EVENT_IMAGES: "patchEventImages",
  CLEAR_EVENT_IMAGES: "clearEventImages",
  CLEAR_SEARCH_IMAGES: "clearSearchImages",
  DELETE_EVENT: "deleteEvent",
  ADMIN_STATS: "adminStats",
  LIST_USERS: "listUsers",
  LIST_FAVORITES_ADMIN: "listFavoritesAdmin",
  LIST_PUSH_TOKENS: "listPushTokens",
} as const;

// 👉 所有合法 action 字串 union
export type GasAction = (typeof GAS_ACTION)[keyof typeof GAS_ACTION];
