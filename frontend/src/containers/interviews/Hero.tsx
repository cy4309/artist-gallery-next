"use client";
import { motion } from "framer-motion";
import { useLocale } from "@/locales/contexts/LocaleContext";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function Hero() {
  const { t } = useLocale();
  return (
    <header className="min-h-dvh flex flex-col justify-center items-center text-center px-6 text-white">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="will-change-transform flex flex-col justify-center items-center"
      >
        <motion.h1
          variants={item}
          className="text-4xl md:text-6xl mb-4 font-dela"
        >
          {t.interviews.hero.title}
        </motion.h1>

        <motion.p variants={item} className="text-lg max-w-md">
          {t.interviews.hero.description}
        </motion.p>
      </motion.div>
    </header>
  );
}
