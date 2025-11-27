import { configureStore } from "@reduxjs/toolkit";
import styleReducer from "@/stores/features/styleSlice";
import userReducer from "@/stores/features/userSlice";

export const setupStore = () =>
  configureStore({
    reducer: {
      style: styleReducer,
      user: userReducer,
    },
  });

// ---- 產生 store instance ----
export const store = setupStore();

// ---- 設定 axios interceptors (for RTK Query axiosInstance) ----
// setupAxiosInterceptors(store);

// ---- 型別推導 ----
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof setupStore>;
