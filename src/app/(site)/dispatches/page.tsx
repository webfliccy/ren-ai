import { DispatchCard } from "@/components/DispatchCard";
import { FieldNoteCard } from "@/components/FieldNoteCard";
import { db } from "@/db";
import { fieldNotes, posts, type FieldNote, type Post } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "Dispatches & Field Notes — ren·ai",
  description:
    "Essays, arguments, and experiment logs from the ren·ai research process.",
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
    ...allPosts.map((p) => ({
      kind: "dispatch" as const,
      publishedAt: p.publishedAt,
      post: p,
    })),
    ...allNotes.map((n) => ({
      kind: "fieldNote" as const,
      publishedAt: n.publishedAt,
      note: n,
    })),
  ].sort((a, b) => {
    const at = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bt - at;
  });

  return (
    <>
      <div className="mx-auto mt-12 max-w-[720px]">
        <span className="mb-5 inline-block bg-ink px-2.5 py-1 font-courier text-[9px] font-bold tracking-4 text-white uppercase">
          Dispatches &amp; Field Notes
        </span>
        <h1 className="mb-3 font-cormorant text-[52px] leading-[1.04] font-semibold tracking-[-0.015em] text-ink">
          Essays &amp; experiment logs
        </h1>
        <p className="mb-10 font-newsreader text-lg leading-[1.55] text-ink-light italic">
          Incomplete thoughts and observations.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="mx-auto my-15 max-w-[720px] font-newsreader text-[17px] text-muted italic">
          Nothing published yet.
        </p>
      ) : (
        <div className="mx-auto flex max-w-[720px] flex-col">
          {entries.map((entry) =>
            entry.kind === "dispatch" ? (
              <DispatchCard
                key={`dispatch-${entry.post.id}`}
                post={entry.post}
                layout="list"
              />
            ) : (
              <FieldNoteCard
                key={`fieldNote-${entry.note.id}`}
                note={entry.note}
                layout="list"
              />
            ),
          )}
        </div>
      )}
    </>
  );
}
