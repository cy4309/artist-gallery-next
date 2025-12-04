"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { ConfigProvider, theme } from "antd";
import { setDarkMode } from "@/stores/features/styleSlice";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.style.isDarkMode);

  // 進入網站時，從 localStorage 讀 darkMode
  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";
    dispatch(setDarkMode(darkMode));
  }, [dispatch]);

  // 每次切換 darkMode → 套在 <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme[isDarkMode ? "darkAlgorithm" : "defaultAlgorithm"],
      }}
    >
      {children}
    </ConfigProvider>
  );
}
