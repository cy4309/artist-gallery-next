"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  EventsListUrlState,
  eventsListPath,
  parseEventsListSearchParams,
} from "@/utils/eventsListUrl";

/** 讀寫 /events?city&categories；replace 不推 history stack */
export function useEventsListUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const listUrlState = parseEventsListSearchParams(searchParams);

  const replaceListUrl = useCallback(
    (state: EventsListUrlState) => {
      if (pathname !== "/events") return;
      const next = eventsListPath(state);
      // 用語意比較，避免 searchParams.toString() 的 %2C 與字面逗號不相等而狂 replace
      if (eventsListPath(listUrlState) === next) return;
      router.replace(next, { scroll: false });
    },
    [listUrlState, pathname, router],
  );

  const clearListUrl = useCallback(() => {
    replaceListUrl({});
  }, [replaceListUrl]);

  return { listUrlState, replaceListUrl, clearListUrl };
}
