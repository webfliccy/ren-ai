import PostForm from "@/components/PostForm";
import { getPostById } from "@/services/posts";
import { db } from "@/db";
import { issues } from "@/db/schema";
import { desc } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Edit post — ren·ai" };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const [post, allIssues] = await Promise.all([
    getPostById(Number(id)),
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
