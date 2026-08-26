import { cookies } from "next/headers";

const COOKIE = "cyc_admin";

export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET?.trim() || undefined;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;
  const jar = await cookies();
  return jar.get(COOKIE)?.value === secret;
}

export function adminCookieName() {
  return COOKIE;
}

export function requireAdminSecretInEnv(): string {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("ADMIN_SECRET not set");
  }
  return secret;
}
