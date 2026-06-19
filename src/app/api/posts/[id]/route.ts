import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { calculateReadingTime } from "@/lib/reading-time";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.id, Number(id)));
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(post);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { title, content, excerpt, status, slug, tags, seoTitle, seoDescription, ogImage } = body;

  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, Number(id)));
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const isNowPublished = status === "published";
  const wasPublished = existing.status === "published";
  const publishedAt =
    isNowPublished && !wasPublished ? new Date() : existing.publishedAt;

  const readingTime = calculateReadingTime(content ?? existing.content);

  const [updated] = await db
    .update(posts)
    .set({
      title,
      slug,
      content,
      excerpt,
      status,
      tags: JSON.stringify(tags ?? []),
      seoTitle,
      seoDescription,
      ogImage,
      readingTime,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, Number(id)))
    .returning();

  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  await db.delete(posts).where(eq(posts.id, Number(id)));
  return new Response(null, { status: 204 });
}
