import { renderMarkdown } from "@/lib/markdown";

// The sanctioned sink for the KaTeX markdown pipeline (lib/markdown.ts),
// which must go through an HTML string. renderMarkdown sanitizes with
// DOMPurify; react/no-danger is disabled for this file only in
// eslint.config.mjs. For markdown without math, prefer ProseMarkdown,
// which renders straight to React elements and needs no sink at all.
export function MarkdownHtml({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
}
