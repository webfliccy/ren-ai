import CommentSection from "@/components/CommentSection";
import { ContinueReading } from "@/components/ContinueReading";
import { ReferenceCitation } from "@/components/ReferenceCitation";
import { HindsightNote } from "@/components/ui/HindsightNote";
import { Kicker } from "@/components/ui/Kicker";
import {
  Byline,
  BylineDot,
  BylineWho,
  BylineBadge,
} from "@/components/ui/Byline";
import { SpecCard } from "@/components/ui/SpecCard";
import { SpecRow } from "@/components/ui/SpecRow";
import { RefsSection } from "@/components/ui/RefsSection";
import { getPostWithComments } from "@/services/posts";
import { getIssueById, getIssueSiblings } from "@/services/issues";
import { parseJson } from "@/lib/parse";
import { parseRefs } from "@/lib/references";
import { formatIntervalOn } from "@/lib/hindsight";
import { cache } from "react";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import { MarkdownHtml } from "@/components/MarkdownHtml";
import type { ReactNode } from "react";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const fetchPost = cache(getPostWithComments);

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await fetchPost(slug);
  if (!data) return {};

  const { post } = data;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt ?? undefined;
  const image = post.ogImage ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${base}/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchPost(slug);
  if (!data) notFound();

  const { post, comments: approvedComments } = data;
  const refs = parseRefs(post.references);
  const tags = parseJson<string[]>(post.tags, []);

  const publishedDate = post.publishedAt
    ? formatDate(new Date(post.publishedAt))
    : null;
  const kickerTag = tags[0] ?? "Dispatches";
  const kickerCrumb = post.slug.replace(/-/g, " ").toUpperCase().slice(0, 44);

  const specPrompt =
    post.prompt ??
    "Write me something true and uncomfortable about artificial intelligence. Sign the register on the way out.";

  const [issue, siblingItems] = post.issueId
    ? await Promise.all([
        getIssueById(post.issueId),
        getIssueSiblings(post.issueId, { kind: "post", id: post.id }),
      ])
    : [null, []];

  const specRows: { label: string; value: ReactNode; full?: boolean }[] = [
    { label: "Author", value: "The Editor, human" },
    { label: "Assisted by", value: "Claude Sonnet 4.6" },
    {
      label: "Model ver.",
      value: <span className="text-accent">claude-sonnet-4-6</span>,
    },
    {
      label: "Tokens",
      value: post.tokens ? post.tokens : <span className="text-muted">—</span>,
    },
    { label: "Drawn", value: publishedDate ?? "—" },
    { label: "Revision", value: "A — first honest draft" },
    { label: "Prompt", value: specPrompt, full: true },
  ];

  return (
    <>
      {/* ── Article ──────────────────────────────────── */}
      <article className="mx-auto mt-12 max-w-[740px]">
        <div className="mb-[22px]">
          <Kicker tag={kickerTag} crumb={kickerCrumb} />
        </div>

        <h1 className="mb-5 font-cormorant text-[60px] leading-[1.02] font-semibold tracking-[-0.015em] text-balance text-ink max-mobile:text-[40px]">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mb-[26px] font-newsreader text-[21px] leading-[1.5] text-pretty text-ink-light italic">
            {post.excerpt}
          </p>
        )}

        <Byline variant="full">
          <BylineWho>By the Editor</BylineWho>
          <BylineBadge>Verified Flesh</BylineBadge>
          <BylineDot />
          <span>Assisted, suspiciously, by a machine</span>
          {publishedDate && (
            <>
              <BylineDot />
              <time dateTime={post.publishedAt?.toISOString()}>
                {publishedDate}
              </time>
            </>
          )}
          {post.readingTime > 0 && (
            <>
              <BylineDot />
              <span>{post.readingTime} min read</span>
            </>
          )}
        </Byline>

        {/* ── Hindsight amendment ─────────────────── */}
        {post.hindsight && post.hindsightAddedAt && (
          <div className="mt-9">
            <HindsightNote
              markdown={post.hindsight}
              formattedDate={formatDate(new Date(post.hindsightAddedAt))}
              addedIso={post.hindsightAddedAt.toISOString()}
              interval={
                post.publishedAt
                  ? formatIntervalOn(
                      new Date(post.publishedAt),
                      new Date(post.hindsightAddedAt),
                    )
                  : null
              }
            />
          </div>
        )}

        {/* ── Prose body ──────────────────────────── */}
        <MarkdownHtml className="prose" markdown={post.content} />

        {/* ── Specification Sheet ─────────────────── */}
        <section className="mt-14" aria-label="Article provenance">
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

      {/* ── References ──────────────────────────────── */}
      {refs.length > 0 && (
        <RefsSection>
          <ol className="bib">
            {refs.map((ref, i) => (
              <li key={i}>
                <ReferenceCitation reference={ref} />
              </li>
            ))}
          </ol>
        </RefsSection>
      )}

      {/* ── Continue Reading ────────────────────────── */}
      {issue && siblingItems.length > 0 && (
        <ContinueReading items={siblingItems} issueNumber={issue.number} />
      )}

      {/* ── Comments ────────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-[720px] border-t-[3px] border-ink pt-3.5">
        <CommentSection postId={post.id} initialComments={approvedComments} />
      </section>
    </>
  );
}
