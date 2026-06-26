import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { db } from "@/db";
import { fieldNotes, posts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import styles from "./field-notes.module.css";

export const metadata = {
  title: "Dispatches & Field Notes — ren·ai",
  description: "Essays, arguments, and experiment logs from the ren·ai research process.",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

type Entry =
  | { kind: "dispatch"; id: number; slug: string; title: string; excerpt: string | null; publishedAt: Date | null; readingTime: number }
  | { kind: "fieldNote"; id: number; slug: string; title: string; excerpt: string | null; publishedAt: Date | null; outcomeStatus: string | null };

export default async function DispatchesAndFieldNotesPage() {
  const [allPosts, allNotes] = await Promise.all([
    db
      .select({ id: posts.id, slug: posts.slug, title: posts.title, excerpt: posts.excerpt, publishedAt: posts.publishedAt, readingTime: posts.readingTime })
      .from(posts)
      .where(eq(posts.status, "published")),
    db
      .select({ id: fieldNotes.id, slug: fieldNotes.slug, title: fieldNotes.title, excerpt: fieldNotes.excerpt, publishedAt: fieldNotes.publishedAt, outcomeStatus: fieldNotes.outcomeStatus })
      .from(fieldNotes)
      .where(eq(fieldNotes.status, "published")),
  ]);

  const entries: Entry[] = [
    ...allPosts.map((p) => ({ kind: "dispatch" as const, ...p })),
    ...allNotes.map((n) => ({ kind: "fieldNote" as const, ...n })),
  ].sort((a, b) => {
    const at = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bt - at;
  });

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <SiteHeader activePath="/field-notes" />
        <div style={{ height: 4 }} />
        <div className={styles.ruleThin} />

        <div className={styles.indexHead}>
          <span className={styles.sectionLabel}>Dispatches &amp; Field Notes</span>
          <h1 className={styles.indexTitle}>Essays &amp; experiment logs</h1>
          <p className={styles.indexDeck}>
            Arguments, observations, and running notes from the ren&middot;ai research process.
          </p>
        </div>

        <div className={styles.list}>
          {entries.length === 0 ? (
            <p className={styles.empty}>Nothing published yet.</p>
          ) : (
            entries.map((entry) => {
              const date = entry.publishedAt ? formatDate(new Date(entry.publishedAt)) : null;
              const href = entry.kind === "dispatch" ? `/${entry.slug}` : `/field-notes/${entry.slug}`;
              return (
                <Link key={`${entry.kind}-${entry.id}`} href={href} className={styles.entry}>
                  <div className={styles.entryMeta}>
                    {date && <span className={styles.entryDate}>{date}</span>}
                    <span className={entry.kind === "dispatch" ? styles.typeDispatch : styles.typeFieldNote}>
                      {entry.kind === "dispatch" ? "Dispatch" : "Field Note"}
                    </span>
                    {entry.kind === "fieldNote" && entry.outcomeStatus && (
                      <span className={`${styles.outcomeTag} ${styles[entry.outcomeStatus]}`}>
                        {entry.outcomeStatus}
                      </span>
                    )}
                    {entry.kind === "dispatch" && (
                      <span className={styles.entryReadTime}>{entry.readingTime} min read</span>
                    )}
                  </div>
                  <h2 className={styles.entryTitle}>{entry.title}</h2>
                  {entry.excerpt && <p className={styles.entryExcerpt}>{entry.excerpt}</p>}
                </Link>
              );
            })
          )}
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
