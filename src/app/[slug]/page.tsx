import CommentSection from "@/components/CommentSection";
import { db } from "@/db";
import { comments, posts, users } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

function parseTags(raw: string): string[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
  if (!post) return {};

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt ?? undefined;
  const image = post.ogImage ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${base}/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug));

  if (!post || post.status !== "published") notFound();

  const tags = parseTags(post.tags);

  const approvedComments = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      parentId: comments.parentId,
      body: comments.body,
      createdAt: comments.createdAt,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(and(eq(comments.postId, post.id), eq(comments.approved, true)))
    .orderBy(asc(comments.createdAt));

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
        {post.ogImage && (
          <img
            src={post.ogImage}
            alt={post.title}
            className="mb-8 w-full rounded-xl object-cover max-h-72"
          />
        )}
        <header className="mb-10 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {date && <time dateTime={post.publishedAt?.toISOString()}>{date}</time>}
            {post.readingTime > 0 && <span>{post.readingTime} min read</span>}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <CommentSection postId={post.id} initialComments={approvedComments} />
    </main>
  );
}
