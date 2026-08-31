import type { EventImageSource } from "@/types/event";

type EventImageSourceBadgeProps = {
  imageSource?: EventImageSource;
  className?: string;
};

/** 二階段搜圖補上的圖片，於前台標示為示意圖 */
export default function EventImageSourceBadge({
  imageSource,
  className = "absolute bottom-2 left-2 z-10",
}: EventImageSourceBadgeProps) {
  if (imageSource !== "search") return null;

  return (
    <span
      className={`${className} rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/90`}
    >
      示意圖
    </span>
  );
}
