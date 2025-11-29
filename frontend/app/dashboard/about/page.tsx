"use client";

import BaseButton from "@/components/BaseButton";

export default function About() {
  return (
    <>
      <div className="w-full grow flex flex-col justify-center items-center">
        <h5 className="my-4 text-center text-lg dela-gothic-one leading-relaxed">
          We’re dedicated to uncovering the human stories behind culture.
        </h5>
        <h5 className="text-center leading-relaxed">
          If that speaks to you, hit us up.
        </h5>
        <BaseButton
          label="visit the website."
          onClick={() => window.open("https://chu-yu-cheng.vercel.app/")}
          className="my-4"
        />
        {/* <iframe
          src="https://chu-yu-cheng.vercel.app/"
          className="w-full h-[40vh] border-4 border-primaryGray rounded-lg shadow-lg"
        ></iframe> */}
      </div>
    </>
  );
}
