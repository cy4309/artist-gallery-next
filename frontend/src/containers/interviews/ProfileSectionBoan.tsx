import { useEffect, useRef } from "react";
import { Card } from "antd";
import { motion, useScroll, useTransform } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import BaseButton from "@/components/BaseButton";

export default function ProfileSectionBoan() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  /**
   * ⭐ 關鍵：用 scrollYProgress（0 → 1）
   * start end = section 底部進 viewport
   * end start = section 頂部離開 viewport
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /**
   * ⭐ 明顯的 Parallax 位移
   * 圖片：慢慢往下
   * 卡片：反方向慢慢往上
   */
  // const imageY = useTransform(scrollYProgress, [0, 1], [-180, 80]);
  // const cardY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const imageY = useTransform(scrollYProgress, [0, 1], [-240, 80]);
  const cardY = useTransform(scrollYProgress, [0, 1], [240, -80]);

  /**
   * Lenis smooth scroll（不影響 Framer Motion）
   */
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08, // 數值越小越滑
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
        h-[120vh]            /* ⭐ 一定要 > 100vh */
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
          src="/images/hero/hero-1024-1024-96dpi/boan.png"
          alt="Boan"
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
              Boan
            </p>
            <p className="font-dela opacity-80">Tattoo artist</p>

            <BaseButton
              label="visit the website."
              className="my-4 w-full"
              onClick={() =>
                window.open(
                  "https://cy4309.github.io/TFD105_01CYC/MainPage.html"
                )
              }
            />
          </div>

          <iframe
            src="https://cy4309.github.io/TFD105_01CYC/MainPage.html"
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
// // import boan from "@/assets/images/boan.jpg";
// // import boanRbg from "@/assets/images/boan-removebg.png";
// import BaseButton from "@/components/BaseButton";

// export default function ProfileSectionBoan() {
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
//       // smooth: true,
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
//       className="w-full min-h-[100dvh] overflow-hidden flex flex-col justify-center items-center"
//     >
//       <motion.div
//         style={{ y: y1 }}
//         className="w-full max-w-[480px] flex flex-col items-center justify-center"
//       >
//         {/* <h1 className="text-5xl font-bold tracking-wide">Lorem, ipsum.</h1> */}
//         <motion.img
//           loading="lazy"
//           decoding="async"
//           src="/images/hero/hero-1024-1024-96dpi/boan.png"
//           alt="Boan Image"
//         />
//       </motion.div>

//       <motion.div
//         style={{ y: y2 }}
//         className="w-full max-w-3xl flex items-center justify-center"
//       >
//         <Card
//           // className="p-4 w-full bg-white/10 backdrop-blur-md rounded-lg shadow-lg border-4 border-primary dark:border-primaryGray"
//           className="
//             w-full
//             relative
//             !p-4
//             !backdrop-blur-md
//             !text-inherit
//             rounded-xl
//             shadow-xl
//             border-4 border-primary dark:border-primaryGray
//             overflow-hidden
//             bg-white/90 dark:bg-primary/90
//           "
//           // bg-tranparent
//         >
//           <div className="w-full max-w-[300px] mx-auto">
//             <p className="w-full text-4xl sm:text-6xl text-center font-dela leading-relaxed">
//               Boan
//             </p>
//             <p className="w-full text-center font-dela leading-relaxed">
//               Tattoo artist
//             </p>
//             <BaseButton
//               label="visit the website."
//               className="my-4 w-full"
//               onClick={() =>
//                 window.open(
//                   "https://cy4309.github.io/TFD105_01CYC/MainPage.html"
//                 )
//               }
//             />
//           </div>
//           <iframe
//             src="https://cy4309.github.io/TFD105_01CYC/MainPage.html"
//             className="w-full h-[40vh]"
//           ></iframe>
//         </Card>
//       </motion.div>
//     </section>
//   );
// }
