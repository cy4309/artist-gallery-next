"use client";

// import BaseButton from "@/components/BaseButton";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/locales/contexts/LocaleContext";

export default function About() {
  const { t } = useLocale();
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // if (!mounted) return null;
  return (
    <div className="flex flex-1 min-h-0 w-full flex-col justify-center items-center text-center gap-8 px-5 py-8">
      <motion.h1
        className="gap-4 text-2xl md:text-4xl font-dela"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {t.about.title}
      </motion.h1>
      <motion.div
        className="text-sm max-w-md flex flex-col gap-6 items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {t.about.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}

        <p>
          📬 {t.about.contact}：
          <a
            href="mailto:cy4309@gmail.com"
            className="underline hover:opacity-70 ml-1"
          >
            cy4309@gmail.com
          </a>
        </p>
      </motion.div>
      {/* <motion.p
        className="text-sm max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        CYC Zine is an independent digital project dedicated to bringing
        visibility to Taiwan’s cultural landscape — from exhibitions and
        performances to community-driven experiences.
        <br />
        <br />
        Our goal is simple: to help people discover meaningful events, and to
        highlight the stories and creators behind them.
        <br />
        <br />
        If you’re a creator, organizer, cultural worker, or someone who simply
        loves what we’re doing — we’d love to hear from you.
        <br />
        <br />
        📬contact@{" "}
        <a
          href="mailto:cy4309@gmail.com"
          className="underline hover:opacity-70"
        >
          cy4309@gmail.com
        </a>
      </motion.p> */}
    </div>
  );
}
