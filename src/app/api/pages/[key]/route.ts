import { db } from "@/db";
import { sitePages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

interface Props {
  params: Promise<{ key: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  const { key } = await params;
  const [page] = await db
    .select()
    .from(sitePages)
    .where(eq(sitePages.key, key));
  if (!page) return Response.json({ key, title: "", content: "" });
  return Response.json(page);
}

export async function PUT(request: NextRequest, { params }: Props) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { key } = await params;
  const { title, content, tokens, prompt } = await request.json();

  const [existing] = await db
    .select()
    .from(sitePages)
    .where(eq(sitePages.key, key));

  if (existing) {
    const [updated] = await db
      .update(sitePages)
      .set({
        title,
        content,
        tokens: tokens || null,
        prompt: prompt || null,
        updatedAt: new Date(),
      })
      .where(eq(sitePages.key, key))
      .returning();
    return Response.json(updated);
  }

  const [created] = await db
    .insert(sitePages)
    .values({
      key,
      title,
      content,
      tokens: tokens || null,
      prompt: prompt || null,
    })
    .returning();
  return Response.json(created, { status: 201 });
}
