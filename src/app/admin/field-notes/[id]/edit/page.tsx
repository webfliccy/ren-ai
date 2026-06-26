import FieldNoteForm from "@/components/FieldNoteForm";
import { db } from "@/db";
import { fieldNotes, issues } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit field note — ren·ai" };

export default async function EditFieldNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [[note], allIssues] = await Promise.all([
    db.select().from(fieldNotes).where(eq(fieldNotes.id, Number(id))),
    db.select({ id: issues.id, number: issues.number, title: issues.title }).from(issues).orderBy(desc(issues.number)),
  ]);

  if (!note) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Edit field note</h1>
      <FieldNoteForm note={note} issues={allIssues} />
    </main>
  );
}
