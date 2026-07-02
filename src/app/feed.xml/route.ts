import { db } from "@/db";
import { fieldNotes, posts } from "@/db/schema";
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

  const [publishedPosts, publishedFieldNotes] = await Promise.all([
    db
      .select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(20),
    db
      .select()
      .from(fieldNotes)
      .where(eq(fieldNotes.status, "published"))
      .orderBy(desc(fieldNotes.publishedAt))
      .limit(20),
  ]);

  const entries = [
    ...publishedPosts.map((p) => ({
      title: p.title,
      link: `${base}/${p.slug}`,
      excerpt: p.excerpt,
      publishedAt: p.publishedAt,
    })),
    ...publishedFieldNotes.map((n) => ({
      title: n.title,
      link: `${base}/dispatches/${n.slug}`,
      excerpt: n.excerpt,
      publishedAt: n.publishedAt,
    })),
  ]
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
    .slice(0, 20);

  const items = entries
    .map((e) =>
      [
        `  <item>`,
        `    <title>${escapeXml(e.title)}</title>`,
        `    <link>${e.link}</link>`,
        `    <guid isPermaLink="true">${e.link}</guid>`,
        e.excerpt ? `    <description>${escapeXml(e.excerpt)}</description>` : "",
        e.publishedAt
          ? `    <pubDate>${new Date(e.publishedAt).toUTCString()}</pubDate>`
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
