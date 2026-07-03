import DOMPurify from "isomorphic-dompurify";

// Sanitizes admin-authored SVG markup (article/tool illustrations) before
// it's injected via dangerouslySetInnerHTML. `foreignObject` is explicitly
// blocked because it lets SVG embed arbitrary foreign markup (e.g. HTML),
// which sidesteps the svg-only tag allowlist.
export function sanitizeSvg(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["foreignObject"],
  });
}
