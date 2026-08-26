import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/services/server/adminAuth";
import { GAS_ACTION } from "@/types/gas/actionConstants";
import { postToDataBackend } from "@/services/server/dataBackendClient";
import type { CanonicalEvent } from "@/types/event";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";
  const data = await postToDataBackend<{
    ok?: boolean;
    events?: CanonicalEvent[];
  }>({ action: GAS_ACTION.LIST_EVENTS });

  let events = data.events || [];
  if (q) {
    events = events.filter((e) => {
      const hay = [e.id, e.title, e.cityName, e.category, e.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return NextResponse.json({
    ok: true,
    count: events.length,
    events: events.slice(0, 200),
  });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { event?: CanonicalEvent };
  if (!body.event?.id) {
    return NextResponse.json({ error: "event.id required" }, { status: 400 });
  }

  const data = await postToDataBackend<{ ok?: boolean; error?: string }>({
    action: GAS_ACTION.UPSERT_EVENT,
    event: body.event,
  });

  if (!data.ok) {
    return NextResponse.json(
      { error: data.error || "upsert failed (need Cloudflare backend)" },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const data = await postToDataBackend<{ ok?: boolean; error?: string }>({
    action: GAS_ACTION.DELETE_EVENT,
    id,
  });

  if (!data.ok) {
    return NextResponse.json(
      { error: data.error || "delete failed (need Cloudflare backend)" },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
