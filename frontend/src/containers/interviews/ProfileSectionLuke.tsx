import { useRef } from "react";
import { Card } from "antd";
import { motion, useScroll, useTransform } from "framer-motion";
import BaseButton from "@/components/BaseButton";
import { showConfirmSwal } from "@/utils/notification";
import { useLocale } from "@/locales/contexts/LocaleContext";
import { useMainScrollContainerRef } from "@/hooks/useMainScrollContainerRef";
import { useMainLenis } from "@/hooks/useMainLenis";

export default function ProfileSectionLuke() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { ref: scrollContainerRef, ready: scrollContainerReady } =
    useMainScrollContainerRef();

  useMainLenis();

  const { scrollYProgress } = useScroll({
    ...(scrollContainerReady ? { container: scrollContainerRef } : {}),
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [-240, 80]);
  const cardY = useTransform(scrollYProgress, [0, 1], [240, -80]);

  return (
    <section
      ref={sectionRef}
      className="
        relative
        w-full
        min-h-[120vh]
        flex
        flex-col
        items-center
        justify-center
        py-12 md:py-16
      "
    >
      {/* -------- 圖片層（背景感） -------- */}
      <motion.div
        style={{ y: imageY }}
        className="absolute top-[20%] flex justify-center w-full pointer-events-none"
      >
        <img
          loading="lazy"
          decoding="async"
          src="/images/hero/hero-1024-1024-96dpi/luke.png"
          alt="Luke"
          className="w-[280px] sm:w-[360px] md:w-[420px]"
        />
      </motion.div>

      {/* -------- 卡片層（前景） -------- */}
      <motion.div
        style={{ y: cardY }}
        className="relative z-10 w-full max-w-3xl px-6"
      >
        <Card
          className="
            w-full
            relative
            !p-4
            !backdrop-blur-md
            !text-inherit
            rounded-xl
            shadow-xl
            border-4 border-primary dark:border-primaryGray
            overflow-hidden
            bg-white/90 dark:bg-primary/90
          "
        >
          <div className="w-full max-w-[320px] mx-auto text-center">
            <p className="text-4xl sm:text-6xl font-dela leading-relaxed">
              Luke
            </p>
            <p className="font-dela opacity-80">3D Animator</p>

            <BaseButton
              label={t.buttons.visit}
              className="my-4 w-full"
              onClick={async () => {
                const confirmed = await showConfirmSwal({
                  title: t.notification.confirmOpenExternal.title,
                  text: t.notification.confirmOpenExternal.text,
                  confirmText: t.notification.confirmOpenExternal.confirmText,
                  cancelText: t.notification.confirmOpenExternal.cancelText,
                });

                if (confirmed) {
                  window.open(
                    "https://anymaction.com",
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
            />
          </div>

          <iframe
            src="https://www.youtube.com/embed/M-xazh9Gs-8?si=chYICE9eEBXtFZah&autoplay=1&mute=1"
            title="ANYMACTION"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-[40vh] rounded-xl"
          />
        </Card>
      </motion.div>
    </section>
  );
}

// import { useEffect, useRef } from "react";
// import { Card } from "antd";
// import { motion, useScroll, useTransform, useSpring } from "framer-motion";
// import Lenis from "@studio-freight/lenis";
// import BaseButton from "@/components/BaseButton";

// export default function ProfileSectionLuke() {
//   const parallaxRef = useRef(null);
//   const { scrollY } = useScroll({ target: parallaxRef });

//   const rawY1 = useTransform(scrollY, [0, 100], [0, 50]);
//   const rawY2 = useTransform(scrollY, [0, 1000], [0, 0]);

//   const y1 = useSpring(rawY1, { damping: 200, stiffness: 100 });
//   const y2 = useSpring(rawY2, { damping: 20, stiffness: 100 });

//   // const scale = useTransform(scrollY, [500, 1000], [0.8, 1]);
//   // const opacity = useTransform(scrollY, [500, 1000], [0, 1]);

//   useEffect(() => {
//     const lenis = new Lenis({
//       lerp: 0.08,
//     });

//     function raf(time: number) {
//       lenis.raf(time);
//       requestAnimationFrame(raf);
//     }

//     requestAnimationFrame(raf);

//     return () => {
//       lenis.destroy();
//     };
//   }, []);

//   return (
//     <section
//       ref={parallaxRef}
//       // className="min-h-dvh bg-gradient-to-b from-gray-500 to-white text-white font-sans overflow-hidden"
//       className="w-full min-h-dvh overflow-hidden flex flex-col justify-center items-center"
//     >
//       <motion.div
//         style={{ y: y1 }}
//         className="w-full max-w-[480px] flex flex-col items-center justify-center"
//       >
//         {/* <h1 className="text-5xl font-bold tracking-wide">Lorem, ipsum.</h1> */}
//         <motion.img
//           loading="lazy"
//           decoding="async"
//           src="/images/hero/hero-1024-1024-96dpi/luke.png"
//           alt="Luke"
//         />
//       </motion.div>

//       <motion.div
//         style={{ y: y2 }}
//         className="w-full max-w-3xl flex items-center justify-center"
//       >
//         <Card
//           className="
//             w-full
//             relative
//             !p-4
//             !text-inherit
//             rounded-xl
//             shadow-xl
//             border-4 border-primary dark:border-primaryGray
//             backdrop-blur-md
//             overflow-hidden
//             bg-white/90 dark:bg-primary/90
//           "
//         >
//           <div className="w-full max-w-[300px] mx-auto">
//             <p className="w-full text-4xl sm:text-6xl text-center font-dela leading-relaxed">
//               Luke
//             </p>
//             <p className="w-full text-center font-dela leading-relaxed">
//               3D Animator
//             </p>
//             <BaseButton
//               label="visit the website."
//               className="my-4 w-full"
//               onClick={() => window.open("https://anymaction.com")}
//             />
//           </div>
//           <iframe
//             src="https://www.youtube.com/embed/M-xazh9Gs-8?si=chYICE9eEBXtFZah&autoplay=1&mute=1"
//             title="ANYMACTION"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//             referrerPolicy="strict-origin-when-cross-origin"
//             allowFullScreen
//             className="w-full h-[40vh]"
//           ></iframe>
//         </Card>
//       </motion.div>
//     </section>
//   );
// }
