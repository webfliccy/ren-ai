const DAY_MS = 24 * 60 * 60 * 1000;

// The amendment date survives rewording but is cleared with the note itself;
// it never touches publishedAt.
export function resolveHindsight(
  input: { hindsight?: string | null; hindsightAddedAt?: string | null },
  existing?: { hindsight: string; hindsightAddedAt: Date | null },
): { hindsight: string; hindsightAddedAt: Date | null } {
  const hindsight =
    input.hindsight !== undefined
      ? (input.hindsight ?? "")
      : (existing?.hindsight ?? "");
  if (!hindsight) return { hindsight: "", hindsightAddedAt: null };

  const hindsightAddedAt = input.hindsightAddedAt
    ? new Date(input.hindsightAddedAt)
    : (existing?.hindsightAddedAt ?? new Date());
  return { hindsight, hindsightAddedAt };
}

const WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

function spell(n: number): string {
  return WORDS[n] ?? String(n);
}

function unit(n: number, noun: string): string {
  return `${spell(n)} ${noun}${n === 1 ? "" : "s"} on`;
}

// Calendar-day comparison: the amendment date comes from a date input (UTC
// midnight) while publication carries a time of day, so an elapsed-hours diff
// would undercount by a day.
function utcDayNumber(d: Date): number {
  return Math.floor(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / DAY_MS,
  );
}

/**
 * Human interval between publication and a hindsight amendment,
 * e.g. "one week on", for the module header.
 */
export function formatIntervalOn(published: Date, added: Date): string {
  const days = utcDayNumber(added) - utcDayNumber(published);
  if (days < 1) return "later that day";
  if (days < 7) return unit(days, "day");
  if (days < 28) return unit(Math.floor(days / 7), "week");
  if (days < 365) return unit(Math.max(1, Math.floor(days / 30.44)), "month");
  return unit(Math.floor(days / 365.25), "year");
}
