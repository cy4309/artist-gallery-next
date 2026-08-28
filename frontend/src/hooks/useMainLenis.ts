"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { getEventsScrollRoot } from "@/utils/eventsBrowseState";

/** Lenis 綁定 layout <main>，避免預設 window 捲動與實際容器不一致 */
export function useMainLenis(lerp = 0.08) {
  useEffect(() => {
    const wrapper = getEventsScrollRoot();
    if (!wrapper) return;

    const content = wrapper.firstElementChild;
    if (!(content instanceof HTMLElement)) return;

    const lenis = new Lenis({
      wrapper,
      content,
      lerp,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [lerp]);
}
