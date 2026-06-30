import { requireAdmin } from "@/lib/auth";
import { createPost } from "@/services/posts";
import { getPublishedPosts } from "@/services/posts";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const all = searchParams.get("all") === "true";
  const tag = searchParams.get("tag") ?? undefined;

  const results = await getPublishedPosts({ all, tag });
  return Response.json(results);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { title, content, excerpt, prompt, figSvg, status, featured, tags, issueId, tokens, references, seoTitle, seoDescription, ogImage } = body;

  if (!title?.trim()) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const post = await createPost({
    title,
    content,
    excerpt,
    prompt,
    figSvg,
    status,
    featured,
    tags,
    issueId,
    tokens,
    references,
    seoTitle,
    seoDescription,
    ogImage,
  });

  return Response.json(post, { status: 201 });
}
