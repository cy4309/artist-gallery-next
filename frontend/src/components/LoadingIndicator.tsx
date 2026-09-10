"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type LoadingIndicatorProps = {
  label?: string;
  className?: string;
  /** inline：活動等小區域；intro：首頁全幅雙層揭示 */
  variant?: "inline" | "intro";
  /** intro：為 true 才開始滑開（例如影片已可播） */
  ready?: boolean;
  /** intro：開始滑開當下（可比 onComplete 早，用來提早播影片） */
  onExitStart?: () => void;
  onComplete?: () => void;
};

const INTRO_HOLD_MS = 480;
/** 第一層較慢；第二層較快但稍晚起步，約略同時離場完成 */
const LAYER1_DURATION = 1.15;
const LAYER2_DURATION = 0.9;
const LAYER2_DELAY = 0.22;

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
  onExitStart,
  onComplete,
}: {
  ready?: boolean;
  onExitStart?: () => void;
  onComplete?: () => void;
}) {
  const [holdDone, setHoldDone] = useState(false);
  const exitStartedRef = useRef(false);
  const exiting = holdDone && ready;

  useEffect(() => {
    const t = window.setTimeout(() => setHoldDone(true), INTRO_HOLD_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!exiting || exitStartedRef.current) return;
    exitStartedRef.current = true;
    onExitStart?.();
  }, [exiting, onExitStart]);

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
    >
      {/* 第二層：追趕用（light 接近白，避免整屏發灰） */}
      <motion.div
        className="absolute inset-0 z-0 bg-[#f3f3f3] dark:bg-[#1a1a1a]"
        initial={{ y: "0%" }}
        animate={{ y: exiting ? "-100%" : "0%" }}
        transition={{
          ease: exitEase,
          duration: LAYER2_DURATION,
          delay: exiting ? LAYER2_DELAY : 0,
        }}
      />

      {/* 第一層：白／黑 + 紙紋 */}
      <motion.div
        className="absolute inset-0 z-[1] overflow-hidden bg-white dark:bg-black"
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
      >
        {/* light：淡一點，避免白底被 multiply 洗成灰 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.28] mix-blend-multiply bg-repeat dark:hidden"
          style={{
            backgroundImage: "url(/images/noise.gif)",
            backgroundSize: "140px 140px",
          }}
          aria-hidden
        />
        {/* dark：gif 多半是暗點，反相成亮點再用 screen 疊上黑底 */}
        <div
          className="absolute inset-0 pointer-events-none hidden opacity-[0.45] mix-blend-screen bg-repeat dark:block"
          style={{
            backgroundImage: "url(/images/noise.gif)",
            backgroundSize: "140px 140px",
            filter: "invert(1) contrast(1.35)",
          }}
          aria-hidden
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-5 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={exiting ? { opacity: 0, y: -28 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <p className="font-dela text-3xl tracking-[0.12em] text-primary dark:text-white md:text-5xl">
          CYC <span className="tracking-[0.18em]">ZINE</span>
        </p>
        <div className="loader md:scale-110 opacity-75" aria-hidden="true" />
      </motion.div>
    </div>
  );
}

const LoadingIndicator = ({
  label,
  className,
  variant = "inline",
  ready,
  onExitStart,
  onComplete,
}: LoadingIndicatorProps) => {
  if (variant === "intro") {
    return (
      <IntroLoading
        ready={ready}
        onExitStart={onExitStart}
        onComplete={onComplete}
      />
    );
  }
  return <InlineLoading label={label} className={className} />;
};

export default LoadingIndicator;
