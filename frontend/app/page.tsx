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
      <div className="w-full h-full flex justify-center items-center relative">
        {/* <div className="w-full relative overflow-hidden"> */}
        {/* <div className="hidden md:block relative w-full aspect-[16/9]"> */}
        <video
          // className="absolute inset-0 w-full h-full object-cover opacity-80 saturate-50"
          className="hidden md:block w-full object-cover relative opacity-80 saturate-50"
          src="/videos/korea-tradition-1.mp4"
          // src="/videos/video.mp4"
          // src="/videos/qingshan-king-festival.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* </div> */}

        {/* <div className="block md:hidden relative w-full aspect-[3/4]"> */}
        <Image
          // className="object-cover"
          className="block md:hidden w-full h-[80vh] object-cover relative"
          // src="/images/home-banner.png"
          src="/images/qingshan-king-festival-1.jpg"
          alt="Video Cover"
          // fill
          fill={false}
          width={1920}
          height={1080}
          priority // <Image> 預設會 lazy-load（延遲載入），但hero第一屏大圖不應該lazy
        />
        {/* </div> */}

        {/* <h1 className="absolute border-b-2 text-2xl md:text-3xl text-white font-dela">
          {t.home.title}
        </h1> */}
        <div className="absolute w-full flex flex-col justify-center items-center text-center gap-8">
          <motion.h1
            className="text-7xl md:text-9xl text-white font-dela"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {t.home.title}
          </motion.h1>
          <motion.div
            className="text-sm md:text-lg text-white flex flex-col"
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
