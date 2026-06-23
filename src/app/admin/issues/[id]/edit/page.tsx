import IssueForm from "@/components/IssueForm";
import { db } from "@/db";
import { issues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Edit issue — ren·ai" };

export default async function EditIssuePage({ params }: Props) {
  const { id } = await params;
  const [issue] = await db.select().from(issues).where(eq(issues.id, Number(id)));
  if (!issue) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Edit issue</h1>
      <IssueForm issue={issue} />
    </main>
  );
}
