"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as ga from "@/helpers/ga";

export default function AnalyticsListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");
    ga.pageview(url);
  }, [pathname, searchParams]);

  return null;
}
