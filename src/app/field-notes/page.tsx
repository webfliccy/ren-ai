import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { DispatchCard } from "@/components/DispatchCard";
import { FieldNoteCard } from "@/components/FieldNoteCard";
import { db } from "@/db";
import { fieldNotes, posts, type FieldNote, type Post } from "@/db/schema";
import { eq } from "drizzle-orm";
import styles from "./field-notes.module.css";

export const metadata = {
  title: "Dispatches & Field Notes — ren·ai",
  description: "Essays, arguments, and experiment logs from the ren·ai research process.",
};

type Entry =
  | { kind: "dispatch"; publishedAt: Date | null; post: Post }
  | { kind: "fieldNote"; publishedAt: Date | null; note: FieldNote };

export default async function DispatchesAndFieldNotesPage() {
  const [allPosts, allNotes] = await Promise.all([
    db.select().from(posts).where(eq(posts.status, "published")),
    db.select().from(fieldNotes).where(eq(fieldNotes.status, "published")),
  ]);

  const entries: Entry[] = [
    ...allPosts.map((p) => ({ kind: "dispatch" as const, publishedAt: p.publishedAt, post: p })),
    ...allNotes.map((n) => ({ kind: "fieldNote" as const, publishedAt: n.publishedAt, note: n })),
  ].sort((a, b) => {
    const at = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bt - at;
  });

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <SiteHeader activePath="/field-notes" />


        <div className={styles.indexHead}>
          <span className={styles.sectionLabel}>Dispatches &amp; Field Notes</span>
          <h1 className={styles.indexTitle}>Essays &amp; experiment logs</h1>
          <p className={styles.indexDeck}>
            Arguments, observations, and running notes from the ren&middot;ai research process.
          </p>
        </div>

        {entries.length === 0 ? (
          <p className={styles.empty}>Nothing published yet.</p>
        ) : (
          <div className={styles.cards}>
            {entries.map((entry) =>
              entry.kind === "dispatch" ? (
                <DispatchCard key={`dispatch-${entry.post.id}`} post={entry.post} />
              ) : (
                <FieldNoteCard key={`fieldNote-${entry.note.id}`} note={entry.note} />
              )
            )}
          </div>
        )}

        <SiteFooter />
      </div>
    </div>
  );
}
