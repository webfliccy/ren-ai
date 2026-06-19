import PostForm from "@/components/PostForm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Edit post — ren·ai" };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.id, Number(id)));
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Edit post</h1>
      <PostForm post={post} />
    </main>
  );
}
