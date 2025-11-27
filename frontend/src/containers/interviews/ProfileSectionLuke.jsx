import { useEffect, useRef } from "react";
import { Card } from "antd";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import BaseButton from "@/components/BaseButton";

export default function ProfileSectionLuke() {
  const parallaxRef = useRef(null);
  const { scrollY } = useScroll({ target: parallaxRef });

  const rawY1 = useTransform(scrollY, [0, 100], [0, 50]);
  const rawY2 = useTransform(scrollY, [0, 1000], [0, 0]);

  const y1 = useSpring(rawY1, { damping: 200, stiffness: 100 });
  const y2 = useSpring(rawY2, { damping: 20, stiffness: 100 });

  // const scale = useTransform(scrollY, [500, 1000], [0.8, 1]);
  // const opacity = useTransform(scrollY, [500, 1000], [0, 1]);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <section
      ref={parallaxRef}
      // className="min-h-screen bg-gradient-to-b from-gray-500 to-white text-white font-sans overflow-hidden"
      className="w-full min-h-screen overflow-hidden flex flex-col justify-center items-center"
    >
      <motion.div
        style={{ y: y1 }}
        className="w-full max-w-[480px] flex flex-col items-center justify-center"
      >
        {/* <h1 className="text-5xl font-bold tracking-wide">Lorem, ipsum.</h1> */}
        <motion.img
          src="/images/hero/hero-1024-1024-96dpi/luke.png"
          alt="Luke Image"
        />
      </motion.div>

      <motion.div
        style={{ y: y2 }}
        className="w-full max-w-3xl flex items-center justify-center"
      >
        <Card className="p-4 w-full bg-white/10 backdrop-blur-md rounded-lg shadow-lg border-4 border-primary dark:border-primaryGray">
          <div className="w-full max-w-[300px] mx-auto">
            <p className="w-full text-4xl sm:text-6xl text-center font-dela leading-relaxed">
              Luke
            </p>
            <p className="w-full text-center font-dela leading-relaxed">
              3D Animator
            </p>
            <BaseButton
              label="visit the website."
              className="my-4 w-full"
              onClick={() => window.open("https://anymaction.com")}
            />
          </div>
          <iframe
            src="https://www.youtube.com/embed/M-xazh9Gs-8?si=chYICE9eEBXtFZah&autoplay=1&mute=1"
            title="ANYMACTION"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-[40vh]"
          ></iframe>
        </Card>
      </motion.div>
    </section>
  );
}
