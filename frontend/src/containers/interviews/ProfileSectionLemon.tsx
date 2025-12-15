import { useEffect, useRef } from "react";
import { Card } from "antd";
import { motion, useScroll, useTransform } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import BaseButton from "@/components/BaseButton";

export default function ProfileSectionBoan() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [-240, 80]);
  const cardY = useTransform(scrollYProgress, [0, 1], [240, -80]);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
    });

    function raf(time: number) {
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
      ref={sectionRef}
      className="
        relative
        w-full
        h-[120vh]
        flex
        flex-col
        items-center
        justify-center
        overflow-hidden
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
          src="/images/hero/hero-1024-1024-96dpi/lemon.png"
          alt="Lemon"
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
              Lemon
            </p>
            <p className="font-dela opacity-80">Artist Manager</p>

            <BaseButton
              label="visit the website."
              className="my-4 w-full"
              onClick={() =>
                window.open("https://hsuchristy.github.io/TFD105_32/index.html")
              }
            />
          </div>

          <iframe
            src="https://www.instagram.com/p/C7eKB8UN4M5/embed"
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

// export default function ProfileSectionLemon() {
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
//       // className="min-h-screen bg-gradient-to-b from-gray-500 to-white text-white font-sans overflow-hidden"
//       className="w-full min-h-screen overflow-hidden flex flex-col justify-center items-center"
//     >
//       <motion.div
//         style={{ y: y1 }}
//         className="w-full max-w-[480px] flex flex-col items-center justify-center"
//       >
//         {/* <h1 className="text-5xl font-bold tracking-wide">Lorem, ipsum.</h1> */}
//         <motion.img
//           loading="lazy"
//           decoding="async"
//           src="/images/hero/hero-1024-1024-96dpi/lemon.png"
//           alt="Lemon Image"
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
//               Lemon
//             </p>
//             <p className="w-full text-center font-dela leading-relaxed">
//               Artist Manager
//             </p>
//             <BaseButton
//               label="visit the website."
//               className="my-4 w-full"
//               onClick={() =>
//                 window.open("https://hsuchristy.github.io/TFD105_32/index.html")
//               }
//             />
//           </div>
//           <iframe
//             src="https://www.instagram.com/p/C7eKB8UN4M5/embed"
//             className="w-full h-[40vh]"
//           ></iframe>
//         </Card>
//       </motion.div>
//     </section>
//   );
// }
