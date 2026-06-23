import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

// Simple in-memory rate limiter: max 5 attempts per IP per hour.
// Resets on redeploy, which is fine for a small newsletter.
const attempts = new Map<string, { count: number; resetAt: number }>();

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Bad request" }, { status: 400 });

  // Honeypot: bots fill this, humans don't see it
  if (body.website) {
    // Silently return 200 so bots think they succeeded
    return Response.json({ ok: true });
  }

  const ip = getIp(request);
  if (isRateLimited(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const email: string = (body.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Valid email required" }, { status: 400 });
  }

  const existing = await db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(eq(subscribers.email, email))
    .limit(1);

  if (existing.length > 0) {
    // Don't reveal whether the email is already registered
    return Response.json({ ok: true });
  }

  await db.insert(subscribers).values({
    email,
    source: body.source ?? "homepage",
  });

  return Response.json({ ok: true }, { status: 201 });
}
