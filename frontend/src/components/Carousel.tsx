"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import BaseButton from "@/components/BaseButton";
import FavoriteButton from "@/components/FavoriteButton";

export interface CarouselItem {
  actId: number;
  actName: string;
  startTime: string;
  endTime: string;
  address: string;
  imageUrl: string;
  description: string;
  website: string;
  // cityName: string;
  // cityId: number;
}

export interface CarouselProps {
  autoplay?: boolean;
  autoplayDelay?: number;
  baseWidth?: number;
  items: CarouselItem[];
  loop?: boolean;
  pauseOnHover?: boolean;
  round?: boolean;
}

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

const Carousel = ({
  autoplay = false,
  autoplayDelay = 3000,
  baseWidth = 300,
  items = [],
  loop = false,
  pauseOnHover = false,
  round = false,
}: CarouselProps) => {
  const orgWebsiteUrl = "https://cloud.culture.tw/";

  const isSingle = items.length === 1; // 🔥 單筆判斷（最重要）

  const [dynamicWidth, setDynamicWidth] = useState(baseWidth);
  const containerPadding = 16;
  const itemWidth = dynamicWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  // 如果只有一筆，不 clone
  const carouselItems = isSingle ? items : loop ? [...items, items[0]] : items;

  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // -------------------  RWD Width  -------------------
  useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth;
      setDynamicWidth(Math.min(Math.max(screenWidth * 0.8, 300), 600));
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // -------------------  Hover Pause  -------------------
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!pauseOnHover || !containerRef.current) return;

    const container = containerRef.current;
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [pauseOnHover]);

  // -------------------  Autoplay  -------------------
  useEffect(() => {
    if (isSingle) return; // 🔥 單筆不 autoplay

    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) return prev + 1; // clone
          if (prev === carouselItems.length - 1) return loop ? 0 : prev;
          return prev + 1;
        });
      }, autoplayDelay);

      return () => clearInterval(timer);
    }
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    items.length,
    carouselItems.length,
    pauseOnHover,
    isSingle,
  ]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (!isSingle && loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  // -------------------  Drag  -------------------
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (isSingle) return; // 🔥 單筆不能拖

    const offsetX = info.offset.x;
    const offsetY = info.offset.y;
    const MIN_HORIZONTAL_DRAG = 30;

    // 👉 加上「水平位移必須大於垂直位移」的條件
    if (
      Math.abs(offsetX) < Math.abs(offsetY) ||
      Math.abs(offsetX) < MIN_HORIZONTAL_DRAG
    ) {
      return;
    }

    const velocity = info.velocity.x;

    if (offsetX < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1); // go to clone
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offsetX > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
    // const offset = info.offset.x;
    // const velocity = info.velocity.x;

    // if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
    //   if (loop && currentIndex === items.length - 1) {
    //     setCurrentIndex(currentIndex + 1); // go to clone
    //   } else {
    //     setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
    //   }
    // } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
    //   if (loop && currentIndex === 0) {
    //     setCurrentIndex(items.length - 1);
    //   } else {
    //     setCurrentIndex((prev) => Math.max(prev - 1, 0));
    //   }
    // }
  };

  const dragProps = isSingle
    ? { drag: false }
    : loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0,
        },
      };

  return (
    <div
      ref={containerRef}
      className={`p-3 relative overflow-hidden ${
        round
          ? "rounded-full border border-white"
          : "rounded-3xl border-4 shadow-lg border-primary dark:border-primaryGray"
      }`}
      style={{
        width: `${dynamicWidth}px`,
        ...(round && { height: `${dynamicWidth}px` }),
      }}
    >
      <motion.div
        className="flex"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${
            currentIndex * trackItemOffset + itemWidth / 2
          }px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const rotateY = isSingle
            ? 0
            : useTransform(
                x,
                [
                  -(index + 1) * trackItemOffset,
                  -index * trackItemOffset,
                  -(index - 1) * trackItemOffset,
                ],
                [90, 0, -90],
                { clamp: false }
              );

          return (
            <motion.div
              // key={index}
              key={`${item.actId}-${index}`} // ✅ 用 actId + index 當 key
              className={`relative shrink-0 flex flex-col ${
                round
                  ? "items-center justify-center text-center bg-[#060606]"
                  : "items-start justify-between bg-[#222] border border-[#222] rounded-xl"
              } overflow-hidden cursor-grab active:cursor-grabbing`}
              style={{
                width: itemWidth,
                height: round ? itemWidth : "100%",
                rotateY,
                ...(round && { borderRadius: "50%" }),
              }}
              transition={effectiveTransition}
            >
              <ul className="p-4 flex flex-col justify-center items-center gap-2 text-white">
                {/* ⭐ 收藏按鈕（使用 actId 作 eventId） */}
                <div className="w-full flex justify-end items-center mb-4 text-sm">
                  {/* <FavoriteButton eventId={String(item.actId)} /> */}
                  <FavoriteButton
                    eventId={String(item.actId)}
                    eventTitle={item.actName}
                    imageUrl={orgWebsiteUrl + item.imageUrl}
                    dateText={`${item.startTime.split(",")[0]} - ${
                      item.endTime.split(",")[0]
                    }`}
                    locationText={item.address}
                    eventUrl={item.website}
                  />
                </div>

                <li className="font-black text-lg">{item.actName}</li>
                <li className="text-sm">
                  {item.startTime.split(",")[0]} - {item.endTime.split(",")[0]}
                </li>
                <li className="text-sm">{item.address}</li>

                <img
                  loading="lazy"
                  decoding="async"
                  src={orgWebsiteUrl + item.imageUrl}
                  alt="No Image found for the selected event."
                  className="w-full"
                  draggable={false}
                />

                <li className="text-sm">{item.description}</li>

                <BaseButton
                  className="text-white"
                  onClick={() => window.open(item.website)}
                >
                  Visit Website
                </BaseButton>
              </ul>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dots — 單筆只顯示一顆 */}
      <div
        className={`flex w-full justify-center ${
          round ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2" : ""
        }`}
      >
        <div className="mt-4 flex w-[150px] justify-between px-8">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-2 rounded-full transition ${
                currentIndex % items.length === index
                  ? round
                    ? "bg-white"
                    : "bg-[#333]"
                  : round
                  ? "bg-[#555]"
                  : "bg-[rgba(51,51,51,0.4)]"
              }`}
              animate={{
                scale: currentIndex % items.length === index ? 1.2 : 1,
              }}
              onClick={() => !isSingle && setCurrentIndex(index)} // 單筆不能點
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;

// 以下另外一種滑動方法
// import { useEffect, useState, useRef } from "react";
// import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
// import BaseButton from "@/components/BaseButton";
// import Image from "next/image";

// export interface CarouselItem {
//   actName: string;
//   startTime: string;
//   endTime: string;
//   address: string;
//   imageUrl: string;
//   description: string;
//   website: string;
// }

// export interface CarouselProps {
//   autoplay?: boolean;
//   autoplayDelay?: number;
//   baseWidth?: number;
//   items: CarouselItem[];
//   loop?: boolean;
//   pauseOnHover?: boolean;
//   round?: boolean;
// }

// // ------------------- 常數設定 -------------------
// const DRAG_BUFFER = 0;
// const VELOCITY_THRESHOLD = 500;
// const GAP = 16;

// const SPRING_OPTIONS = {
//   type: "spring" as const,
//   // stiffness: 300,
//   // damping: 30,
//   stiffness: 150,
//   damping: 20,
//   mass: 0.8,
// };

// const Carousel = ({
//   autoplay = false,
//   autoplayDelay = 3000,
//   baseWidth = 300,
//   items = [],
//   loop = false,
//   pauseOnHover = false,
//   round = false,
// }: CarouselProps) => {
//   const orgWebsiteUrl = "https://cloud.culture.tw/";

//   // 沒資料就直接不渲染，避免 0 長度造成問題
//   // if (!items || items.length === 0) {
//   //   return null;
//   // }

//   const isSingle = items.length === 1; // 🔥 判斷是否只有一筆資料
//   const [dynamicWidth, setDynamicWidth] = useState(baseWidth);
//   const containerPadding = 16;
//   const itemWidth = dynamicWidth - containerPadding * 2;
//   const trackItemOffset = itemWidth + GAP;

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isHovered, setIsHovered] = useState(false);

//   const x = useMotionValue(0);
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   // ------------------- 視窗大小調整 -------------------
//   useEffect(() => {
//     const updateWidth = () => {
//       const screenWidth = window.innerWidth;
//       setDynamicWidth(Math.min(Math.max(screenWidth * 0.8, 300), 600));
//     };

//     updateWidth();
//     window.addEventListener("resize", updateWidth);
//     return () => window.removeEventListener("resize", updateWidth);
//   }, []);

//   // ------------------- hover 暫停 autoplay -------------------
//   useEffect(() => {
//     if (!pauseOnHover || !containerRef.current) return;

//     const container = containerRef.current;
//     const handleMouseEnter = () => setIsHovered(true);
//     const handleMouseLeave = () => setIsHovered(false);

//     container.addEventListener("mouseenter", handleMouseEnter);
//     container.addEventListener("mouseleave", handleMouseLeave);

//     return () => {
//       container.removeEventListener("mouseenter", handleMouseEnter);
//       container.removeEventListener("mouseleave", handleMouseLeave);
//     };
//   }, [pauseOnHover]);

//   // ------------------- autoplay -------------------
//   useEffect(() => {
//     if (!autoplay) return;
//     const isSingle = items.length === 1; // 🔥 判斷是否只有一筆資料
//     if (pauseOnHover && isHovered) return;

//     const total = items.length;

//     const timer = setInterval(() => {
//       setCurrentIndex((prev) => {
//         if (loop) {
//           return (prev + 1) % total;
//         }
//         // 非 loop 就走到最後一張停住
//         return Math.min(prev + 1, total - 1);
//       });
//     }, autoplayDelay);

//     return () => clearInterval(timer);
//   }, [autoplay, autoplayDelay, isHovered, loop, items.length, pauseOnHover]);

//   // ------------------- 拖曳結束判斷 -------------------
//   const handleDragEnd = (_: unknown, info: PanInfo) => {
//     if (isSingle) return; // 🔥 單筆禁用拖曳

//     const offset = info.offset.x;
//     const velocity = info.velocity.x;
//     const total = items.length;

//     // 往左滑 → 下一張
//     if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
//       setCurrentIndex((prev) => {
//         if (loop) {
//           return (prev + 1) % total;
//         }
//         return Math.min(prev + 1, total - 1);
//       });
//     }
//     // 往右滑 → 前一張
//     else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
//       setCurrentIndex((prev) => {
//         if (loop) {
//           // JS 正確處理負數 modulo
//           return (prev - 1 + total) % total;
//         }
//         return Math.max(prev - 1, 0);
//       });
//     }
//   };

//   // ------------------- 拖曳限制 -------------------
//   const dragProps = isSingle
//     ? { drag: false } // 🔥 單筆禁用 drag
//     : loop
//     ? {}
//     : {
//         dragConstraints: {
//           left: -trackItemOffset * (items.length - 1),
//           right: 0,
//         },
//       };
//   // const dragProps = loop
//   //   ? {}
//   //   : {
//   //       dragConstraints: {
//   //         left: -trackItemOffset * (items.length - 1),
//   //         right: 0,
//   //       },
//   //     };

//   return (
//     <div
//       ref={containerRef}
//       className={`p-4 relative overflow-hidden ${
//         round
//           ? "rounded-full border border-white"
//           : "rounded-3xl border-4 shadow-lg border-primary dark:border-primaryGray"
//       }`}
//       style={{
//         width: `${dynamicWidth}px`,
//         ...(round && { height: `${dynamicWidth}px` }),
//       }}
//     >
//       <motion.div
//         className="flex"
//         drag="x"
//         {...dragProps}
//         style={{
//           width: itemWidth,
//           gap: `${GAP}px`,
//           perspective: 1000,
//           perspectiveOrigin: `${
//             currentIndex * trackItemOffset + itemWidth / 2
//           }px 50%`,
//           x,
//         }}
//         onDragEnd={handleDragEnd}
//         animate={{ x: -(currentIndex * trackItemOffset) }}
//         transition={SPRING_OPTIONS}
//       >
//         {items.map((item, index) => {
//           const range = [
//             -(index + 1) * trackItemOffset,
//             -index * trackItemOffset,
//             -(index - 1) * trackItemOffset,
//           ];
//           const outputRange = [90, 0, -90];
//           const rotateY = useTransform(x, range, outputRange, { clamp: false });

//           return (
//             <motion.div
//               key={index}
//               className={`relative shrink-0 flex flex-col ${
//                 round
//                   ? "items-center justify-center text-center bg-[#060606] border-0"
//                   : "items-start justify-between bg-[#222] border border-[#222] rounded-xl"
//               } overflow-hidden cursor-grab active:cursor-grabbing`}
//               style={{
//                 width: itemWidth,
//                 height: round ? itemWidth : "100%",
//                 rotateY: isSingle ? 0 : rotateY, // 🔥 單筆不旋轉
//                 ...(round && { borderRadius: "50%" }),
//               }}
//               transition={SPRING_OPTIONS}
//             >
//               <ul className="p-4 flex flex-col justify-center items-center gap-2 text-white">
//                 <li className="font-black text-lg">{item.actName}</li>

//                 <li className="text-sm">
//                   {item.startTime.split(",")[0]} - {item.endTime.split(",")[0]}
//                 </li>

//                 <li className="text-sm">{item.address}</li>

//                 <Image
//                   src={orgWebsiteUrl + item.imageUrl}
//                   alt="No Image found for the selected event."
//                   className="w-full"
//                   draggable={false}
//                   width={800}
//                   height={600}
//                   unoptimized // 外部來源必加，否則 Next Image 會拒絕
//                 />

//                 <li className="text-sm">{item.description}</li>

//                 <BaseButton
//                   className="text-white"
//                   onClick={() => window.open(item.website)}
//                 >
//                   Visit Website
//                 </BaseButton>
//               </ul>
//             </motion.div>
//           );
//         })}
//       </motion.div>

//       {/* dots */}
//       {/* {!isSingle && ( */}
//       <div
//         className={`flex w-full justify-center ${
//           round ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2" : ""
//         }`}
//       >
//         <div className="mt-4 flex w-[150px] justify-between px-8">
//           {items.map((_, index) => (
//             <motion.div
//               key={index}
//               className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${
//                 currentIndex % items.length === index
//                   ? round
//                     ? "bg-white"
//                     : "bg-[#333333]"
//                   : round
//                   ? "bg-[#555]"
//                   : "bg-[rgba(51,51,51,0.4)]"
//               }`}
//               animate={{
//                 scale: currentIndex % items.length === index ? 1.2 : 1,
//               }}
//               onClick={() => setCurrentIndex(index)}
//               transition={{ duration: 0.15 }}
//             />
//           ))}
//         </div>
//       </div>
//       {/* )} */}
//     </div>
//   );
// };

// export default Carousel;
