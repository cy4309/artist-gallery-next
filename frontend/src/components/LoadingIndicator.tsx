"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type LoadingIndicatorProps = {
  label?: string;
  className?: string;
  /** inline：活動等小區域；intro：首頁全幅雙層揭示 */
  variant?: "inline" | "intro";
  /** intro：為 true 才開始滑開（例如影片已可播） */
  ready?: boolean;
  onComplete?: () => void;
};

const INTRO_HOLD_MS = 480;
/** 第一層較慢；第二層較快但稍晚起步，約略同時離場完成 */
const LAYER1_DURATION = 1.2;
const LAYER2_DURATION = 0.95;
const LAYER2_DELAY = 0.25;

const exitEase = [0.76, 0, 0.24, 1] as const;

function InlineLoading({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-1 min-h-0 w-full items-center justify-center ${className ?? ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="loader" aria-hidden="true" />
        {label ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        ) : null}
      </div>
    </div>
  );
}

function IntroLoading({
  ready = false,
  onComplete,
}: {
  ready?: boolean;
  onComplete?: () => void;
}) {
  const [holdDone, setHoldDone] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setHoldDone(true), INTRO_HOLD_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (holdDone && ready) setExiting(true);
  }, [holdDone, ready]);

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
    >
      {/* 第一層（主色）：先動、較慢 */}
      <motion.div
        className="absolute inset-0 z-0 bg-white dark:bg-primary"
        initial={{ y: "0%" }}
        animate={{ y: exiting ? "-100%" : "0%" }}
        transition={{
          ease: exitEase,
          duration: LAYER1_DURATION,
          delay: 0,
        }}
        onAnimationComplete={() => {
          if (exiting) onComplete?.();
        }}
      />
      {/* 第二層（灰）：稍晚起步、較快追趕後一同上離場 */}
      <motion.div
        className="absolute inset-0 z-[1] bg-neutral-400 dark:bg-neutral-600"
        initial={{ y: "0%" }}
        animate={{ y: exiting ? "-100%" : "0%" }}
        transition={{
          ease: exitEase,
          duration: LAYER2_DURATION,
          delay: exiting ? LAYER2_DELAY : 0,
        }}
      />

      <motion.div
        className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-5 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={exiting ? { opacity: 0, y: -28 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <p className="font-dela text-3xl tracking-[0.12em] text-primary dark:text-white md:text-5xl">
          CYC <span className="tracking-[0.18em]">ZINE</span>
        </p>
        <div className="loader scale-75 opacity-70" aria-hidden="true" />
      </motion.div>
    </div>
  );
}

const LoadingIndicator = ({
  label,
  className,
  variant = "inline",
  ready,
  onComplete,
}: LoadingIndicatorProps) => {
  if (variant === "intro") {
    return <IntroLoading ready={ready} onComplete={onComplete} />;
  }
  return <InlineLoading label={label} className={className} />;
};

export default LoadingIndicator;
