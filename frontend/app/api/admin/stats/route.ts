import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/services/server/adminAuth";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import {
  getDataBackend,
  postToDataBackend,
} from "@/services/server/dataBackendClient";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backend = getDataBackend();
  try {
    const data = await postToDataBackend<{
      ok?: boolean;
      stats?: Record<string, unknown>;
      error?: string;
    }>({ action: GAS_ACTION.ADMIN_STATS });

    return NextResponse.json({
      backend,
      ...(data.ok ? data : { stats: null, note: data.error || "adminStats unsupported on this backend" }),
    });
  } catch (err) {
    return NextResponse.json({
      backend,
      stats: null,
      note: err instanceof Error ? err.message : "adminStats failed (GAS has no stats)",
    });
  }
}
