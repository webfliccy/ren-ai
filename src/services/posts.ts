import { db } from "@/db";
import { comments, posts, users } from "@/db/schema";
import type { Post } from "@/db/schema";
import { resolveHindsight } from "@/lib/hindsight";
import { calculateReadingTime } from "@/lib/reading-time";
import { generateSlug } from "@/lib/slug";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";

export type ApprovedComment = {
  id: number;
  postId: number | null;
  fieldNoteId: number | null;
  parentId: number | null;
  body: string;
  createdAt: Date;
  authorName: string | null;
  authorImage: string | null;
};

export type PostWithComments = {
  post: Post;
  comments: ApprovedComment[];
};

// ── Read functions ────────────────────────────────────────────────────────────

export async function getPublishedPosts(opts?: {
  tag?: string;
  all?: boolean;
  limit?: number;
}): Promise<Post[]> {
  let query = db.select().from(posts).$dynamic();

  if (!opts?.all) {
    query = query.where(eq(posts.status, "published"));
  }
  if (opts?.tag) {
    query = query.where(like(posts.tags, `%"${opts.tag}"%`));
  }

  query = query.orderBy(
    opts?.all ? desc(posts.createdAt) : desc(posts.publishedAt)
  );

  if (opts?.limit) {
    query = query.limit(opts.limit);
  }

  return query;
}

export async function getPostsByIssue(issueId: number): Promise<Post[]> {
  return db
    .select()
    .from(posts)
    .where(and(eq(posts.issueId, issueId), eq(posts.status, "published")))
    .orderBy(desc(sql`${posts.featured}`), desc(posts.publishedAt));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
  return post ?? null;
}

export async function getPostById(id: number): Promise<Post | null> {
  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  return post ?? null;
}

export async function getPostWithComments(
  slug: string
): Promise<PostWithComments | null> {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
  if (!post || post.status !== "published") return null;

  const approvedComments = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      fieldNoteId: comments.fieldNoteId,
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

  return { post, comments: approvedComments };
}

// ── Write functions ───────────────────────────────────────────────────────────

export type CreatePostInput = {
  title: string;
  content?: string;
  excerpt?: string | null;
  prompt?: string | null;
  figSvg?: string | null;
  status?: "draft" | "published";
  featured?: boolean;
  tags?: string[];
  issueId?: number | null;
  tokens?: string | null;
  references?: unknown[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  hindsight?: string | null;
  hindsightAddedAt?: string | null;
};

export type UpdatePostInput = Partial<CreatePostInput> & { slug?: string };

export async function createPost(input: CreatePostInput): Promise<Post> {
  const slug = generateSlug(input.title);
  const publishedAt = input.status === "published" ? new Date() : null;
  const readingTime = calculateReadingTime(input.content ?? "");

  const [post] = await db
    .insert(posts)
    .values({
      title: input.title,
      slug,
      content: input.content ?? "",
      excerpt: input.excerpt ?? null,
      prompt: input.prompt ?? null,
      figSvg: input.figSvg ?? null,
      status: input.status ?? "draft",
      featured: input.featured ?? false,
      tags: JSON.stringify(input.tags ?? []),
      issueId: input.issueId ?? null,
      tokens: input.tokens ?? null,
      references: JSON.stringify(input.references ?? []),
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
      ...resolveHindsight(input),
      readingTime,
      publishedAt,
    })
    .returning();

  return post;
}

export async function updatePost(
  id: number,
  input: UpdatePostInput
): Promise<Post | null> {
  const [existing] = await db.select().from(posts).where(eq(posts.id, id));
  if (!existing) return null;

  const isNowPublished = input.status === "published";
  const wasPublished = existing.status === "published";
  const publishedAt =
    isNowPublished && !wasPublished ? new Date() : existing.publishedAt;

  const content = input.content ?? existing.content;
  const readingTime = calculateReadingTime(content);

  const [updated] = await db
    .update(posts)
    .set({
      title: input.title,
      slug: input.slug,
      content,
      excerpt: input.excerpt,
      prompt: input.prompt,
      figSvg: input.figSvg,
      status: input.status,
      featured: input.featured ?? false,
      tags: JSON.stringify(input.tags ?? []),
      issueId: input.issueId ?? null,
      tokens: input.tokens ?? null,
      references: JSON.stringify(input.references ?? []),
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      ogImage: input.ogImage,
      ...resolveHindsight(input, existing),
      readingTime,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  return updated;
}

export async function deletePost(id: number): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id));
}
