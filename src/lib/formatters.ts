export function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function padCount(n: number): string {
  return String(n).padStart(2, "0");
}

export function toDateInputValue(ts: Date | null | undefined): string {
  if (!ts) return "";
  return new Date(ts).toISOString().slice(0, 10);
}
