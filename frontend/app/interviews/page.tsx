"use client";

// import { useState } from "react";
// import BaseButton from "@/components/BaseButton";
// import Boan from "@/containers/interviews/Boan";
// import WenChia from "@/containers/interviews/WenChia";
// import boanFocus from "@/assets/images/focus-boan.jpg";
// import wenChiaFocus from "@/assets/images/focus-wen-chia.jpg";
import Hero from "@/containers/interviews/Hero";
import ProfileSectionWenChia from "@/containers/interviews/ProfileSectionWenChia";
// import Quote from "@/containers/interviews/Quote";
import ProfileSectionBoan from "@/containers/interviews/ProfileSectionBoan";
import ProfileSectionLemon from "@/containers/interviews/ProfileSectionLemon";
import ProfileSectionLuke from "@/containers/interviews/ProfileSectionLuke";

export default function Interviews() {
  return (
    <>
      <div className="w-full h-full my-12">
        {/* <section>
          <img src={boanFocus} alt="" className="border" />
          <h2>Boan</h2>
        </section>
        <section>
          <img src={wenChiaFocus} alt="" className="border" />
          <h2>Wen Chia</h2>
        </section> */}
        {/* <div className="bg-gradient-to-b from-white to-gray-500 text-gray-800 font-sans"> */}
        <Hero />
        <ProfileSectionWenChia />
        {/* <Quote /> */}
        <ProfileSectionBoan />
        <ProfileSectionLemon />
        <ProfileSectionLuke />
      </div>
    </>
  );
}
