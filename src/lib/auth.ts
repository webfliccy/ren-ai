import { cookies } from "next/headers";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return !!process.env.ADMIN_SECRET && token === process.env.ADMIN_SECRET;
}

export async function requireAdmin(): Promise<Response | null> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
