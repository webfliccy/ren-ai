import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const published = await db
      .select({ slug: posts.slug, updatedAt: posts.updatedAt })
      .from(posts)
      .where(eq(posts.status, "published"));

    return [
      { url: base, lastModified: new Date() },
      ...published.map((p) => ({
        url: `${base}/${p.slug}`,
        lastModified: p.updatedAt,
      })),
    ];
  } catch {
    return [{ url: base, lastModified: new Date() }];
  }
}
