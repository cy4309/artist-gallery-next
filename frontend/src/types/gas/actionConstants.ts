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
} as const;

// 👉 所有合法 action 字串 union
export type GasAction = (typeof GAS_ACTION)[keyof typeof GAS_ACTION];
