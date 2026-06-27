export function parseTags(raw: string): string[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function firstTag(tagsJson: string): string {
  try {
    const tags = JSON.parse(tagsJson);
    return Array.isArray(tags) && tags[0] ? String(tags[0]) : "";
  } catch {
    return "";
  }
}
