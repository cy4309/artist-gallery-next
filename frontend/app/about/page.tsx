"use client";

// import BaseButton from "@/components/BaseButton";

export default function About() {
  return (
    <>
      <div className="w-full grow flex flex-col justify-center items-center">
        {/* <h5 className="my-4 text-center text-lg dela-gothic-one leading-relaxed">
          We’re dedicated to uncovering the human stories behind culture.
        </h5>
        <h5 className="text-center leading-relaxed">
          If that speaks to you, hit us up.
        </h5> */}
        {/* <BaseButton
          label="visit the website."
          onClick={() => window.open("https://chu-yu-cheng.vercel.app/")}
          className="my-4"
        /> */}
        {/* <iframe
          src="https://chu-yu-cheng.vercel.app/"
          className="w-full h-[40vh] border-4 border-primaryGray rounded-lg shadow-lg"
        ></iframe> */}

        <h2 className="my-4 text-2xl font-bold dela-gothic-one leading-relaxed">
          Exploring Culture, One Story at a Time.
        </h2>

        <p className="max-w-[600px] leading-relaxed text-gray-700 dark:text-gray-300">
          CYC Studio is an independent digital project dedicated to bringing
          visibility to Taiwan’s cultural landscape — from exhibitions and
          performances to community-driven experiences.
          <br />
          <br />
          Our goal is simple: to help people discover meaningful events, and to
          highlight the stories and creators behind them.
        </p>

        <p className="mt-6 max-w-[600px] leading-relaxed text-gray-700 dark:text-gray-300">
          If you’re a creator, organizer, cultural worker, or someone who simply
          loves what we’re doing — we’d love to hear from you.
        </p>

        <p className="mt-4 max-w-[600px] leading-relaxed dark:text-primaryGray">
          📬contact @{" "}
          <a
            href="mailto:cy4309@gmail.com"
            className="underline hover:opacity-70"
          >
            cy4309@gmail.com
          </a>
        </p>
      </div>
    </>
  );
}
