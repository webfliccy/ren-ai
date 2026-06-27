export type ChicagoWebRef = {
  authorLast: string;
  authorFirst: string;
  pageTitle: string;
  siteName: string;
  date: string;
  url: string;
};

export const EMPTY_REF: ChicagoWebRef = {
  authorLast: "",
  authorFirst: "",
  pageTitle: "",
  siteName: "",
  date: "",
  url: "",
};

export function refCount(refsJson: string): number {
  try {
    const arr = JSON.parse(refsJson);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export function parseRefs(raw: string): ChicagoWebRef[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      if (typeof item === "string") {
        return { ...EMPTY_REF, pageTitle: item };
      }
      return { ...EMPTY_REF, ...item } as ChicagoWebRef;
    });
  } catch {
    return [];
  }
}
