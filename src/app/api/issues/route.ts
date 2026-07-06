import { db } from "@/db";
import { issues } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  const all = await db.select().from(issues).orderBy(desc(issues.number));
  return Response.json(all);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { number, title, description, status } = await request.json();

  if (!number || !title?.trim()) {
    return Response.json(
      { error: "Number and title are required" },
      { status: 400 },
    );
  }

  const publishedAt = status === "published" ? new Date() : null;

  const [issue] = await db
    .insert(issues)
    .values({
      number,
      title,
      description: description || null,
      status: status ?? "draft",
      publishedAt,
    })
    .returning();

  return Response.json(issue, { status: 201 });
}
