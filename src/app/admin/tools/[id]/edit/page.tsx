import ToolForm from "@/components/ToolForm";
import { db } from "@/db";
import { issues, tools } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit tool — Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditToolPage({ params }: Props) {
  const { id } = await params;
  const [tool] = await db.select().from(tools).where(eq(tools.id, Number(id)));
  if (!tool) notFound();

  const allIssues = await db
    .select({ id: issues.id, number: issues.number, title: issues.title })
    .from(issues)
    .orderBy(desc(issues.number));

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">
          ← Admin
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">Edit tool</h1>
      </div>
      <ToolForm tool={tool} issues={allIssues} />
    </main>
  );
}
