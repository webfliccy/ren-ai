import PostForm from "@/components/PostForm";
import { db } from "@/db";
import { issues } from "@/db/schema";
import { desc } from "drizzle-orm";

export const metadata = { title: "New post — ren·ai" };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const allIssues = await db
    .select({ id: issues.id, number: issues.number, title: issues.title })
    .from(issues)
    .orderBy(desc(issues.number));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">New post</h1>
      <PostForm issues={allIssues} />
    </main>
  );
}
