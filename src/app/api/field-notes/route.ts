import { db } from "@/db";
import { fieldNotes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";
import { desc } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  const notes = await db
    .select()
    .from(fieldNotes)
    .orderBy(desc(fieldNotes.createdAt));
  return Response.json(notes);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const {
    title, content, excerpt, status, tags, issueId,
    outcomeStatus, outcomeDateClosed, outcomeRuns,
    experiment, artefacts,
  } = body;

  if (!title?.trim()) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = generateSlug(title);
  const publishedAt = status === "published" ? new Date() : null;

  const [note] = await db
    .insert(fieldNotes)
    .values({
      title,
      slug,
      content: content ?? "",
      excerpt,
      status: status ?? "draft",
      tags: JSON.stringify(tags ?? []),
      issueId: issueId ?? null,
      outcomeStatus: outcomeStatus ?? null,
      outcomeDateClosed: outcomeDateClosed ? new Date(outcomeDateClosed) : null,
      outcomeRuns: outcomeRuns ?? null,
      experiment: JSON.stringify(experiment ?? {}),
      artefacts: JSON.stringify(artefacts ?? []),
      publishedAt,
    })
    .returning();

  return Response.json(note, { status: 201 });
}
