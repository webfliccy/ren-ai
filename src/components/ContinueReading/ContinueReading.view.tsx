import Link from "next/link";

export type ContinueReadingItem = {
  kind: "post" | "fieldNote";
  id: number;
  slug: string;
  title: string;
  readingTime?: number;
  outcomeStatus?: string | null;
};

export type ContinueReadingProps = {
  items: ContinueReadingItem[];
  issueNumber: number;
};

function itemHref(item: ContinueReadingItem): string {
  return item.kind === "fieldNote" ? `/dispatches/${item.slug}` : `/${item.slug}`;
}

function itemMeta(item: ContinueReadingItem): string | null {
  if (item.kind === "fieldNote") {
    return item.outcomeStatus
      ? `FIELD NOTE · ${item.outcomeStatus.toUpperCase()}`
      : "FIELD NOTE";
  }
  return item.readingTime && item.readingTime > 0
    ? `DISPATCH · ${item.readingTime} MIN`
    : null;
}

export function ContinueReadingView({ items, issueNumber }: ContinueReadingProps) {
  return (
    <section className="mx-auto mt-14 max-w-[720px] pt-1" aria-label="Also in this issue">
      <div className="mb-2 flex items-center gap-3.5">
        <h2 className="whitespace-nowrap font-cormorant text-[26px] font-semibold text-ink">
          Also in Issue No. {issueNumber}
        </h2>
        <div className="h-px flex-1 bg-rule" />
      </div>
      {items.map((item) => {
        const meta = itemMeta(item);
        return (
          <div
            key={`${item.kind}-${item.id}`}
            className="border-b border-dashed border-border py-4 last:border-b-0"
          >
            <h4 className="font-cormorant text-lg font-semibold leading-[1.15]">
              <Link className="no-underline hover:text-accent" href={itemHref(item)}>
                {item.title}
              </Link>
            </h4>
            {meta && (
              <div className="mt-2 font-courier text-[9.5px] tracking-[0.04em] text-muted">
                {meta}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
