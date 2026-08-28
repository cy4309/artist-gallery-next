type Env = {
  cyc_data: D1Database;
  DATA_API_SECRET?: string;
};

type Json = Record<string, unknown>;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Data-Api-Secret",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

function nowStamp(): string {
  // Cloudflare Worker 預設 UTC；改以台灣時區 Asia/Taipei
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

function uuid(): string {
  return crypto.randomUUID();
}

const SUPPLEMENTAL_IMAGE_SOURCES = new Set(["og", "search"]);

function isSupplementalImageSource(source: string | null | undefined): boolean {
  return Boolean(source && SUPPLEMENTAL_IMAGE_SOURCES.has(source));
}

function resolveEventImage(
  incomingUrl: string | null,
  incomingSource: string | null,
  existingUrl: string | null,
  existingSource: string | null,
): { imageUrl: string | null; imageSource: string | null } {
  const officialUrl = incomingUrl?.trim() || "";
  if (officialUrl) {
    return { imageUrl: officialUrl, imageSource: "official" };
  }

  const keptUrl = existingUrl?.trim() || "";
  if (keptUrl && isSupplementalImageSource(existingSource)) {
    return { imageUrl: keptUrl, imageSource: existingSource };
  }

  if (incomingSource?.trim()) {
    return { imageUrl: incomingUrl, imageSource: incomingSource };
  }

  return { imageUrl: incomingUrl, imageSource: null };
}

function authorize(req: Request, env: Env): boolean {
  const secret = env.DATA_API_SECRET;
  if (!secret) return true; // local / unset
  const header =
    req.headers.get("X-Data-Api-Secret") ||
    req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  return header === secret;
}

function mapUser(row: Record<string, unknown>) {
  return {
    id: row.id,
    provider: row.provider,
    lineUserId: row.line_user_id,
    email: row.email,
    name: row.name,
    picture: row.picture,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function handleAction(
  env: Env,
  action: string,
  data: Json,
): Promise<unknown> {
  const db = env.cyc_data;

  // —— Users (Google) ——
  if (action === "checkGoogleUser") {
    const email = String(data.email || "");
    const row = await db
      .prepare("SELECT * FROM users WHERE email = ? LIMIT 1")
      .bind(email)
      .first();
    if (!row) return { exists: false };
    return { exists: true, user: mapUser(row as Record<string, unknown>) };
  }

  if (action === "createGoogleUser") {
    const user = (data.user || {}) as Json;
    const id = String(user.id || `google_${uuid()}`);
    const stamp = nowStamp();
    await db
      .prepare(
        `INSERT INTO users (id, provider, line_user_id, email, name, picture, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        String(user.provider || "google"),
        user.lineUserId ? String(user.lineUserId) : null,
        user.email ? String(user.email) : null,
        user.name ? String(user.name) : null,
        user.picture ? String(user.picture) : null,
        stamp,
        stamp,
      )
      .run();
    const row = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(id)
      .first();
    return { success: true, user: mapUser(row as Record<string, unknown>) };
  }

  if (action === "updateGoogleUser") {
    const user = (data.user || {}) as Json;
    const email = String(user.email || "");
    const existing = await db
      .prepare("SELECT * FROM users WHERE email = ? LIMIT 1")
      .bind(email)
      .first();
    if (!existing) return { success: false, error: "user not found" };
    const stamp = nowStamp();
    const picture =
      user.picture === null || user.picture === undefined || user.picture === ""
        ? (existing as { picture?: string }).picture
        : String(user.picture);
    await db
      .prepare(
        `UPDATE users SET name = ?, picture = ?, updated_at = ?,
         provider = COALESCE(?, provider),
         line_user_id = COALESCE(?, line_user_id)
         WHERE email = ?`,
      )
      .bind(
        user.name ? String(user.name) : (existing as { name?: string }).name,
        picture,
        stamp,
        user.provider ? String(user.provider) : null,
        user.lineUserId ? String(user.lineUserId) : null,
        email,
      )
      .run();
    const row = await db
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first();
    return { success: true, user: mapUser(row as Record<string, unknown>) };
  }

  // —— Users (LINE) ——
  if (action === "checkLineUser") {
    const userId = String(data.userId || "");
    const row = await db
      .prepare("SELECT * FROM users WHERE id = ? OR line_user_id = ? LIMIT 1")
      .bind(userId, userId.replace(/^line_/, ""))
      .first();
    if (!row) return { exists: false };
    return { exists: true, user: mapUser(row as Record<string, unknown>) };
  }

  if (action === "createLineUser") {
    const user = (data.user || {}) as Json;
    const id = String(user.id || `line_${uuid()}`);
    const stamp = nowStamp();
    await db
      .prepare(
        `INSERT INTO users (id, provider, line_user_id, email, name, picture, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        String(user.provider || "line"),
        user.lineUserId
          ? String(user.lineUserId)
          : id.replace(/^line_/, ""),
        user.email ? String(user.email) : null,
        user.name ? String(user.name) : null,
        user.picture ? String(user.picture) : null,
        stamp,
        stamp,
      )
      .run();
    const row = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(id)
      .first();
    return { success: true, user: mapUser(row as Record<string, unknown>) };
  }

  if (action === "updateLineUser") {
    const user = (data.user || {}) as Json;
    const id = String(user.id || "");
    const existing = await db
      .prepare("SELECT * FROM users WHERE id = ? LIMIT 1")
      .bind(id)
      .first();
    if (!existing) return { success: false, error: "user not found" };
    const stamp = nowStamp();
    const picture =
      user.picture === null || user.picture === undefined || user.picture === ""
        ? (existing as { picture?: string }).picture
        : String(user.picture);
    await db
      .prepare(
        `UPDATE users SET name = COALESCE(?, name), picture = ?, email = COALESCE(?, email),
         updated_at = ?, line_user_id = COALESCE(?, line_user_id) WHERE id = ?`,
      )
      .bind(
        user.name ? String(user.name) : null,
        picture,
        user.email ? String(user.email) : null,
        stamp,
        user.lineUserId ? String(user.lineUserId) : null,
        id,
      )
      .run();
    const row = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(id)
      .first();
    return { success: true, user: mapUser(row as Record<string, unknown>) };
  }

  // —— Favorites ——
  if (action === "checkFavorite") {
    const userId = String(data.userId || "");
    const eventId = String(data.eventId || "");
    const row = await db
      .prepare(
        "SELECT 1 FROM user_favorites WHERE user_id = ? AND event_id = ? LIMIT 1",
      )
      .bind(userId, eventId)
      .first();
    return { success: true, isFavorite: Boolean(row) };
  }

  if (action === "toggleFavorite") {
    const userId = String(data.userId || "");
    const eventId = String(data.eventId || "");
    const existing = await db
      .prepare(
        "SELECT id FROM user_favorites WHERE user_id = ? AND event_id = ? LIMIT 1",
      )
      .bind(userId, eventId)
      .first();

    if (existing) {
      await db
        .prepare(
          "DELETE FROM user_favorites WHERE user_id = ? AND event_id = ?",
        )
        .bind(userId, eventId)
        .run();
      return { success: true, isFavorite: false };
    }

    if (!data.eventTitle) {
      throw new Error("toggleFavorite: eventTitle required when adding");
    }

    await db
      .prepare(
        `INSERT INTO user_favorites
         (id, user_id, event_id, event_title, event_start_date, event_end_date, event_location, event_url, image_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        uuid(),
        userId,
        eventId,
        String(data.eventTitle || ""),
        data.eventStartDate ? String(data.eventStartDate) : null,
        data.eventEndDate ? String(data.eventEndDate) : null,
        data.eventLocation ? String(data.eventLocation) : null,
        data.eventUrl ? String(data.eventUrl) : null,
        data.imageUrl ? String(data.imageUrl) : null,
        nowStamp(),
      )
      .run();
    return { success: true, isFavorite: true };
  }

  if (action === "ensureFavorite") {
    const userId = String(data.userId || "");
    const eventId = String(data.eventId || "");
    if (!eventId) throw new Error("ensureFavorite: eventId required");
    const check = (await handleAction(env, "checkFavorite", {
      userId,
      eventId,
    })) as { isFavorite?: boolean };
    if (!check.isFavorite) {
      await handleAction(env, "toggleFavorite", { ...data, userId, eventId });
      return { success: true, isFavorite: true, created: true };
    }
    return { success: true, isFavorite: true, created: false };
  }

  if (action === "listFavorites") {
    const userId = String(data.userId || "");
    const { results } = await db
      .prepare(
        `SELECT event_id, event_title, event_start_date, event_end_date,
                event_location, event_url, image_url, created_at
         FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC`,
      )
      .bind(userId)
      .all();
    const favorites = (results || []).map((r) => ({
      eventId: String(r.event_id ?? ""),
      eventTitle: r.event_title ?? "",
      eventStartDate: r.event_start_date ?? "",
      eventEndDate: r.event_end_date ?? "",
      eventLocation: r.event_location ?? "",
      eventUrl: r.event_url ?? "",
      imageUrl: r.image_url ?? "",
      createdAt: r.created_at ?? "",
    }));
    return { success: true, favorites };
  }

  // —— Push ——
  if (action === "registerPushToken") {
    const token = String(data.expoPushToken || "").trim();
    const platform = String(data.platform || "").trim();
    const userId =
      data.userId === null || data.userId === undefined || data.userId === ""
        ? null
        : String(data.userId).trim();

    if (!token || !token.startsWith("ExponentPushToken[")) {
      return { success: false, error: "Invalid expoPushToken" };
    }
    if (platform !== "ios" && platform !== "android") {
      return { success: false, error: "Invalid platform" };
    }

    const stamp = nowStamp();
    const existing = await db
      .prepare(
        "SELECT expo_push_token FROM device_push_tokens WHERE expo_push_token = ?",
      )
      .bind(token)
      .first();

    if (existing) {
      await db
        .prepare(
          `UPDATE device_push_tokens SET platform = ?, user_id = ?, updated_at = ?
           WHERE expo_push_token = ?`,
        )
        .bind(platform, userId, stamp, token)
        .run();
      return { success: true, created: false };
    }

    await db
      .prepare(
        `INSERT INTO device_push_tokens (expo_push_token, platform, user_id, updated_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(token, platform, userId, stamp, stamp)
      .run();
    return { success: true, created: true };
  }

  // —— Events ——
  if (action === "replaceEvents") {
    const columns = Array.isArray(data.columns)
      ? (data.columns as string[])
      : [];
    const rows = Array.isArray(data.rows) ? (data.rows as unknown[][]) : [];
    if (!columns.length) {
      return { ok: false, success: false, error: "replaceEvents: columns required" };
    }

    const idx = (name: string) => columns.indexOf(name);
    const cell = (row: unknown[], name: string) => {
      const i = idx(name);
      if (i < 0) return null;
      const v = row[i];
      return v === null || v === undefined ? null : String(v);
    };

    const { results: existingRows } = await db
      .prepare("SELECT id, image_url, image_source FROM events")
      .all();
    const existingById = new Map<
      string,
      { imageUrl: string | null; imageSource: string | null }
    >();
    for (const row of existingRows || []) {
      const r = row as Record<string, unknown>;
      const id = String(r.id || "");
      if (!id) continue;
      existingById.set(id, {
        imageUrl: r.image_url ? String(r.image_url) : null,
        imageSource: r.image_source ? String(r.image_source) : null,
      });
    }

    await db.prepare("DELETE FROM events").run();

    const BATCH = 50;
    for (let i = 0; i < rows.length; i += BATCH) {
      const slice = rows.slice(i, i + BATCH);
      const stmts = slice.map((row) => {
        const id = cell(row, "id") || uuid();
        const existing = existingById.get(id);
        const resolved = resolveEventImage(
          cell(row, "imageUrl"),
          cell(row, "imageSource"),
          existing?.imageUrl ?? null,
          existing?.imageSource ?? null,
        );

        return db
          .prepare(
            `INSERT INTO events
             (id, source, source_id, category, title, start_time, end_time,
              city_name, address, description, website, image_url, image_source, synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            id,
            cell(row, "source"),
            cell(row, "sourceId"),
            cell(row, "category"),
            cell(row, "title"),
            cell(row, "startTime"),
            cell(row, "endTime"),
            cell(row, "cityName"),
            cell(row, "address"),
            cell(row, "description"),
            cell(row, "website"),
            resolved.imageUrl,
            resolved.imageSource,
            cell(row, "syncedAt") || nowStamp(),
          );
      });
      await db.batch(stmts);
    }

    await db
      .prepare(
        `INSERT INTO meta (key, value) VALUES ('events_synced_at', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      )
      .bind(nowStamp())
      .run();
    await db
      .prepare(
        `INSERT INTO meta (key, value) VALUES ('events_count', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      )
      .bind(String(rows.length))
      .run();

    return { ok: true, success: true, count: rows.length };
  }

  if (action === "listEvents") {
    const { results } = await db
      .prepare(
        `SELECT id, source, source_id as sourceId, category, title,
                start_time as startTime, end_time as endTime,
                city_name as cityName, address, description, website,
                image_url as imageUrl, image_source as imageSource, synced_at as syncedAt
         FROM events`,
      )
      .all();
    return { ok: true, success: true, events: results || [] };
  }

  if (action === "upsertEvent") {
    const e = data.event as Json;
    if (!e?.id) return { ok: false, error: "event.id required" };
    const stamp = nowStamp();
    const existing = await db
      .prepare("SELECT image_url, image_source FROM events WHERE id = ? LIMIT 1")
      .bind(String(e.id))
      .first<Record<string, unknown>>();
    const resolved = resolveEventImage(
      e.imageUrl ? String(e.imageUrl) : null,
      e.imageSource ? String(e.imageSource) : null,
      existing?.image_url ? String(existing.image_url) : null,
      existing?.image_source ? String(existing.image_source) : null,
    );
    await db
      .prepare(
        `INSERT INTO events
         (id, source, source_id, category, title, start_time, end_time,
          city_name, address, description, website, image_url, image_source, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           source=excluded.source, source_id=excluded.source_id,
           category=excluded.category, title=excluded.title,
           start_time=excluded.start_time, end_time=excluded.end_time,
           city_name=excluded.city_name, address=excluded.address,
           description=excluded.description, website=excluded.website,
           image_url=excluded.image_url, image_source=excluded.image_source,
           synced_at=excluded.synced_at`,
      )
      .bind(
        String(e.id),
        e.source ? String(e.source) : null,
        e.sourceId ? String(e.sourceId) : null,
        e.category ? String(e.category) : null,
        e.title ? String(e.title) : null,
        e.startTime ? String(e.startTime) : null,
        e.endTime ? String(e.endTime) : null,
        e.cityName ? String(e.cityName) : null,
        e.address ? String(e.address) : null,
        e.description ? String(e.description) : null,
        e.website ? String(e.website) : null,
        resolved.imageUrl,
        resolved.imageSource,
        e.syncedAt ? String(e.syncedAt) : stamp,
      )
      .run();
    return { ok: true, success: true };
  }

  if (action === "patchEventImages") {
    const patches = Array.isArray(data.patches) ? data.patches : [];
    if (!patches.length) {
      return { ok: true, success: true, updated: 0 };
    }

    const BATCH = 50;
    let updated = 0;
    for (let i = 0; i < patches.length; i += BATCH) {
      const slice = patches.slice(i, i + BATCH);
      const stmts = slice
        .map((patch) => {
          const p = patch as Json;
          const id = String(p.id || "");
          const imageUrl = String(p.imageUrl || "").trim();
          const imageSource = String(p.imageSource || "").trim();
          if (!id || !imageUrl || !imageSource) return null;
          return db
            .prepare(
              `UPDATE events
               SET image_url = ?, image_source = ?
               WHERE id = ? AND (image_url IS NULL OR TRIM(image_url) = '')`,
            )
            .bind(imageUrl, imageSource, id);
        })
        .filter(Boolean) as D1PreparedStatement[];
      if (stmts.length) {
        const results = await db.batch(stmts);
        updated += results.reduce(
          (sum, result) => sum + (result.meta?.changes ?? 0),
          0,
        );
      }
    }

    return { ok: true, success: true, updated };
  }

  if (action === "deleteEvent") {
    const id = String(data.id || "");
    if (!id) return { ok: false, error: "id required" };
    await db.prepare("DELETE FROM events WHERE id = ?").bind(id).run();
    return { ok: true, success: true };
  }

  if (action === "adminStats") {
    const events = await db
      .prepare("SELECT COUNT(*) as c FROM events")
      .first<{ c: number }>();
    const missingImage = await db
      .prepare(
        `SELECT COUNT(*) as c FROM events
         WHERE image_url IS NULL OR TRIM(image_url) = ''`,
      )
      .first<{ c: number }>();
    const missingImageWithWebsite = await db
      .prepare(
        `SELECT COUNT(*) as c FROM events
         WHERE (image_url IS NULL OR TRIM(image_url) = '')
           AND website IS NOT NULL AND TRIM(website) != ''`,
      )
      .first<{ c: number }>();
    const users = await db
      .prepare("SELECT COUNT(*) as c FROM users")
      .first<{ c: number }>();
    const favorites = await db
      .prepare("SELECT COUNT(*) as c FROM user_favorites")
      .first<{ c: number }>();
    const tokens = await db
      .prepare("SELECT COUNT(*) as c FROM device_push_tokens")
      .first<{ c: number }>();
    const syncedAt = await db
      .prepare("SELECT value FROM meta WHERE key = 'events_synced_at'")
      .first<{ value: string }>();
    return {
      ok: true,
      stats: {
        events: events?.c ?? 0,
        eventsMissingImage: missingImage?.c ?? 0,
        eventsMissingImageWithWebsite: missingImageWithWebsite?.c ?? 0,
        users: users?.c ?? 0,
        favorites: favorites?.c ?? 0,
        pushTokens: tokens?.c ?? 0,
        eventsSyncedAt: syncedAt?.value ?? null,
      },
    };
  }

  if (action === "listUsers") {
    const limit = Math.min(Number(data.limit) || 100, 500);
    const q = data.q ? String(data.q).trim() : "";
    const { results } = q
      ? await db
          .prepare(
            `SELECT * FROM users
             WHERE email LIKE ? OR name LIKE ? OR id LIKE ?
             ORDER BY updated_at DESC LIMIT ?`,
          )
          .bind(`%${q}%`, `%${q}%`, `%${q}%`, limit)
          .all()
      : await db
          .prepare(`SELECT * FROM users ORDER BY updated_at DESC LIMIT ?`)
          .bind(limit)
          .all();
    return {
      ok: true,
      users: (results || []).map((r) => mapUser(r as Record<string, unknown>)),
    };
  }

  if (action === "listFavoritesAdmin") {
    const limit = Math.min(Number(data.limit) || 100, 500);
    const q = data.q ? String(data.q).trim() : "";
    const { results } = q
      ? await db
          .prepare(
            `SELECT f.id, f.user_id, f.event_id, f.event_title, f.event_start_date,
                    f.event_end_date, f.event_location, f.event_url, f.image_url, f.created_at,
                    u.name as user_name
             FROM user_favorites f
             LEFT JOIN users u ON u.id = f.user_id
             WHERE f.user_id LIKE ? OR f.event_id LIKE ? OR f.event_title LIKE ?
                OR u.name LIKE ?
             ORDER BY f.created_at DESC LIMIT ?`,
          )
          .bind(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, limit)
          .all()
      : await db
          .prepare(
            `SELECT f.id, f.user_id, f.event_id, f.event_title, f.event_start_date,
                    f.event_end_date, f.event_location, f.event_url, f.image_url, f.created_at,
                    u.name as user_name
             FROM user_favorites f
             LEFT JOIN users u ON u.id = f.user_id
             ORDER BY f.created_at DESC LIMIT ?`,
          )
          .bind(limit)
          .all();
    const favorites = (results || []).map((r) => ({
      id: String(r.id ?? ""),
      userId: String(r.user_id ?? ""),
      userName: r.user_name ?? "",
      eventId: String(r.event_id ?? ""),
      eventTitle: r.event_title ?? "",
      eventStartDate: r.event_start_date ?? "",
      eventEndDate: r.event_end_date ?? "",
      eventLocation: r.event_location ?? "",
      eventUrl: r.event_url ?? "",
      imageUrl: r.image_url ?? "",
      createdAt: r.created_at ?? "",
    }));
    return { ok: true, favorites };
  }

  if (action === "listPushTokens") {
    const limit = Math.min(Number(data.limit) || 100, 500);
    const q = data.q ? String(data.q).trim() : "";
    const { results } = q
      ? await db
          .prepare(
            `SELECT expo_push_token as expoPushToken, platform, user_id as userId,
                    updated_at as updatedAt, created_at as createdAt
             FROM device_push_tokens
             WHERE expo_push_token LIKE ? OR platform LIKE ? OR user_id LIKE ?
             ORDER BY updated_at DESC LIMIT ?`,
          )
          .bind(`%${q}%`, `%${q}%`, `%${q}%`, limit)
          .all()
      : await db
          .prepare(
            `SELECT expo_push_token as expoPushToken, platform, user_id as userId,
                    updated_at as updatedAt, created_at as createdAt
             FROM device_push_tokens ORDER BY updated_at DESC LIMIT ?`,
          )
          .bind(limit)
          .all();
    return { ok: true, tokens: results || [] };
  }

  // —— Bulk replace（遷移用）——
  if (action === "replaceUsers") {
    const raw = Array.isArray(data.users) ? (data.users as Json[]) : [];
    // Sheet 可能有重複 id；D1 PK 不容許 → 後寫覆蓋先寫
    const byId = new Map<string, Json>();
    for (const u of raw) {
      const id = u.id ? String(u.id).trim() : "";
      if (!id) continue;
      byId.set(id, u);
    }
    const users = [...byId.values()];

    await db.prepare("DELETE FROM users").run();
    const BATCH = 40;
    for (let i = 0; i < users.length; i += BATCH) {
      const slice = users.slice(i, i + BATCH);
      const stmts = slice.map((u) =>
        db
          .prepare(
            `INSERT INTO users (id, provider, line_user_id, email, name, picture, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               provider=excluded.provider,
               line_user_id=excluded.line_user_id,
               email=excluded.email,
               name=excluded.name,
               picture=excluded.picture,
               created_at=excluded.created_at,
               updated_at=excluded.updated_at`,
          )
          .bind(
            String(u.id),
            u.provider ? String(u.provider) : null,
            u.lineUserId ? String(u.lineUserId) : null,
            u.email ? String(u.email) : null,
            u.name ? String(u.name) : null,
            u.picture ? String(u.picture) : null,
            u.created_at ? String(u.created_at) : nowStamp(),
            u.updated_at ? String(u.updated_at) : nowStamp(),
          ),
      );
      if (stmts.length) await db.batch(stmts);
    }
    return {
      ok: true,
      success: true,
      count: users.length,
      dedupedFrom: raw.length,
    };
  }

  if (action === "replaceFavorites") {
    const raw = Array.isArray(data.favorites)
      ? (data.favorites as Json[])
      : [];
    const byKey = new Map<string, Json>();
    for (const f of raw) {
      if (!f.userId || !f.eventId) continue;
      byKey.set(`${String(f.userId)}::${String(f.eventId)}`, f);
    }
    const favorites = [...byKey.values()];

    await db.prepare("DELETE FROM user_favorites").run();
    const BATCH = 40;
    for (let i = 0; i < favorites.length; i += BATCH) {
      const slice = favorites.slice(i, i + BATCH);
      const stmts = slice.map((f) =>
        db
          .prepare(
            `INSERT INTO user_favorites
             (id, user_id, event_id, event_title, event_start_date, event_end_date,
              event_location, event_url, image_url, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id, event_id) DO UPDATE SET
               event_title=excluded.event_title,
               event_start_date=excluded.event_start_date,
               event_end_date=excluded.event_end_date,
               event_location=excluded.event_location,
               event_url=excluded.event_url,
               image_url=excluded.image_url,
               created_at=excluded.created_at`,
          )
          .bind(
            f.id ? String(f.id) : uuid(),
            String(f.userId),
            String(f.eventId),
            f.eventTitle ? String(f.eventTitle) : null,
            f.eventStartDate ? String(f.eventStartDate) : null,
            f.eventEndDate ? String(f.eventEndDate) : null,
            f.eventLocation ? String(f.eventLocation) : null,
            f.eventUrl ? String(f.eventUrl) : null,
            f.imageUrl ? String(f.imageUrl) : null,
            f.createdAt ? String(f.createdAt) : nowStamp(),
          ),
      );
      if (stmts.length) await db.batch(stmts);
    }
    return {
      ok: true,
      success: true,
      count: favorites.length,
      dedupedFrom: raw.length,
    };
  }

  if (action === "replacePushTokens") {
    const raw = Array.isArray(data.tokens) ? (data.tokens as Json[]) : [];
    const byToken = new Map<string, Json>();
    for (const t of raw) {
      const token = t.expoPushToken ? String(t.expoPushToken).trim() : "";
      if (!token) continue;
      byToken.set(token, t);
    }
    const tokens = [...byToken.values()];

    await db.prepare("DELETE FROM device_push_tokens").run();
    const BATCH = 40;
    for (let i = 0; i < tokens.length; i += BATCH) {
      const slice = tokens.slice(i, i + BATCH);
      const stmts = slice.map((t) =>
        db
          .prepare(
            `INSERT INTO device_push_tokens
             (expo_push_token, platform, user_id, updated_at, created_at)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(expo_push_token) DO UPDATE SET
               platform=excluded.platform,
               user_id=excluded.user_id,
               updated_at=excluded.updated_at,
               created_at=excluded.created_at`,
          )
          .bind(
            String(t.expoPushToken),
            t.platform ? String(t.platform) : "android",
            t.userId ? String(t.userId) : null,
            t.updatedAt ? String(t.updatedAt) : nowStamp(),
            t.createdAt ? String(t.createdAt) : nowStamp(),
          ),
      );
      if (stmts.length) await db.batch(stmts);
    }
    return {
      ok: true,
      success: true,
      count: tokens.length,
      dedupedFrom: raw.length,
    };
  }

  return { error: "Unknown action" };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return json({ ok: true });
    }

    if (req.method === "GET") {
      return json({ status: "cyc-data-api running", ok: true });
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    if (!authorize(req, env)) {
      return json({ error: "Unauthorized" }, 401);
    }

    try {
      const body = (await req.json()) as Json;
      const action = String(body.action || "");
      if (!action) return json({ error: "action required" }, 400);
      const result = await handleAction(env, action, body);
      return json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return json({ ok: false, success: false, error: message }, 500);
    }
  },
};
