// Reading helpers — legacy src/books/reading.py port.

export const NOT_READ = "not_read";
export const WANT_TO_READ = "want_to_read";
export const READING = "reading";
export const READ = "read";
export const STATUSES = [NOT_READ, WANT_TO_READ, READING, READ] as const;
export const STATUS_ANY = "any";

export type ReadingStatus = typeof STATUSES[number];

export function statusOf(s: string): string {
  const t = s.trim();
  return (STATUSES as readonly string[]).includes(t) ? t : NOT_READ;
}

export function normalizeWebStatus(web: string): string {
  switch (web) {
    case "TO_READ": return WANT_TO_READ;
    case "READING": return READING;
    case "FINISHED": return READ;
    default: return statusOf(web);
  }
}

export function parseStamp(stamp: string): Date | null {
  const t = stamp.trim();
  if (!t) return null;
  // Strip tz offset if present to avoid aware/naive mismatch (legacy parse_stamp)
  const withoutTz = t.split("+")[0].split("Z")[0];
  const d = new Date(withoutTz);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function readingDays(started: string, finished: string): number | null {
  const s = parseStamp(started);
  const f = parseStamp(finished);
  if (!s || !f || f < s) return null;
  return (f.getTime() - s.getTime()) / 86400000;
}

export function formatDuration(days: number | null): string {
  if (days === null) return "unknown";
  const totalMins = Math.round(days * 1440);
  if (totalMins < 1) return "under a minute";
  const d = Math.floor(totalMins / 1440);
  const h = Math.floor((totalMins % 1440) / 60);
  const m = totalMins % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d} day${d === 1 ? "" : "s"}`);
  if (h > 0) parts.push(`${h} hour${h === 1 ? "" : "s"}`);
  if (m > 0 && parts.length < 2) parts.push(`${m} minute${m === 1 ? "" : "s"}`);
  parts.length = Math.min(parts.length, 2);
  return parts.length === 0 ? "under a minute" : parts.join(" ");
}
