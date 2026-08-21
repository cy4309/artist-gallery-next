"use client";

import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import BaseButton from "@/components/BaseButton";
import FavoriteButton from "@/components/FavoriteButton";
import { getCultureImageUrl } from "@/utils/imageProxy";
import { toISODateTime, formatDateSmart } from "@/utils/date";
import { showConfirmSwal } from "@/utils/notification";
import { getEventShareUrl, shareEvent } from "@/utils/share";
import { useLocale } from "@/locales/contexts/LocaleContext";
import { getEventCategoryLabel } from "@/utils/eventCategories";

export interface CarouselItem {
  id: string;
  actId: number;
  actName: string;
  startTime: string;
  endTime: string;
  address: string;
  imageUrl: string;
  description: string;
  website: string;
  category?: string;
  source?: string;
}

export interface CarouselProps {
  autoplay?: boolean;
  autoplayDelay?: number;
  baseWidth?: number;
  items: CarouselItem[];
  loop?: boolean;
  pauseOnHover?: boolean;
  round?: boolean;
  activeIndex?: number;
  onIndexChange?: (index: number, item: CarouselItem) => void;
}

const DRAG_BUFFER = 50;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = {
  type: "spring" as const,
  stiffness: 420,
  damping: 42,
  mass: 0.8,
};

