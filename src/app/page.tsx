import PostCard from "@/components/PostCard";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { count, desc, eq, like } from "drizzle-orm";
import Link from "next/link";

export const metadata = {
  title: "ren·ai",
  description: "A blog.",
};

const PER_PAGE = 10;

interface Props {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { tag, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const offset = (page - 1) * PER_PAGE;

  let baseQuery = db
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .$dynamic();

  let countQuery = db
    .select({ total: count() })
    .from(posts)
    .where(eq(posts.status, "published"))
    .$dynamic();

  if (tag) {
    baseQuery = baseQuery.where(like(posts.tags, `%"${tag}"%`));
    countQuery = countQuery.where(like(posts.tags, `%"${tag}"%`));
  }

  const [allPosts, [{ total }]] = await Promise.all([
    baseQuery.orderBy(desc(posts.publishedAt)).limit(PER_PAGE).offset(offset),
    countQuery,
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">ren·ai</h1>
        <p className="mt-2 text-gray-500">Thoughts, writing, ideas.</p>
      </header>

      {tag && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-gray-500">Tag:</span>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {tag}
          </span>
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600">
            Clear ×
          </a>
        </div>
      )}

      {allPosts.length === 0 ? (
        <p className="text-gray-400">
          {tag ? `No posts tagged "${tag}".` : "No posts yet."}
        </p>
      ) : (
        <>
          <div>
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-between text-sm">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="text-gray-500 hover:text-gray-900">
                  ← Newer
                </Link>
              ) : (
                <span />
              )}
              <span className="text-gray-400">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="text-gray-500 hover:text-gray-900">
                  Older →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </main>
  );
}
