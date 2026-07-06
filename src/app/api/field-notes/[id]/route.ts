import { db } from "@/db";
import { fieldNotes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { resolveHindsight } from "@/lib/hindsight";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [note] = await db.select().from(fieldNotes).where(eq(fieldNotes.id, Number(id)));
  if (!note) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(note);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const {
    title, slug, content, excerpt, status, tags, issueId,
    outcomeStatus, outcomeDateClosed, outcomeRuns,
    experiment, artefacts, references,
    hindsight, hindsightAddedAt,
  } = body;

  const [existing] = await db.select().from(fieldNotes).where(eq(fieldNotes.id, Number(id)));
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const isNowPublished = status === "published";
  const wasPublished = existing.status === "published";
  const publishedAt = isNowPublished && !wasPublished ? new Date() : existing.publishedAt;

  const [updated] = await db
    .update(fieldNotes)
    .set({
      title,
      slug,
      content,
      excerpt,
      status,
      tags: JSON.stringify(tags ?? []),
      issueId: issueId ?? null,
      outcomeStatus: outcomeStatus ?? null,
      outcomeDateClosed: outcomeDateClosed ? new Date(outcomeDateClosed) : null,
      outcomeRuns: outcomeRuns ?? null,
      experiment: JSON.stringify(experiment ?? {}),
      artefacts: JSON.stringify(artefacts ?? []),
      references: JSON.stringify(references ?? []),
      ...resolveHindsight({ hindsight, hindsightAddedAt }, existing),
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(fieldNotes.id, Number(id)))
    .returning();

  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  await db.delete(fieldNotes).where(eq(fieldNotes.id, Number(id)));
  return new Response(null, { status: 204 });
}
