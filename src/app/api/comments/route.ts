import { auth } from "@/auth";
import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { and, asc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const postId = searchParams.get("postId");
  const all = searchParams.get("all") === "true";

  if (all) {
    const authError = await requireAdmin();
    if (authError) return authError;

    const rows = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        body: comments.body,
        approved: comments.approved,
        createdAt: comments.createdAt,
        authorName: users.name,
        authorImage: users.image,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.approved, false))
      .orderBy(asc(comments.createdAt));

    return Response.json(rows);
  }

  if (!postId) {
    return Response.json({ error: "postId required" }, { status: 400 });
  }

  const rows = await db
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
    .where(and(eq(comments.postId, Number(postId)), eq(comments.approved, true)))
    .orderBy(asc(comments.createdAt));

  return Response.json(rows);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Sign in to comment" }, { status: 401 });
  }

  const { postId, body, parentId } = await request.json();

  if (!body?.trim()) {
    return Response.json({ error: "Comment body is required" }, { status: 400 });
  }

  const [comment] = await db
    .insert(comments)
    .values({
      postId: Number(postId),
      authorId: session.user.id,
      body: body.trim(),
      parentId: parentId ? Number(parentId) : null,
      approved: false,
    })
    .returning();

  return Response.json(comment, { status: 201 });
}
