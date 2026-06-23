import { db } from "@/db";
import { tools } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { asc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const issueId = request.nextUrl.searchParams.get("issueId");
  const query = db.select().from(tools).orderBy(asc(tools.sortOrder), asc(tools.createdAt));
  const rows = issueId
    ? await db.select().from(tools).where(eq(tools.issueId, Number(issueId))).orderBy(asc(tools.sortOrder), asc(tools.createdAt))
    : await query;
  return Response.json(rows);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { issueId, category, name, illustration, descriptor, url, status, sortOrder } =
    await request.json();

  if (!issueId || !name?.trim()) {
    return Response.json({ error: "issueId and name are required" }, { status: 400 });
  }

  const [tool] = await db
    .insert(tools)
    .values({
      issueId: Number(issueId),
      category: category ?? "",
      name: name.trim(),
      illustration: illustration || null,
      descriptor: descriptor ?? "",
      url: url || null,
      status: status ?? "draft",
      sortOrder: sortOrder ?? 0,
    })
    .returning();

  return Response.json(tool, { status: 201 });
}
