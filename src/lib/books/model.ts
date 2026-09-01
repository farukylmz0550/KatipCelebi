// Book model helpers — legacy src/books/model.py port.
// Single responsibility: Book identity & field parsing.

export const LOCAL_KEY_PREFIX = "local_";
export const MAX_COPIES = 999;

export function newLocalKey(): string {
  return `${LOCAL_KEY_PREFIX}${Math.random().toString(16).slice(2, 14)}`;
}

export function isLocalKey(key: string): boolean {
  return key.startsWith(LOCAL_KEY_PREFIX);
}

export function displayIsbn(key: string): string {
  return isLocalKey(key) ? "" : key;
}

export function parseCopies(value: string): number {
  const t = value.trim();
  if (t === "") return 1;
  const n = parseInt(t, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  if (n > MAX_COPIES) return MAX_COPIES;
  return n;
}

export function parseRating(value: string): number {
  const t = value.trim();
  if (t === "") return 0;
  const f = parseFloat(t);
  if (Number.isNaN(f)) return 0;
  return Math.max(0, Math.min(5, Math.floor(f)));
}

export function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[^0-9Xx]/g, "");
}

export type IsbnCheck = "OK" | "EMPTY" | "LENGTH" | "CHECKSUM10" | "CHECKSUM13";

export function checkIsbn(isbn: string): IsbnCheck {
  const c = normalizeIsbn(isbn);
  if (c.length === 0) return "EMPTY";
  if (c.length === 10) return isValidIsbn10(c) ? "OK" : "CHECKSUM10";
  if (c.length === 13) return isValidIsbn13(c) ? "OK" : "CHECKSUM13";
  return "LENGTH";
}

export function isValidIsbn10(s: string): boolean {
  const c = normalizeIsbn(s);
  if (c.length !== 10) return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const ch = c[i];
    let v: number;
    if (i === 9 && (ch === "X" || ch === "x")) v = 10;
    else {
      const d = parseInt(ch, 10);
      if (Number.isNaN(d)) return false;
      v = d;
    }
    sum += v * (10 - i);
  }
  return sum % 11 === 0;
}

export function isValidIsbn13(s: string): boolean {
  const c = normalizeIsbn(s);
  if (c.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const d = parseInt(c[i], 10);
    if (Number.isNaN(d)) return false;
    sum += i % 2 === 0 ? d : d * 3;
  }
  return sum % 10 === 0;
}
