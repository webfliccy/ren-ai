import SubscribeForm from "@/components/SubscribeForm";
import { SidebarPost } from "@/components/SidebarPost";
import { DispatchCard } from "@/components/DispatchCard";
import { ToolCard } from "@/components/ToolCard";
import { Kicker } from "@/components/ui/Kicker";
import {
  Byline,
  BylineDot,
  BylineWho,
  BylineBadge,
} from "@/components/ui/Byline";
import { SpecCard } from "@/components/ui/SpecCard";
import { SpecRow } from "@/components/ui/SpecRow";
import { getPostsByIssue } from "@/services/posts";
import { db } from "@/db";
import { issues, tools } from "@/db/schema";
import type { Post } from "@/db/schema";
import { formatDate, padCount } from "@/lib/formatters";
import { firstTag } from "@/lib/tags";
import { refCount } from "@/lib/references";
import { SanitizedSvg } from "@/components/SanitizedSvg";
import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ number: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { number } = await params;
  const [issue] = await db
    .select()
    .from(issues)
    .where(
      and(eq(issues.number, Number(number)), eq(issues.status, "published")),
    );
  if (!issue) return {};
  return {
    title: `Issue № ${issue.number} — ${issue.title} · The RenAIssance Fan`,
    description: issue.description ?? undefined,
  };
}

