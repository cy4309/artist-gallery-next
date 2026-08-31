import { GAS_ACTION } from "@/types/gas/actionConstants";
import {
  getDataBackend,
  postToDataBackend,
} from "@/services/server/dataBackendClient";
import { invalidateEventsCache } from "@/services/server/eventsSheetService";

export type SearchImagePatch = {
  id: string;
  imageUrl: string;
  imageSource: "search";
};

export type PublishSearchImagePatchesResult = {
  backend: ReturnType<typeof getDataBackend>;
  updated: number;
  skipped?: string;
};

/** 人工審核後發布示意圖（不受 SEARCH_IMAGES_AUTO_PUBLISH 限制） */
export async function publishSearchImagePatches(
  patches: SearchImagePatch[],
): Promise<PublishSearchImagePatchesResult> {
  const backend = getDataBackend();
  if (backend !== "cloudflare") {
    return { backend, updated: 0, skipped: "cloudflare only" };
  }

  const valid = patches.filter(
    (patch) =>
      patch.id &&
      patch.imageUrl?.trim() &&
      patch.imageSource === "search",
  );

  if (!valid.length) {
    return { backend, updated: 0 };
  }

  const json = await postToDataBackend<{
    ok?: boolean;
    updated?: number;
    error?: string;
  }>({
    action: GAS_ACTION.PATCH_EVENT_IMAGES,
    patches: valid,
  });

  if (!json.ok) {
    throw new Error(`patchEventImages failed: ${json.error ?? "unknown"}`);
  }

  invalidateEventsCache();

  return {
    backend,
    updated: json.updated ?? 0,
  };
}
