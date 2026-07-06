import { db } from "@/db";
import { sitePages } from "@/db/schema";
import { MarkdownHtml } from "@/components/MarkdownHtml";
import { Kicker } from "@/components/ui/Kicker";
import { SpecCard } from "@/components/ui/SpecCard";
import { SpecRow } from "@/components/ui/SpecRow";
import { eq } from "drizzle-orm";
import "katex/dist/katex.min.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "About the Fan — The RenAIssance Fan",
  description: "About the editor behind The RenAIssance Fan.",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AboutPage() {
  const [page] = await db
    .select()
    .from(sitePages)
    .where(eq(sitePages.key, "about"));

  const title = page?.title || "About the Fan";
  const content = page?.content ?? "";
  const updatedDate = page?.updatedAt
    ? formatDate(new Date(page.updatedAt))
    : null;

  const specRows: { label: string; value: ReactNode; full?: boolean }[] = [
    { label: "Author", value: "The Editor, human" },
    { label: "Assisted by", value: "Claude Sonnet 4.6" },
    {
      label: "Model ver.",
      value: <span className="text-accent">claude-sonnet-4-6</span>,
    },
    {
      label: "Tokens",
      value: page?.tokens ? page.tokens : <span className="text-muted">—</span>,
    },
    {
      label: "Last revised",
      value: updatedDate ?? <span className="text-muted">—</span>,
    },
    { label: "Purpose", value: "Self-portrait, in ink" },
  ];
  if (page?.prompt)
    specRows.push({ label: "Prompt", value: page.prompt, full: true });

  return (
    <>
      <article className="mx-auto mt-12 max-w-[740px]">
        <div className="mb-[22px]">
          <Kicker tag="About" crumb="THE FAN — WHO IS BEHIND THIS" />
        </div>

        <h1 className="mb-5 font-cormorant text-[60px] leading-[1.02] font-semibold tracking-[-0.015em] text-balance text-ink max-mobile:text-[40px]">
          {title}
        </h1>

        {content ? (
          <MarkdownHtml className="prose" markdown={content} />
        ) : (
          <div className="prose">
            <p>
              This page is yet to be written. The editor is presumably composing
              themselves.
            </p>
          </div>
        )}

        <section className="mt-14" aria-label="Page provenance">
          <SpecCard
            title="Production Record — Specification Sheet"
            fig="FIG. 1-A"
          >
            <div className="grid grid-cols-2 max-mobile:grid-cols-1">
              {specRows.map((row, i) => (
                <SpecRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  colSpanFull={row.full}
                  borderRight={!row.full && i % 2 === 0}
                />
              ))}
            </div>
          </SpecCard>
        </section>
      </article>
    </>
  );
}
