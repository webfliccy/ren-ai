import SubscribeForm from "@/components/SubscribeForm";
import { ToolCard } from "@/components/ToolCard";
import { SidebarPost } from "@/components/SidebarPost";
import { SidebarFieldNote } from "@/components/SidebarFieldNote";
import { DispatchCard } from "@/components/DispatchCard";
import { FieldNoteCard } from "@/components/FieldNoteCard";
import { Kicker } from "@/components/ui/Kicker";
import { Byline, BylineDot, BylineWho, BylineBadge } from "@/components/ui/Byline";
import { SpecCard } from "@/components/ui/SpecCard";
import { SpecRow } from "@/components/ui/SpecRow";
import { getPublishedPosts, getPostsByIssue } from "@/services/posts";
import { db } from "@/db";
import { issues, tools, fieldNotes } from "@/db/schema";
import type { Issue, Post, Tool } from "@/db/schema";
import { formatDate, padCount } from "@/lib/formatters";
import { firstTag, parseTags } from "@/lib/tags";
import { refCount } from "@/lib/references";
import { PLACEHOLDER_SIDEBAR, PLACEHOLDER_DISPATCHES, PLACEHOLDER_TOOLS } from "@/app/_placeholder";
import { and, asc, desc, eq } from "drizzle-orm";
import Link from "next/link";

export const metadata = {
  title: "The RenAIssance Fan — Adventures in Artificial Intelligence",
  description:
    "Fallibly human dispatches from the edge of artificial intelligence. Essays, tools, and an honest ledger.",
};

