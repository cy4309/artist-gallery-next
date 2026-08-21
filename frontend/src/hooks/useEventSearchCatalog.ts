"use client";

import { useCallback, useState } from "react";
import { getOrgData } from "@/services/client/orgDataClient";
import { OrgEvent } from "@/types/event";

/** 搜尋用全站目錄（不限活動類型） */
export function useEventSearchCatalog() {
  const [catalog, setCatalog] = useState<OrgEvent[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);

  const invalidateCatalog = useCallback(() => {
    setCatalog([]);
    setCatalogReady(false);
  }, []);

  const ensureCatalog = useCallback(async () => {
    if (catalogReady || catalogLoading) return catalog;

    try {
      setCatalogLoading(true);
      const events = await getOrgData();
      setCatalog(events);
      setCatalogReady(true);
      return events;
    } catch (error) {
      console.error("Failed to load search catalog:", error);
      setCatalog([]);
      setCatalogReady(false);
      return [];
    } finally {
      setCatalogLoading(false);
    }
  }, [catalog, catalogLoading, catalogReady]);

  return {
    catalog,
    catalogLoading,
    catalogReady,
    ensureCatalog,
    invalidateCatalog,
  };
}
