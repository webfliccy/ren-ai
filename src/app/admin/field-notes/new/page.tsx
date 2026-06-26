import FieldNoteForm from "@/components/FieldNoteForm";
import { db } from "@/db";
import { issues } from "@/db/schema";
import { desc } from "drizzle-orm";

export const metadata = { title: "New field note — ren·ai" };

export default async function NewFieldNotePage() {
  const allIssues = await db
    .select({ id: issues.id, number: issues.number, title: issues.title })
    .from(issues)
    .orderBy(desc(issues.number));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">New field note</h1>
      <FieldNoteForm issues={allIssues} />
    </main>
  );
}
