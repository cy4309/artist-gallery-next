"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/locales/contexts/LocaleContext";

// 「請我們喝杯咖啡」暫不顯示；接上收款時見 frontend/README.md
// const coffeePaymentUrl =
//   process.env.NEXT_PUBLIC_COFFEE_PAYMENT_URL?.trim() ?? "";

export default function About() {
  const { t } = useLocale();

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

        {/* 「請我們喝杯咖啡」— 待藍新快速收款連結就緒後再開啟（app/about/page.tsx + README）
        <section
          id="coffee"
          className="w-full pt-6 mt-2 border-t border-black/10 dark:border-white/10 flex flex-col gap-4 items-center"
        >
          <h2 className="font-dela text-base md:text-lg">
            ☕ {t.about.coffee.title}
          </h2>
          <p className="text-left sm:text-center leading-relaxed">
            {t.about.coffee.body}
          </p>
          {coffeePaymentUrl ? (
            <a
              href={coffeePaymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center border-cyc px-6 py-2.5 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              {t.about.coffee.payButton}
            </a>
          ) : (
            <p className="text-xs opacity-60">{t.about.coffee.comingSoon}</p>
          )}
        </section>
        */}
      </motion.div>
    </div>
  );
}
