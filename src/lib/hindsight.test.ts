import { describe, expect, test } from "vitest";
import { formatIntervalOn } from "./hindsight";

describe("formatIntervalOn", () => {
  test("one week after publication reads 'one week on'", () => {
    const published = new Date("2026-06-25T09:00:00Z");
    const added = new Date("2026-07-02T09:00:00Z");
    expect(formatIntervalOn(published, added)).toBe("one week on");
  });

  test("counts in days below a week, spelled out", () => {
    const published = new Date("2026-06-25T09:00:00Z");
    expect(formatIntervalOn(published, new Date("2026-06-28T09:00:00Z"))).toBe("three days on");
    expect(formatIntervalOn(published, new Date("2026-06-26T09:00:00Z"))).toBe("one day on");
  });

  test("amendment on publication day reads 'later that day'", () => {
    const published = new Date("2026-06-25T09:00:00Z");
    const added = new Date("2026-06-25T20:00:00Z");
    expect(formatIntervalOn(published, added)).toBe("later that day");
  });

  test("compares calendar days, not elapsed hours — a midnight amendment date still reads a full week", () => {
    // Admin date input stores UTC midnight; publication has a time of day.
    const published = new Date("2026-06-25T09:00:00Z");
    const added = new Date("2026-07-02T00:00:00Z");
    expect(formatIntervalOn(published, added)).toBe("one week on");
  });

  test("counts in months from four weeks, years from twelve months", () => {
    const published = new Date("2026-01-01T09:00:00Z");
    expect(formatIntervalOn(published, new Date("2026-02-04T09:00:00Z"))).toBe("one month on");
    expect(formatIntervalOn(published, new Date("2026-07-06T09:00:00Z"))).toBe("six months on");
    expect(formatIntervalOn(published, new Date("2027-01-02T09:00:00Z"))).toBe("one year on");
    expect(formatIntervalOn(published, new Date("2028-03-01T09:00:00Z"))).toBe("two years on");
  });
});
