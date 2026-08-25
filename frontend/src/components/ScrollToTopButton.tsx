"use client";

import { useEffect, useState } from "react";
import { VerticalAlignTopOutlined } from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
import {
  getEventsScrollRoot,
  restoreEventsScrollY,
} from "@/utils/eventsBrowseState";

const SHOW_AFTER_PX = 280;

type ScrollToTopButtonProps = {
  className?: string;
};

/** 捲過一段距離後顯示，點擊回到捲動容器頂部 */
export default function ScrollToTopButton({
  className = "",
}: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const root = getEventsScrollRoot();
    if (!root) return;

    const onScroll = () => {
      setVisible(root.scrollTop > SHOW_AFTER_PX);
    };

    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <BaseButton
        className="bg-white dark:bg-primary shadow-md !px-3 !py-2.5"
        onClick={() => restoreEventsScrollY(0)}
      >
        <VerticalAlignTopOutlined className="text-lg" />
        {/* <span className="ml-1 text-xs font-semibold">最上</span> */}
      </BaseButton>
    </div>
  );
}
