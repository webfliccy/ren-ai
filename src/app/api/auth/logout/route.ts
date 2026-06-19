export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    "admin_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
  );
  return response;
}
