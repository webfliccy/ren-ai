import { db } from "@/db";
import { comments } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const { approved } = await request.json();

  const [updated] = await db
    .update(comments)
    .set({ approved })
    .where(eq(comments.id, Number(id)))
    .returning();

  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  await db.delete(comments).where(eq(comments.id, Number(id)));
  return new Response(null, { status: 204 });
}
