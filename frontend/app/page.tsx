"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useLocale } from "@/locales/contexts/LocaleContext";

const VIDEO_SRC = "/videos/taiwan_culture_video_montage_clip.mp4";
/** 影片遲遲未就緒時仍允許離場，避免卡死 */
const VIDEO_READY_FALLBACK_MS = 6000;

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

    const onReady = () => markVideoReady();
    el.addEventListener("loadeddata", onReady);
    el.addEventListener("canplay", onReady);

    // 已快取時勿在 effect 內同步 setState（會 cascading render）
    let cachedReadyId = 0;
    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      cachedReadyId = window.setTimeout(onReady, 0);
    }

    const fallback = window.setTimeout(markVideoReady, VIDEO_READY_FALLBACK_MS);

    return () => {
      el.removeEventListener("loadeddata", onReady);
      el.removeEventListener("canplay", onReady);
      window.clearTimeout(cachedReadyId);
      window.clearTimeout(fallback);
      el.pause();
    };
  }, [markVideoReady]);

  // 遮罩開始滑開就從頭播，避免滑完才 play 的空窗
  const startVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    void el.play().catch(() => {});
  }, []);

  return (
    <>
      {!introDone ? (
        <LoadingIndicator
          variant="intro"
          ready={videoReady}
          onExitStart={startVideo}
          onComplete={() => setIntroDone(true)}
        />
      ) : null}

      <div className="w-full h-full flex justify-center items-center relative min-h-0 overflow-hidden">
        <div className="relative w-full max-h-dvh overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-[80vh] md:h-full object-cover object-center opacity-80 saturate-50 scale-x-125 md:scale-x-100"
            src={VIDEO_SRC}
            preload="auto"
            // loop
            muted
            playsInline
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-overlay bg-repeat"
            style={{ backgroundImage: "url(/images/noise.gif)" }}
          />
        </div>

        <div className="absolute w-full flex flex-col items-center justify-center text-center gap-8">
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
