import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { secret } = await request.json();

  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    `admin_token=${secret}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}`,
  );
  return response;
}
