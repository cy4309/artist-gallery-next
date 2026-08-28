"use client";

import { useEffect } from "react";

/** 降低一般使用者右鍵／拖曳存圖；無法阻擋截圖或開發者工具 */
export default function ImageProtection() {
  useEffect(() => {
    const blockIfProtectedImage = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      if (target.closest("[data-allow-download]")) return false;
      return Boolean(target.closest("main img, main picture"));
    };

    const onContextMenu = (e: MouseEvent) => {
      if (blockIfProtectedImage(e.target)) e.preventDefault();
    };

    const onDragStart = (e: DragEvent) => {
      if (blockIfProtectedImage(e.target)) e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return null;
}
