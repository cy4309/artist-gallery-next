"use client";

import Image from "next/image";
// import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useLocale } from "@/locales/contexts/LocaleContext";

// const P5Canvas = dynamic(() => import("@/components/P5Canvas"), {
//   ssr: false,
// });

export default function Home() {
  const { t } = useLocale();
  return (
    <>
      <div className="w-full h-full flex justify-center items-center relative min-h-0 overflow-hidden">
        <div className="hidden md:block relative w-full max-h-dvh overflow-hidden">
          <video
            className="w-full h-full object-cover opacity-80 saturate-50"
            src="/videos/korea-tradition-1.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-overlay bg-repeat"
            style={{ backgroundImage: "url(/images/noise.gif)" }}
          />
        </div>

        <div className="block md:hidden relative w-full">
          <Image
            className="w-full h-[80vh] object-cover"
            src="/images/qingshan-king-festival-1.jpg"
            alt="Video Cover"
            fill={false}
            width={1920}
            height={1080}
            priority
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-overlay bg-repeat"
            style={{ backgroundImage: "url(/images/noise.gif)" }}
          />
        </div>
        {/* </div> */}

        {/* <h1 className="absolute border-b-2 text-2xl md:text-3xl text-white font-dela">
          {t.home.title}
        </h1> */}
        <div className="absolute w-full flex flex-col justify-center items-center text-center gap-8">
          <motion.h1
            className="text-5xl md:text-7xl lg:text-9xl text-white font-dela"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {t.home.title}
          </motion.h1>
          <motion.div
            className="text-sm md:text-base lg:text-lg text-white flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {t.home.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </motion.div>
        </div>
      </div>

      {/* <P5Canvas /> */}
    </>
  );
}
