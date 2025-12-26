import { useEffect, useRef } from "react";
import { Card } from "antd";
import { motion, useScroll, useTransform } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import BaseButton from "@/components/BaseButton";

export default function ProfileSectionWenChia() {
  const iframeAutoMutedPlay = `?autoplay=1&mute=1`;
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [-240, 80]);
  const cardY = useTransform(scrollYProgress, [0, 1], [240, -80]);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative
        w-full
        h-[120vh]
        flex
        flex-col
        items-center
        justify-center
        overflow-hidden
      "
    >
      {/* -------- 圖片層（背景感） -------- */}
      <motion.div
        style={{ y: imageY }}
        className="absolute top-[20%] flex justify-center w-full pointer-events-none"
      >
        <img
          loading="lazy"
          decoding="async"
          src="/images/hero/hero-1024-1024-96dpi/wen-chia.png"
          alt="Wen Chia portrait"
          className="w-[280px] sm:w-[360px] md:w-[420px]"
        />
      </motion.div>

      {/* -------- 卡片層（前景） -------- */}
      <motion.div
        style={{ y: cardY }}
        className="relative z-10 w-full max-w-3xl px-6"
      >
        <Card
          className="
            w-full
            relative
            !p-4
            !backdrop-blur-md
            !text-inherit
            rounded-xl
            shadow-xl
            border-4 border-primary dark:border-primaryGray
            overflow-hidden
            bg-white/90 dark:bg-primary/90
          "
        >
          <div className="w-full max-w-[320px] mx-auto text-center">
            <p className="text-4xl sm:text-6xl font-dela leading-relaxed">
              Wen Chia
            </p>
            <p className="font-dela opacity-80">Former Bassist</p>
            <span className="font-dela leading-relaxed">
              Invincible Tapir 無敵貘
            </span>

            <BaseButton
              label="visit the website."
              className="my-4 w-full"
              onClick={() =>
                window.open(
                  "https://www.youtube.com/watch?v=EEkoPJh-CaY&ab_channel=%E5%AE%85%E7%94%B7"
                )
              }
            />
          </div>

          <iframe
            src={`https://www.youtube.com/embed/EEkoPJh-CaY${iframeAutoMutedPlay}`}
            title="Wen Chia - Invincible Tapir 無敵貘"
            className="w-full h-[40vh] rounded-xl"
          />
        </Card>
      </motion.div>
    </section>
  );
}
