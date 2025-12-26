"use client";

import Image from "next/image";
// import dynamic from "next/dynamic";
import { useLocale } from "@/locales/contexts/LocaleContext";

// const P5Canvas = dynamic(() => import("@/components/P5Canvas"), {
//   ssr: false,
// });

export default function Home() {
  const { t } = useLocale();
  return (
    <>
      <div className="w-full h-full flex justify-center items-center relative">
        <video
          className="my-4 hidden md:block w-full object-cover relative opacity-80 saturate-50"
          src="/videos/korea-tradition-1.mp4"
          // src="/videos/video.mp4"
          // src="/videos/qingshan-king-festival.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        <Image
          className="my-4 block md:hidden w-full h-[80vh] object-cover relative"
          // src="/images/home-banner.png"
          src="/images/qingshan-king-festival-1.jpg"
          alt="Video Cover"
          fill={false}
          width={1920}
          height={1080}
          priority // <Image> 預設會 lazy-load（延遲載入），但hero第一屏大圖不應該lazy
        />

        <h1 className="absolute border-b-2 text-2xl md:text-3xl text-white font-dela">
          {t.home.title}
        </h1>
      </div>

      {/* <P5Canvas /> */}
    </>
  );
}
