import Link from "next/link";
import { padCount } from "@/lib/formatters";

export type SidebarPostProps = {
  title: string;
  slug: string;
  excerpt?: string;
  readingTime: number;
  index: number;
};

export function SidebarPostView({ title, slug, excerpt, readingTime, index }: SidebarPostProps) {
  return (
    <div className="border-b border-dashed border-border py-4 last:border-b-0">
      <span className="font-courier text-[11px] font-bold text-accent">{padCount(index + 2)}</span>
      <h4 className="mt-1 mb-1.5 font-cormorant text-2xl font-semibold leading-[1.08]">
        <Link className="no-underline hover:text-accent" href={`/${slug}`}>{title}</Link>
      </h4>
      {excerpt && <p className="text-[13px] leading-[1.5] text-ink-light">{excerpt}</p>}
      <div className="mt-2 font-courier text-[9.5px] tracking-[0.04em] text-muted">
        DISPATCH · {readingTime} MIN
      </div>
    </div>
  );
}
