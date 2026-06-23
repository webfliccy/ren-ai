import { db } from "@/db";
import { tools } from "@/db/schema";
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
  const { issueId, category, name, illustration, descriptor, url, status, sortOrder } =
    await request.json();

  const [existing] = await db.select().from(tools).where(eq(tools.id, Number(id)));
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const [updated] = await db
    .update(tools)
    .set({
      issueId: issueId !== undefined ? Number(issueId) : existing.issueId,
      category: category ?? existing.category,
      name: name?.trim() ?? existing.name,
      illustration: illustration !== undefined ? illustration || null : existing.illustration,
      descriptor: descriptor ?? existing.descriptor,
      url: url !== undefined ? url || null : existing.url,
      status: status ?? existing.status,
      sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(tools.id, Number(id)))
    .returning();

  return Response.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  await db.delete(tools).where(eq(tools.id, Number(id)));
  return new Response(null, { status: 204 });
}
