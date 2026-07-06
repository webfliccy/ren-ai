import { db } from "@/db";
import { fieldNotes } from "@/db/schema";
import type { FieldNote } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

// ── Read functions ────────────────────────────────────────────────────────────

export async function getFieldNotesByIssue(
  issueId: number,
): Promise<FieldNote[]> {
  return db
    .select()
    .from(fieldNotes)
    .where(
      and(eq(fieldNotes.issueId, issueId), eq(fieldNotes.status, "published")),
    )
    .orderBy(desc(fieldNotes.publishedAt));
}
