import { cookies } from "next/headers";

export async function getSessionUsername(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("username")?.value || null;
  } catch {
    return null;
  }
}

export function createSessionHeaders(username: string): [string, string] {
  const maxAge = 365 * 24 * 60 * 60;
  const secure = process.env.NODE_ENV === "production";
  return [
    "Set-Cookie",
    `username=${encodeURIComponent(username)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`,
  ];
}

export function clearSessionHeaders(): [string, string] {
  return [
    "Set-Cookie",
    "username=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
  ];
}
