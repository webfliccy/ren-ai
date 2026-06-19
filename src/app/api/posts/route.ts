import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";
import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const all = searchParams.get("all") === "true";

  const results = all
    ? await db.select().from(posts).orderBy(desc(posts.createdAt))
    : await db
        .select()
        .from(posts)
        .where(eq(posts.status, "published"))
        .orderBy(desc(posts.publishedAt));

  return Response.json(results);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { title, content, excerpt, status } = body;

  if (!title?.trim()) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = generateSlug(title);
  const publishedAt =
    status === "published" ? new Date() : null;

  const [post] = await db
    .insert(posts)
    .values({ title, slug, content: content ?? "", excerpt, status: status ?? "draft", publishedAt })
    .returning();

  return Response.json(post, { status: 201 });
}
