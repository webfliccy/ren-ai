import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { marked } from "marked";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug));

  if (!post || post.status !== "published") notFound();

  const html = await marked.parse(post.content);

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← All posts
      </a>

      <article className="mt-8">
        <header className="mb-10 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {post.title}
          </h1>
          {date && (
            <time className="text-sm text-gray-400" dateTime={post.publishedAt?.toISOString()}>
              {date}
            </time>
          )}
        </header>

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </main>
  );
}
