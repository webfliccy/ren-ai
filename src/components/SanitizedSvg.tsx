import { sanitizeSvg } from "@/lib/sanitize";

// The sanctioned sink for rendering stored SVG markup (article figures, tool
// illustrations). Sanitizes with DOMPurify before injecting; react/no-danger
// is disabled for this file only in eslint.config.mjs. Render SVG through
// this component — never call dangerouslySetInnerHTML directly.
export function SanitizedSvg({
  svg,
  className,
}: {
  svg: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeSvg(svg) }}
    />
  );
}
