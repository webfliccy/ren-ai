import CommentSection from "@/components/CommentSection";
import { ReferenceCitation } from "@/components/ReferenceCitation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getPostWithComments } from "@/services/posts";
import { parseJson } from "@/lib/parse";
import { parseRefs } from "@/lib/references";
import { cache } from "react";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import { renderMarkdown } from "@/lib/markdown";
import styles from "./article.module.css";

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
  const tags = parseJson<string[]>(post.tags, []);
  const refs = parseRefs(post.references);

  const publishedDate = post.publishedAt ? formatDate(new Date(post.publishedAt)) : null;
  const kickerTag = tags[0] ?? "Dispatches";
  const kickerCrumb = post.slug.replace(/-/g, " ").toUpperCase().slice(0, 44);

  const specPrompt =
    post.prompt ??
    "Write me something true and uncomfortable about artificial intelligence. Sign the register on the way out.";

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>

        <SiteHeader activePath="/" />

        <div style={{ height: 4 }} />
        <div className={styles.ruleThin} />

        {/* ── Article ──────────────────────────────────── */}
        <article className={styles.article}>

          <div className={styles.kicker}>
            <span className={styles.kickerTag}>{kickerTag}</span>
            <span className={styles.kickerCrumb}>{kickerCrumb}</span>
          </div>

          <h1 className={styles.headline}>{post.title}</h1>

          {post.excerpt && (
            <p className={styles.deck}>{post.excerpt}</p>
          )}

          <div className={styles.byline}>
            <span className={styles.bylineWho}>By the Editor</span>
            <span className={styles.bylineFlesh}>Verified Flesh</span>
            <span className={styles.bylineDot} />
            <span>Assisted, suspiciously, by a machine</span>
            {publishedDate && (
              <>
                <span className={styles.bylineDot} />
                <time dateTime={post.publishedAt?.toISOString()}>
                  {publishedDate}
                </time>
              </>
            )}
            {post.readingTime > 0 && (
              <>
                <span className={styles.bylineDot} />
                <span>{post.readingTime} min read</span>
              </>
            )}
          </div>

          {/* ── Prose body ──────────────────────────── */}
          <div
            className={styles.prose}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />

          {/* ── Specification Sheet ─────────────────── */}
          <section className={styles.spec} aria-label="Article provenance">
            <div className={styles.specHead}>
              <span className={styles.specHeadTitle}>
                Production Record — Specification Sheet
              </span>
              <span className={styles.specHeadFig}>FIG. 1-A</span>
            </div>

            <div className={styles.specRows}>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Author</span>
                <span className={styles.specVal}>The Editor, human</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Assisted by</span>
                <span className={styles.specVal}>Claude Sonnet 4.6</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Model ver.</span>
                <span className={`${styles.specVal} ${styles.red}`}>
                  claude-sonnet-4-6
                </span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Tokens</span>
                <span className={`${styles.specVal} ${post.tokens ? "" : styles.muted}`}>
                  {post.tokens ?? "—"}
                </span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Drawn</span>
                <span className={styles.specVal}>{publishedDate ?? "—"}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specKey}>Revision</span>
                <span className={styles.specVal}>A — first honest draft</span>
              </div>
              <div className={`${styles.specRow} ${styles.specRowFull}`}>
                <span className={styles.specKey}>Prompt</span>
                <span className={styles.specVal}>{specPrompt}</span>
              </div>
            </div>
          </section>

        </article>

        {/* ── References ──────────────────────────────── */}
        {refs.length > 0 && (
          <section className={styles.refs} aria-label="References">
            <div className={styles.refsHead}>
              <h2>References</h2>
              <div className={styles.refsHeadLine} />
            </div>
            <p className={styles.refsNote}>
              Citations follow Chicago Manual of Style — Notes &amp; Bibliography (web) format.
            </p>
            <ol className={styles.bib}>
              {refs.map((ref, i) => (
                <li key={i}>
                  <ReferenceCitation reference={ref} />
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── Comments ────────────────────────────────── */}
        <section className={styles.commentsSection}>
          <CommentSection postId={post.id} initialComments={approvedComments} />
        </section>

        <SiteFooter />

      </div>
    </div>
  );
}
