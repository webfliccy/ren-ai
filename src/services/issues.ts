import { db } from "@/db";
import { issues } from "@/db/schema";
import type { Issue } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getFieldNotesByIssue } from "./fieldNotes";
import { getPostsByIssue } from "./posts";

// ── Read functions ────────────────────────────────────────────────────────────

export async function getIssueById(id: number): Promise<Issue | null> {
  const [issue] = await db.select().from(issues).where(eq(issues.id, id));
  return issue ?? null;
}

export type ContinueReadingItem = {
  kind: "post" | "fieldNote";
  id: number;
  slug: string;
  title: string;
  readingTime?: number;
  outcomeStatus?: string | null;
};

/**
 * Other published posts and field notes in the same issue, newest first,
 * excluding the item currently being read.
 */
export async function getIssueSiblings(
  issueId: number,
  exclude: { kind: "post" | "fieldNote"; id: number },
  limit = 3,
): Promise<ContinueReadingItem[]> {
  const [issuePosts, issueFieldNotes] = await Promise.all([
    getPostsByIssue(issueId),
    getFieldNotesByIssue(issueId),
  ]);

  const merged = [
    ...issuePosts.map((post) => ({
      publishedAt: post.publishedAt,
      item: {
        kind: "post" as const,
        id: post.id,
        slug: post.slug,
        title: post.title,
        readingTime: post.readingTime,
      },
    })),
    ...issueFieldNotes.map((note) => ({
      publishedAt: note.publishedAt,
      item: {
        kind: "fieldNote" as const,
        id: note.id,
        slug: note.slug,
        title: note.title,
        outcomeStatus: note.outcomeStatus,
      },
    })),
  ].filter(
    ({ item }) => !(item.kind === exclude.kind && item.id === exclude.id),
  );

  merged.sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
  );

  return merged.slice(0, limit).map(({ item }) => item);
}
