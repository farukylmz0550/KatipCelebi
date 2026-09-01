// Tags — legacy src/books/tags.py port.

export const MAX_SUBJECT_TAGS = 6;
export const STARTER_TAGS = [
  "fiction", "short stories", "poetry", "history", "biography", "philosophy",
  "science", "science fiction", "fantasy", "detective and mystery stories",
  "juvenile fiction", "textbooks", "reference", "religion", "art", "travel",
] as const;

export function canonical(s: string): string {
  return s.trim().toLowerCase();
}

export function display(s: string): string {
  const c = canonical(s);
  if (!c) return "";
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export function splitTags(s: string): string[] {
  return s.split(",").map(canonical).filter(Boolean);
}

export function store(tags: string[]): string {
  return tags.map(canonical).filter(Boolean).join(", ");
}

export function show(tagsCsv: string): string {
  return splitTags(tagsCsv).map(display).join(", ");
}

export function contains(tagsCsv: string, tag: string): boolean {
  return splitTags(tagsCsv).includes(canonical(tag));
}

export function suggestions(existing: string[], mine: string[]): string[] {
  const used = new Set(existing.flatMap(splitTags));
  const mineSet = new Set(mine.flatMap(splitTags));
  // Prioritize mine first, then starter
  const result: string[] = [];
  for (const t of mineSet) if (!used.has(t) && !result.includes(t)) result.push(t);
  for (const t of STARTER_TAGS) if (!used.has(t) && !result.includes(t)) result.push(t);
  return result.slice(0, 8);
}

const NOISE_WORDS = ["translations", "fictional works", "accessible book", "protected daisy", "in library", "overdrive", "large type", "reading group guide"];

export function fromSubjects(subjects: string[]): string[] {
  return subjects
    .slice(0, 15)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => !NOISE_WORDS.some((n) => s.includes(n)))
    .filter((s) => !s.includes(" / ") && !s.includes(" - "))
    .slice(0, MAX_SUBJECT_TAGS);
}
