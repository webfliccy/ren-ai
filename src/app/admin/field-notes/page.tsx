import { db } from "@/db";
import { fieldNotes } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export const metadata = { title: "Field notes — ren·ai admin" };

const STATUS_COLOURS = {
  pending: "bg-gray-100 text-gray-600",
  success: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  failure: "bg-red-100 text-red-700",
  inconclusive: "bg-purple-100 text-purple-700",
} as const;

export default async function FieldNotesAdminPage() {
  const notes = await db
    .select()
    .from(fieldNotes)
    .orderBy(desc(fieldNotes.createdAt));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Field notes</h1>
        <Link
          href="/admin/field-notes/new"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New field note
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-gray-500">No field notes yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {notes.map((note) => {
            const outcome = note.outcomeStatus as keyof typeof STATUS_COLOURS | null;
            return (
              <li key={note.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/field-notes/${note.id}/edit`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                  >
                    {note.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${note.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {note.status}
                    </span>
                    {outcome && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOURS[outcome]}`}>
                        {outcome}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/admin/field-notes/${note.id}/edit`}
                  className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-700"
                >
                  Edit →
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-700">
          ← Admin
        </Link>
      </div>
    </main>
  );
}
