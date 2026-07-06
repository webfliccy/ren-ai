import { db } from "@/db";
import { issues } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const { number, title, description, status } = await request.json();

  const [existing] = await db
    .select()
    .from(issues)
    .where(eq(issues.id, Number(id)));
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const isNowPublished = status === "published";
  const wasPublished = existing.status === "published";
  const publishedAt =
    isNowPublished && !wasPublished ? new Date() : existing.publishedAt;

  const [updated] = await db
    .update(issues)
    .set({
      number,
      title,
      description: description || null,
      status,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(issues.id, Number(id)))
    .returning();

  return Response.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  await db.delete(issues).where(eq(issues.id, Number(id)));
  return new Response(null, { status: 204 });
}
