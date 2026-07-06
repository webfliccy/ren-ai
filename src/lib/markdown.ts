import { Marked } from "marked";
import markedKatex from "marked-katex-extension";
import DOMPurify from "isomorphic-dompurify";

// Dedicated Marked instance so the KaTeX extension stays isolated from the
// editor's global `marked` import (which round-trips content and must not
// rewrite `$…$` into rendered HTML).
const md = new Marked();

md.use(
  markedKatex({
    // Render bad LaTeX as an inline error span instead of throwing, so a
    // single malformed equation never takes down a whole page render.
    throwOnError: false,
  }),
);

// Renders post markdown to HTML, with `$…$` (inline) and `$$…$$` (block)
// LaTeX rendered to static KaTeX markup at build/request time — no client JS.
//
// Marked passes raw HTML embedded in the markdown source straight through,
// so output is untrusted until sanitized. DOMPurify strips scripts, event
// handlers, and other injection vectors while keeping the HTML/SVG/MathML
// markup KaTeX needs to render equations.
export function renderMarkdown(markdown: string): string {
  const html = md.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
  });
}
