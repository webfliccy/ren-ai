import PostForm from "@/components/PostForm";
import { db } from "@/db";
import { issues, posts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Edit post — ren·ai" };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const [[post], allIssues] = await Promise.all([
    db.select().from(posts).where(eq(posts.id, Number(id))),
    db
      .select({ id: issues.id, number: issues.number, title: issues.title })
      .from(issues)
      .orderBy(desc(issues.number)),
  ]);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Edit post</h1>
      <PostForm post={post} issues={allIssues} />
    </main>
  );
}
