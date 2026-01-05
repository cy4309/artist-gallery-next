"use client";

import { useState, useEffect, useCallback } from "react";

export interface DrawerController {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

interface UseDrawerOptions {
  /** 是否鎖住背景 scroll（default: true） */
  lockScroll?: boolean;
  /** 是否支援 ESC 關閉（default: true） */
  closeOnEsc?: boolean;
}

export function useDrawer(options: UseDrawerOptions = {}): DrawerController {
  const { lockScroll = true, closeOnEsc = true } = options;
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    // ① 防止背景 scroll
    if (lockScroll) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }

    // ② ESC 關閉選單
    function onKeyDown(e: KeyboardEvent) {
      if (closeOnEsc && e.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      if (lockScroll) {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, lockScroll, closeOnEsc, close]);

  return {
    isOpen,
    open,
    close,
  };
}
