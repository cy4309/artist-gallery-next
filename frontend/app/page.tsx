"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useLocale } from "@/locales/contexts/LocaleContext";

const VIDEO_SRC = "/videos/taiwan_culture_video_montage_clip.mp4";
/** 影片遲遲未就緒時仍允許離場，避免卡死 */
const VIDEO_READY_FALLBACK_MS = 10000;

export default function Home() {
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  const markVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // 快取命中時可能已可播
    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      markVideoReady();
    }

    const onReady = () => markVideoReady();
    el.addEventListener("canplaythrough", onReady);
    el.addEventListener("loadeddata", onReady);

    const fallback = window.setTimeout(markVideoReady, VIDEO_READY_FALLBACK_MS);

    return () => {
      el.removeEventListener("canplaythrough", onReady);
      el.removeEventListener("loadeddata", onReady);
      window.clearTimeout(fallback);
    };
  }, [markVideoReady]);

  useEffect(() => {
    if (!introDone) return;
    const el = videoRef.current;
    if (!el) return;
    void el.play().catch(() => {
      // 自動播放被擋時維持靜音重試；失敗則停在首幀
    });
  }, [introDone]);

  return (
    <>
      {!introDone ? (
        <LoadingIndicator
          variant="intro"
          ready={videoReady}
          onComplete={() => setIntroDone(true)}
        />
      ) : null}

      <div className="w-full h-full flex justify-center items-center relative min-h-0 overflow-hidden">
        <div className="relative w-full max-h-dvh overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-[90vh] md:h-full object-cover opacity-80 saturate-50"
            src={VIDEO_SRC}
            preload="auto"
            loop
            muted
            playsInline
            // 遮罩滑開前不播放；揭開後再 play()
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-overlay bg-repeat"
            style={{ backgroundImage: "url(/images/noise.gif)" }}
          />
        </div>

        <div className="absolute w-full flex flex-col justify-center items-center text-center gap-8">
          <motion.h1
            className="text-5xl md:text-7xl lg:text-9xl text-white font-dela"
            initial={{ opacity: 0, y: 40 }}
            animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 1 }}
          >
            {t.home.title}
          </motion.h1>
          <motion.div
            className="text-sm md:text-base lg:text-lg text-white flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {t.home.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
