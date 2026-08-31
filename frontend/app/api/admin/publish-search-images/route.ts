import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/services/server/adminAuth";
import {
  publishSearchImagePatches,
  type SearchImagePatch,
} from "@/services/events/publishSearchImagePatches";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { patches?: unknown };
    const raw = Array.isArray(body.patches) ? body.patches : [];
    const patches: SearchImagePatch[] = raw
      .map((item) => {
        const patch = item as Record<string, unknown>;
        return {
          id: String(patch.id || ""),
          imageUrl: String(patch.imageUrl || "").trim(),
          imageSource: "search" as const,
        };
      })
      .filter((patch) => patch.id && patch.imageUrl);

    const result = await publishSearchImagePatches(patches);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[/api/admin/publish-search-images]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