export default async function Home() {
  const [currentIssue]: (Issue | undefined)[] = await db
    .select()
    .from(issues)
    .where(eq(issues.status, "published"))
    .orderBy(desc(issues.number))
    .limit(1);

  const [allPosts, issueTools, latestNotes] = await Promise.all([
    currentIssue
      ? getPostsByIssue(currentIssue.id)
      : getPublishedPosts({ limit: 7 }),
    currentIssue
      ? db
          .select()
          .from(tools)
          .where(and(eq(tools.issueId, currentIssue.id), eq(tools.status, "published")))
          .orderBy(asc(tools.sortOrder), asc(tools.createdAt))
      : Promise.resolve([] as Tool[]),
    currentIssue
      ? db
          .select()
          .from(fieldNotes)
          .where(and(eq(fieldNotes.issueId, currentIssue.id), eq(fieldNotes.status, "published")))
          .orderBy(desc(fieldNotes.publishedAt))
      : db
          .select()
          .from(fieldNotes)
          .where(eq(fieldNotes.status, "published"))
          .orderBy(desc(fieldNotes.publishedAt))
          .limit(3),
  ]);

  const lead: Post | null = allPosts[0] ?? null;
  const sidebarPosts = allPosts.slice(1, 4);
  const dispatchPosts =
    allPosts.length > 4 ? allPosts.slice(4, 7) : allPosts.slice(1, 4);

  return (
    <>
      {/* ════════ LEAD / HERO ════════ */}
      <section className="grid grid-cols-[1.35fr_1fr] gap-0 max-tablet:grid-cols-1" data-screen-label="Lead feature">
        <div className="border-r border-rule py-8 pr-10 max-tablet:border-r-0 max-tablet:border-b max-tablet:border-rule max-tablet:px-0 max-tablet:py-6">
          <div className="mb-5 inline-block">
            <Kicker
              inline
              tag={lead?.featured ? "Feature Story" : "Lead Dispatch"}
              crumb={
                lead
                  ? `${firstTag(lead.tags) || "ESSAY"} № 01 — ${lead.title.toUpperCase().slice(0, 30)}`
                  : "ESSAY № 01 — ON CREDIT & THEFT"
              }
            />
          </div>

          {lead ? (
            <h2 className="mb-5 text-balance font-cormorant text-[64px] font-semibold leading-[0.98] tracking-[-0.018em] max-tablet:text-[42px]">
              <Link className="no-underline hover:text-accent" href={`/${lead.slug}`}>{lead.title}</Link>
            </h2>
          ) : (
            <h2 className="mb-5 text-balance font-cormorant text-[64px] font-semibold leading-[0.98] tracking-[-0.018em] max-tablet:text-[42px]">
              On the Shoulders of Scraped Giants
            </h2>
          )}

          <p className="mb-6 text-pretty font-newsreader text-xl italic leading-[1.5] text-ink-light">
            {lead?.excerpt ??
              "In defence of the footnote — a small, stubborn act of remembering who said it first, written with the help of a machine that, left alone, would remember no one at all."}
          </p>

          {lead?.figSvg && (
            <figure className="mb-6 border-[1.5px] border-ink bg-paper shadow-paper">
              <div
                className="flex justify-center bg-texture-graph p-4"
                dangerouslySetInnerHTML={{ __html: lead.figSvg }}
              />
              <figcaption className="flex items-baseline gap-2.5 border-t border-ink px-3.5 py-2 font-courier text-[10px] text-ink-light">
                <span className="whitespace-nowrap font-bold tracking-1 text-accent">FIG. 1</span>
              </figcaption>
            </figure>
          )}

          <Byline variant="lead">
            <BylineWho>By the Editor</BylineWho>
            <BylineBadge size="sm">Verified Flesh</BylineBadge>
            <BylineDot />
            <span>Assisted, suspiciously, by a machine</span>
            <BylineDot />
            <span>{lead ? formatDate(lead.publishedAt) : "19 June 2026"}</span>
            <BylineDot />
            <span>{lead ? `${lead.readingTime} min read` : "11 min read"}</span>
          </Byline>

          {lead && (
            <Link
              className="group mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-accent no-underline"
              href={`/${lead.slug}`}
            >
              Read the dispatch{" "}
              <span className="inline-block transition-transform duration-150 ease-out group-hover:translate-x-1">→</span>
            </Link>
          )}
        </div>

        {/* ── ASIDE ── */}
        <aside className="py-8 pl-10 max-tablet:px-0 max-tablet:py-6">
          <div className="mb-[26px]">
            <SpecCard title="Spec Sheet" fig="FIG. 0 — PROVENANCE" compact>
              <SpecRow keyWidth={92} compact label="Author" value={<>Human <span className="text-accent">(mostly)</span></>} />
              <SpecRow keyWidth={92} compact label="Model" value="Claude Sonnet 4.6" />
              <SpecRow
                keyWidth={92}
                compact
                label="Tokens"
                value={lead?.tokens ?? <span className="text-muted">—</span>}
              />
              <SpecRow
                keyWidth={92}
                compact
                label="Sources"
                value={
                  lead
                    ? (() => {
                        const n = refCount(lead.references);
                        return n > 0
                          ? <>{n} <span className="text-accent">(all cited)</span></>
                          : <span className="text-muted">—</span>;
                      })()
                    : <span className="text-muted">—</span>
                }
              />
              <SpecRow keyWidth={92} compact label="Scale" value="1:1, honest" borderBottom={false} />
            </SpecCard>
          </div>

          <div className="mb-1 flex items-center gap-2.5">
            <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.18em] opacity-65">
              Also in this issue
            </span>
            <span className="h-px flex-1 bg-rule" />
          </div>

          {sidebarPosts.length > 0
            ? sidebarPosts.map((post, i) => (
                <SidebarPost
                  key={post.id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt ?? undefined}
                  readingTime={post.readingTime}
                  index={i}
                />
              ))
            : PLACEHOLDER_SIDEBAR.map((item) => (
                <div key={item.num} className="border-b border-dashed border-border py-4 last:border-b-0">
                  <span className="font-courier text-[11px] font-bold text-accent">{item.num}</span>
                  <h4 className="mt-1 mb-1.5 font-cormorant text-2xl font-semibold leading-[1.08]">
                    <a className="no-underline hover:text-accent" href="#">{item.title}</a>
                  </h4>
                  <p className="text-[13px] leading-[1.5] text-ink-light">{item.excerpt}</p>
                  <div className="mt-2 font-courier text-[9.5px] tracking-[0.04em] text-muted">{item.meta}</div>
                </div>
              ))}
          {latestNotes.map((note, i) => (
            <SidebarFieldNote
              key={note.id}
              note={note}
              num={padCount(sidebarPosts.length + i + 2)}
            />
          ))}
        </aside>
      </section>

      {/* ════════ TOOLS & CONTRAPTIONS ════════ */}
      <section id="tools" data-screen-label="Tools">
        <div className="mt-14 mb-7 flex items-baseline gap-4 border-t-[3px] border-ink pt-3.5">
          <h3 className="whitespace-nowrap font-cormorant text-[30px] font-semibold">Tools &amp; Contraptions</h3>
          <span className="font-newsreader text-[13px] italic text-ink-light">
            small machines that make the big machine behave
          </span>
          <span className="ml-auto whitespace-nowrap font-courier text-[10px] uppercase tracking-1 text-muted">
            {issueTools.length > 0
              ? `${padCount(issueTools.length)} IN THE WORKSHOP`
              : "03 IN THE WORKSHOP"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-6 max-tablet:grid-cols-1">
          {issueTools.length > 0
            ? issueTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)
            : PLACEHOLDER_TOOLS.map((p) => (
                <a
                  key={p.title}
                  className="group hover-lift flex flex-col border-[1.5px] border-ink bg-paper no-underline shadow-paper"
                  href="#"
                >
                  <div className="flex items-center justify-between bg-ink px-3.5 py-2 text-parchment">
                    <span className="font-courier text-[9.5px] font-bold uppercase tracking-3">{p.title}</span>
                    <span className="font-courier text-[8.5px] tracking-1 opacity-65">{p.version}</span>
                  </div>
                  <div
                    className="flex justify-center border-b border-ink bg-texture-graph p-6"
                    dangerouslySetInnerHTML={{ __html: p.svgContent }}
                  />
                  <div className="flex flex-1 flex-col px-4 pt-4 pb-5">
                    <h4 className="mb-2 font-cormorant text-[26px] font-semibold leading-[1.05]">{p.title}</h4>
                    <p className="mb-4 text-[13.5px] leading-[1.55] text-ink-light">{p.description}</p>
                    <span className="mt-auto inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-accent">
                      Open the tool{" "}
                      <span className="inline-block transition-transform duration-150 ease-out group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </a>
              ))}
        </div>
      </section>

      {/* ════════ SIGN UP ════════ */}
      <section
        className="mt-14 border-[3px] border-ink bg-paper p-10 text-center shadow-[4px_5px_0_rgba(58,46,28,0.08)]"
        data-screen-label="Subscribe"
      >
        <div className="mb-3 text-[10px] font-bold uppercase tracking-4 text-accent">The Standing Invitation</div>
        <SubscribeForm
          formClass="mx-auto flex max-w-[460px] gap-2.5 max-tablet:flex-col"
          inputClass="flex-1 border-[1.5px] border-ink bg-parchment px-3.5 py-3 font-courier text-[13px] text-ink outline-none placeholder:text-muted"
          buttonClass="cursor-pointer border-[1.5px] border-accent bg-accent px-6 py-3 font-figtree text-[11px] font-bold uppercase tracking-2 text-white transition-transform duration-100 ease-out hover:-translate-y-px"
        />
        <div className="mt-3.5 font-courier text-[9px] tracking-[0.04em] text-muted">
          No tracking pixels. No model trained on your inbox. Just letters.
        </div>
      </section>
    </>
  );
}