const Carousel = ({
  autoplay = false,
  autoplayDelay = 3000,
  baseWidth = 300,
  items = [],
  loop = false,
  pauseOnHover = false,
  round = false,
  activeIndex,
  onIndexChange,
}: CarouselProps) => {
  const { t } = useLocale();
  const isSingle = items.length <= 1;
  const canLoop = loop && !isSingle;

  const [dynamicWidth, setDynamicWidth] = useState(baseWidth);
  const containerPadding = 16;
  const itemWidth = dynamicWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = canLoop
    ? [items[items.length - 1], ...items, items[0]]
    : items;

  const toInternalIndex = (real: number) => (canLoop ? real + 1 : real);
  const toRealIndex = (internal: number) => {
    if (!canLoop || items.length === 0) return internal;
    if (internal === 0) return items.length - 1;
    if (internal === items.length + 1) return 0;
    return internal - 1;
  };

  const [currentIndex, setCurrentIndex] = useState(() => {
    const start = activeIndex != null && activeIndex >= 0 ? activeIndex : 0;
    return canLoop ? start + 1 : start;
  });
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartX = useRef(0);
  const dragOriginX = useRef(0);
  const lastMoveX = useRef(0);
  const lastMoveTime = useRef(0);
  const draggingRef = useRef(false);
  const skipAnimateRef = useRef(true);
  const prevOffsetRef = useRef(trackItemOffset);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const onIndexChangeRef = useRef(onIndexChange);
  const notifiedRealIndexRef = useRef<number | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const currentIndexRef = useRef(currentIndex);
  const itemsRef = useRef(items);
  const canLoopRef = useRef(canLoop);
  const trackItemOffsetRef = useRef(trackItemOffset);
  const [slideHeight, setSlideHeight] = useState<number | undefined>(undefined);

  itemsRef.current = items;
  canLoopRef.current = canLoop;
  trackItemOffsetRef.current = trackItemOffset;
  onIndexChangeRef.current = onIndexChange;

  const toRealIndexFrom = (internal: number, len: number, looping: boolean) => {
    if (!looping || len === 0) return internal;
    if (internal === 0) return len - 1;
    if (internal === len + 1) return 0;
    return internal - 1;
  };

  const notifyStableIndex = (internalIndex: number) => {
    if (!onIndexChangeRef.current) return;

    const len = itemsRef.current.length;
    if (len === 0) return;

    const looping = canLoopRef.current;
    if (looping && (internalIndex === 0 || internalIndex === len + 1)) return;

    const real = toRealIndexFrom(internalIndex, len, looping);
    const item = itemsRef.current[real];
    if (!item || notifiedRealIndexRef.current === real) return;

    notifiedRealIndexRef.current = real;
    onIndexChangeRef.current(real, item);
  };

  const setIndex = (nextIndex: number) => {
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
  };

  const resetLoopClone = (internalIndex: number) => {
    const len = itemsRef.current.length;
    const offset = trackItemOffsetRef.current;

    if (internalIndex === 0) {
      skipAnimateRef.current = true;
      x.set(-len * offset);
      setIndex(len);
      notifyStableIndex(len);
      return;
    }

    if (internalIndex === len + 1) {
      skipAnimateRef.current = true;
      x.set(-offset);
      setIndex(1);
      notifyStableIndex(1);
    }
  };

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
    if (isSingle || !autoplay) return;
    if (pauseOnHover && isHovered) return;

    const timer = setInterval(() => {
      setIndex(Math.min(currentIndexRef.current + 1, carouselItems.length - 1));
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    pauseOnHover,
    isSingle,
    carouselItems.length,
  ]);

  useEffect(() => {
    if (draggingRef.current) return;

    const animatingIndex = currentIndexRef.current;
    const target = -(animatingIndex * trackItemOffset);

    if (prevOffsetRef.current !== trackItemOffset) {
      prevOffsetRef.current = trackItemOffset;
      skipAnimateRef.current = true;
    }

    if (skipAnimateRef.current) {
      skipAnimateRef.current = false;
      animationRef.current?.stop();
      x.set(target);
      return;
    }

    animationRef.current?.stop();
    animationRef.current = animate(x, target, {
      ...SPRING_OPTIONS,
      onComplete: () => {
        if (currentIndexRef.current !== animatingIndex) return;

        const len = itemsRef.current.length;
        if (
          canLoopRef.current &&
          (animatingIndex === 0 || animatingIndex === len + 1)
        ) {
          resetLoopClone(animatingIndex);
          return;
        }

        notifyStableIndex(animatingIndex);
      },
    });
  }, [currentIndex, trackItemOffset, x]);

  useEffect(() => {
    if (activeIndex == null || items.length === 0 || draggingRef.current)
      return;
    if (toRealIndex(currentIndexRef.current) === activeIndex) return;

    notifiedRealIndexRef.current = activeIndex;
    skipAnimateRef.current = true;
    setIndex(toInternalIndex(activeIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when URL-driven index changes
  }, [activeIndex, items.length, canLoop]);

  useEffect(() => {
    if (activeIndex != null && activeIndex >= 0) {
      notifiedRealIndexRef.current = activeIndex;
    }
  }, [activeIndex]);

  useLayoutEffect(() => {
    if (round) return;

    const el = itemRefs.current[currentIndex];
    if (!el) return;

    const updateHeight = () => {
      setSlideHeight(el.getBoundingClientRect().height);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentIndex, itemWidth, carouselItems.length, round]);

  // -------------------  Drag  -------------------
  const snapToIndex = (nextIndex: number) => {
    setIndex(nextIndex);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isSingle) return;
    if ((event.target as HTMLElement).closest("button, a")) return;

    draggingRef.current = true;
    animationRef.current?.stop();
    dragStartX.current = event.clientX;
    dragOriginX.current = x.get();
    lastMoveX.current = event.clientX;
    lastMoveTime.current = event.timeStamp;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    lastMoveX.current = event.clientX;
    lastMoveTime.current = event.timeStamp;
    x.set(dragOriginX.current + (event.clientX - dragStartX.current));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const len = itemsRef.current.length;
    const looping = canLoopRef.current;
    const offset = event.clientX - dragStartX.current;
    const elapsed = Math.max(event.timeStamp - lastMoveTime.current, 1);
    const velocity = ((event.clientX - lastMoveX.current) / elapsed) * 1000;
    const forward = offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD;
    const back = offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD;
    const idx = currentIndexRef.current;

    // Stuck at loop clone — normalize and optionally continue in swipe direction
    if (looping && idx === len + 1) {
      if (back) {
        skipAnimateRef.current = true;
        x.set(-len * trackItemOffsetRef.current);
        setIndex(len);
        notifyStableIndex(len);
        return;
      }

      resetLoopClone(len + 1);
      if (forward) snapToIndex(2);
      return;
    }

    if (looping && idx === 0) {
      if (forward) {
        skipAnimateRef.current = true;
        x.set(-trackItemOffsetRef.current);
        setIndex(1);
        notifyStableIndex(1);
        return;
      }

      resetLoopClone(0);
      if (back) snapToIndex(len - 1);
      return;
    }

    const maxIndex = carouselItems.length - 1;
    let nextIndex = idx;

    if (forward) {
      nextIndex = Math.min(idx + 1, maxIndex);
    } else if (back) {
      nextIndex = Math.max(idx - 1, 0);
    }

    if (nextIndex === idx) {
      animationRef.current?.stop();
      animationRef.current = animate(
        x,
        -(idx * trackItemOffsetRef.current),
        SPRING_OPTIONS,
      );
      return;
    }

    snapToIndex(nextIndex);
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
      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{
          touchAction: "pan-x",
          ...(!round && slideHeight != null ? { height: slideHeight } : {}),
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <motion.div
          className="flex items-start"
          style={{
            width: itemWidth,
            gap: `${GAP}px`,
            x,
            willChange: "transform",
          }}
        >
          {carouselItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={`relative shrink-0 flex flex-col h-auto ${
                round
                  ? "items-center justify-center text-center bg-[#060606]"
                  : "items-start bg-[#222] border border-[#222] rounded-xl"
              }`}
              style={{
                width: itemWidth,
                ...(round && { height: itemWidth, borderRadius: "50%" }),
              }}
            >
              <ul className="p-4 flex flex-col justify-center items-center gap-2 text-white">
                <div
                  className="w-full flex justify-between items-center mb-4 text-sm gap-2"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <span className="rounded-md bg-white/15 px-2 py-1 text-[11px] font-semibold tracking-wide text-white">
                    {getEventCategoryLabel(item) || "活動"}
                  </span>
                  <FavoriteButton
                    eventId={item.id}
                    eventTitle={item.actName}
                    eventStartDate={toISODateTime(item.startTime)}
                    eventEndDate={toISODateTime(item.endTime)}
                    eventLocation={item.address}
                    eventUrl={item.website}
                    imageUrl={
                      item.imageUrl?.trim()
                        ? process.env.NEXT_PUBLIC_BASE_URL +
                          getCultureImageUrl(item.imageUrl)
                        : undefined
                    }
                  />
                </div>

                <li className="font-black text-lg">{item.actName}</li>
                <li className="text-sm">
                  {formatDateSmart(item.startTime)} -{" "}
                  {formatDateSmart(item.endTime)}
                </li>
                <li className="text-sm">{item.address}</li>

                <li className="w-full">
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-700 rounded-md">
                    <img
                      loading="eager"
                      decoding="async"
                      className="w-full pointer-events-none"
                      draggable={false}
                      src={
                        item.imageUrl?.trim()
                          ? getCultureImageUrl(item.imageUrl)
                          : "/images/placeholder-no-image.png"
                      }
                      alt={item.actName || "活動圖片"}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/images/placeholder-no-image.png";
                      }}
                    />
                  </div>
                </li>

                <li className="text-xs leading-6 whitespace-pre-wrap">
                  {item.description}
                </li>

                <li
                  className="mt-4 flex flex-wrap justify-center gap-6"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {item.website ? (
                    <BaseButton
                      className="text-white !px-4"
                      onClick={async () => {
                        const confirmed = await showConfirmSwal({
                          title: t.notification.confirmOpenExternal.title,
                          text: t.notification.confirmOpenExternal.text,
                          confirmText:
                            t.notification.confirmOpenExternal.confirmText,
                          cancelText:
                            t.notification.confirmOpenExternal.cancelText,
                        });

                        if (confirmed) {
                          window.open(
                            item.website,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }
                      }}
                    >
                      {t.buttons.visit}
                    </BaseButton>
                  ) : null}

                  <BaseButton
                    className="text-white !px-4"
                    onClick={() =>
                      shareEvent({
                        title: item.actName,
                        url: getEventShareUrl(item.id),
                        copiedTitle: t.notification.shareCopied.title,
                        copiedText: t.notification.shareCopied.text,
                      })
                    }
                  >
                    {t.buttons.share}
                  </BaseButton>
                </li>
              </ul>
            </div>
          ))}
        </motion.div>
      </div>

      {!isSingle && (
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
                  toRealIndex(currentIndex) === index
                    ? round
                      ? "bg-white"
                      : "bg-[#333]"
                    : round
                      ? "bg-[#555]"
                      : "bg-[rgba(51,51,51,0.4)]"
                }`}
                animate={{
                  scale: toRealIndex(currentIndex) === index ? 1.2 : 1,
                }}
                onClick={() => snapToIndex(toInternalIndex(index))}
              />
            ))}
          </div>
        </div>
      )}
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