export default async function IssuePage({ params }: Props) {
  const { number } = await params;
  const [issue] = await db
    .select()
    .from(issues)
    .where(
      and(eq(issues.number, Number(number)), eq(issues.status, "published")),
    );

  if (!issue) notFound();

  const [issuePosts, issueTools] = await Promise.all([
    getPostsByIssue(issue.id),
    db
      .select()
      .from(tools)
      .where(and(eq(tools.issueId, issue.id), eq(tools.status, "published")))
      .orderBy(asc(tools.sortOrder), asc(tools.createdAt)),
  ]);

  const lead: Post | null = issuePosts[0] ?? null;
  const sidebarPosts = issuePosts.slice(1, 4);
  const dispatchPosts =
    issuePosts.length > 4 ? issuePosts.slice(4, 7) : issuePosts.slice(1, 4);

  return (
    <>
      {/* ════════ LEAD / HERO ════════ */}
      {lead && (
        <section
          className="grid grid-cols-[1.35fr_1fr] gap-0 max-tablet:grid-cols-1"
          data-screen-label="Lead feature"
        >
          <div className="border-r border-rule py-8 pr-10 max-tablet:border-r-0 max-tablet:border-b max-tablet:border-rule max-tablet:px-0 max-tablet:py-6">
            <div className="mb-5 inline-block">
              <Kicker
                inline
                tag="Lead Dispatch"
                crumb={`${firstTag(lead.tags) || "ESSAY"} № 01 — ${lead.title.toUpperCase().slice(0, 30)}`}
              />
            </div>

            <h2 className="mb-5 font-cormorant text-[64px] leading-[0.98] font-semibold tracking-[-0.018em] text-balance max-tablet:text-[42px]">
              <Link
                className="no-underline hover:text-accent"
                href={`/${lead.slug}`}
              >
                {lead.title}
              </Link>
            </h2>

            <p className="mb-6 font-newsreader text-xl leading-[1.5] text-pretty text-ink-light italic">
              {lead.excerpt ?? ""}
            </p>

            {lead.figSvg && (
              <figure className="mb-6 border-[1.5px] border-ink bg-paper shadow-paper">
                <SanitizedSvg
                  className="flex justify-center bg-texture-graph p-4"
                  svg={lead.figSvg}
                />
                <figcaption className="flex items-baseline gap-2.5 border-t border-ink px-3.5 py-2 font-courier text-[10px] text-ink-light">
                  <span className="font-bold tracking-1 whitespace-nowrap text-accent">
                    FIG. 1
                  </span>
                </figcaption>
              </figure>
            )}

            <Byline variant="lead">
              <BylineWho>By the Editor</BylineWho>
              <BylineBadge size="sm">Verified Flesh</BylineBadge>
              <BylineDot />
              <span>Assisted, suspiciously, by a machine</span>
              <BylineDot />
              <span>{formatDate(lead.publishedAt)}</span>
              <BylineDot />
              <span>{lead.readingTime} min read</span>
            </Byline>

            <Link
              className="group mt-5 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-accent uppercase no-underline"
              href={`/${lead.slug}`}
            >
              Read the dispatch{" "}
              <span className="inline-block transition-transform duration-150 ease-out group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <aside className="py-8 pl-10 max-tablet:px-0 max-tablet:py-6">
            <div className="mb-[26px]">
              <SpecCard title="Spec Sheet" fig="FIG. 0 — PROVENANCE" compact>
                <SpecRow
                  keyWidth={92}
                  compact
                  label="Author"
                  value={
                    <>
                      Human <span className="text-accent">(mostly)</span>
                    </>
                  }
                />
                <SpecRow
                  keyWidth={92}
                  compact
                  label="Model"
                  value="Claude Sonnet 4.6"
                />
                <SpecRow
                  keyWidth={92}
                  compact
                  label="Tokens"
                  value={lead.tokens ?? <span className="text-muted">—</span>}
                />
                <SpecRow
                  keyWidth={92}
                  compact
                  label="Sources"
                  value={(() => {
                    const n = refCount(lead.references);
                    return n > 0 ? (
                      <>
                        {n} <span className="text-accent">(all cited)</span>
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    );
                  })()}
                />
                <SpecRow
                  keyWidth={92}
                  compact
                  label="Scale"
                  value="1:1, honest"
                  borderBottom={false}
                />
              </SpecCard>
            </div>

            {sidebarPosts.length > 0 && (
              <>
                <div className="mb-1 flex items-center gap-2.5">
                  <span className="text-[10px] font-bold tracking-[0.18em] whitespace-nowrap uppercase opacity-65">
                    Also in this issue
                  </span>
                  <span className="h-px flex-1 bg-rule" />
                </div>
                {sidebarPosts.map((post, i) => (
                  <SidebarPost
                    key={post.id}
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt ?? undefined}
                    readingTime={post.readingTime}
                    index={i}
                  />
                ))}
              </>
            )}
          </aside>
        </section>
      )}

      {/* ════════ DISPATCHES ROW ════════ */}
      {dispatchPosts.length > 0 && (
        <section data-screen-label="Dispatches">
          <div className="mt-14 mb-7 flex items-baseline gap-4 border-t-[3px] border-ink pt-3.5 max-mobile:flex-col max-mobile:items-start max-mobile:gap-1.5">
            <h3 className="font-cormorant text-[30px] font-semibold whitespace-nowrap">
              Dispatches
            </h3>
            <span className="font-newsreader text-[13px] text-ink-light italic">
              essays, arguments, and the occasional confession
            </span>
            <span className="ml-auto font-courier text-[10px] tracking-1 whitespace-nowrap text-muted uppercase max-mobile:ml-0">
              {padCount(issuePosts.length)} / ISSUE {padCount(issue.number)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-0 max-tablet:grid-cols-1 max-tablet:gap-6">
            {dispatchPosts.map((post) => (
              <DispatchCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ════════ TOOLS & CONTRAPTIONS ════════ */}
      {issueTools.length > 0 && (
        <section id="tools" data-screen-label="Tools">
          <div className="mt-14 mb-7 flex items-baseline gap-4 border-t-[3px] border-ink pt-3.5 max-mobile:flex-col max-mobile:items-start max-mobile:gap-1.5">
            <h3 className="font-cormorant text-[30px] font-semibold whitespace-nowrap">
              Tools &amp; Contraptions
            </h3>
            <span className="font-newsreader text-[13px] text-ink-light italic">
              small machines that make the big machine behave
            </span>
            <span className="ml-auto font-courier text-[10px] tracking-1 whitespace-nowrap text-muted uppercase max-mobile:ml-0">
              {padCount(issueTools.length)} IN THE WORKSHOP
            </span>
          </div>
          <div className="grid grid-cols-3 gap-6 max-tablet:grid-cols-1">
            {issueTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* ════════ SIGN UP ════════ */}
      <section
        className="mt-14 border-[3px] border-ink bg-paper p-10 text-center shadow-[4px_5px_0_rgba(58,46,28,0.08)]"
        data-screen-label="Subscribe"
      >
        <div className="mb-3 text-[10px] font-bold tracking-4 text-accent uppercase">
          The Standing Invitation
        </div>
        <SubscribeForm
          formClass="mx-auto flex max-w-[460px] gap-2.5 max-tablet:flex-col"
          inputClass="flex-1 rounded-sm border-[1.5px] border-ink bg-parchment px-3.5 py-3 font-courier text-[13px] text-ink outline-none placeholder:text-muted"
          buttonClass="cursor-pointer rounded-sm border-[1.5px] border-accent bg-accent px-6 py-3 font-figtree text-[11px] font-bold uppercase tracking-2 text-white transition-transform duration-100 ease-out hover:-translate-y-px"
        />
        <div className="mt-3.5 font-courier text-[9px] tracking-[0.04em] text-muted">
          No tracking pixels. No model trained on your inbox. Just letters.
        </div>
      </section>
    </>
  );
}
