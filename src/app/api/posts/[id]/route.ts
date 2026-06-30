import { requireAdmin } from "@/lib/auth";
import { getPostById, updatePost, deletePost } from "@/services/posts";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await getPostById(Number(id));
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
  const { title, content, excerpt, prompt, figSvg, status, featured, slug, tags, issueId, tokens, references, seoTitle, seoDescription, ogImage } = body;

  const updated = await updatePost(Number(id), {
    title,
    content,
    excerpt,
    prompt,
    figSvg,
    status,
    featured,
    slug,
    tags,
    issueId,
    tokens,
    references,
    seoTitle,
    seoDescription,
    ogImage,
  });

  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  await deletePost(Number(id));
  return new Response(null, { status: 204 });
}
