"use client";

import Image from "next/image";
// import dynamic from "next/dynamic";

// const P5Canvas = dynamic(() => import("@/components/P5Canvas"), {
//   ssr: false,
// });

export default function Home() {
  return (
    <>
      <div className="w-full h-full flex justify-center items-center relative">
        <video
          src="/videos/korea-tradition-1.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="mt-4 hidden md:block w-full object-cover relative opacity-80 saturate-50"
        />

        <Image
          className="mt-4 block md:hidden w-full h-[80vh] object-cover relative"
          src="/images/home-banner.png"
          alt="Video Cover"
          fill={false}
          width={1920}
          height={1080}
        />

        <h1 className="absolute border-b-2 text-3xl text-white font-dela">
          Unearth Stories.
        </h1>
      </div>

      {/* <P5Canvas /> */}
    </>
  );
}
