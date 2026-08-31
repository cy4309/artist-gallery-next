import { GAS_ACTION } from "@/types/gas/actionConstants";
import {
  getDataBackend,
  postToDataBackend,
} from "@/services/server/dataBackendClient";
import { invalidateEventsCache } from "@/services/server/eventsSheetService";

export type ClearAllSearchImagesResult = {
  backend: ReturnType<typeof getDataBackend>;
  cleared: number;
  skipped?: string;
};

/** 清除所有 image_source=search 的示意圖（不影響 og／官方圖） */
export async function clearAllSearchImages(): Promise<ClearAllSearchImagesResult> {
  const backend = getDataBackend();
  if (backend !== "cloudflare") {
    return { backend, cleared: 0, skipped: "cloudflare only" };
  }

  const json = await postToDataBackend<{
    ok?: boolean;
    cleared?: number;
    error?: string;
  }>({
    action: GAS_ACTION.CLEAR_SEARCH_IMAGES,
  });

  if (!json.ok) {
    throw new Error(`clearSearchImages failed: ${json.error ?? "unknown"}`);
  }

  invalidateEventsCache();

  return {
    backend,
    cleared: json.cleared ?? 0,
  };
}
