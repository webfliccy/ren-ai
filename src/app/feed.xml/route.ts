import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const published = await db
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt))
    .limit(20);

  const items = published
    .map((p) =>
      [
        `  <item>`,
        `    <title>${escapeXml(p.title)}</title>`,
        `    <link>${base}/${p.slug}</link>`,
        `    <guid isPermaLink="true">${base}/${p.slug}</guid>`,
        p.excerpt ? `    <description>${escapeXml(p.excerpt)}</description>` : "",
        p.publishedAt
          ? `    <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>`
          : "",
        `  </item>`,
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ren·ai</title>
    <link>${base}</link>
    <description>A blog.</description>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
