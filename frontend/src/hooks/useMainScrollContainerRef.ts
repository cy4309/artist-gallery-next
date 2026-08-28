"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { getEventsScrollRoot } from "@/utils/eventsBrowseState";

/** layout <main> 捲動容器，供 Framer Motion useScroll container 使用 */
export function useMainScrollContainerRef() {
  const ref = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    ref.current = getEventsScrollRoot();
    setReady(Boolean(ref.current));
  }, []);

  return { ref, ready };
}
