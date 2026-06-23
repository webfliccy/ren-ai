import ToolForm from "@/components/ToolForm";
import { db } from "@/db";
import { issues } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export const metadata = { title: "New tool — Admin" };

interface Props {
  searchParams: Promise<{ issueId?: string }>;
}

export default async function NewToolPage({ searchParams }: Props) {
  const { issueId } = await searchParams;
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
        <h1 className="text-xl font-bold text-gray-900">New tool</h1>
      </div>
      <ToolForm issues={allIssues} defaultIssueId={issueId ? Number(issueId) : undefined} />
    </main>
  );
}
