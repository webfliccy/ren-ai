import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { calculateReadingTime } from "@/lib/reading-time";
import { generateSlug } from "@/lib/slug";
import { desc, eq, like } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const all = searchParams.get("all") === "true";
  const tag = searchParams.get("tag");

  let query = db.select().from(posts).$dynamic();

  if (!all) {
    query = query.where(eq(posts.status, "published"));
  }
  if (tag) {
    query = query.where(like(posts.tags, `%"${tag}"%`));
  }

  const results = await query.orderBy(
    all ? desc(posts.createdAt) : desc(posts.publishedAt)
  );

  return Response.json(results);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { title, content, excerpt, status, tags, seoTitle, seoDescription, ogImage } = body;

  if (!title?.trim()) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = generateSlug(title);
  const publishedAt = status === "published" ? new Date() : null;
  const readingTime = calculateReadingTime(content ?? "");

  const [post] = await db
    .insert(posts)
    .values({
      title,
      slug,
      content: content ?? "",
      excerpt,
      status: status ?? "draft",
      tags: JSON.stringify(tags ?? []),
      seoTitle,
      seoDescription,
      ogImage,
      readingTime,
      publishedAt,
    })
    .returning();

  return Response.json(post, { status: 201 });
}
