import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/services/server/adminAuth";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import { postToDataBackend } from "@/services/server/dataBackendClient";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q") || "";
  try {
    const data = await postToDataBackend<{
      ok?: boolean;
      users?: unknown[];
      error?: string;
    }>({
      action: GAS_ACTION.LIST_USERS,
      q,
      limit: 200,
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "listUsers failed",
      },
      { status: 400 },
    );
  }
}
