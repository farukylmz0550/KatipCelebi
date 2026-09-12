// SPDX-License-Identifier: GPL-3.0-only
import { z } from "zod";

/**
 * Normalize a date-only due date input to the end of its UTC day, so a book
 * is "due" for the whole selected day and becomes overdue only after it.
 * Returns null when no due date was provided; throws for invalid/past dates.
 */
export function parseDueDate(input?: string | null): Date | null {
  if (input === undefined || input === null || input.trim() === "") return null;

  const parsed = z.string().safeParse(input);
  if (!parsed.success) throw new Error("Invalid due date");

  const date = new Date(input);
  if (isNaN(date.getTime())) throw new Error("Invalid due date");

  const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
  if (isNaN(endOfDay.getTime())) throw new Error("Invalid due date");

  if (endOfDay.getTime() <= Date.now()) throw new Error("Due date must be in the future");

  return endOfDay;
}

/** Overdue = a due date exists, it is past, and the record has not been returned. */
export function isOverdue(record: { dueDate: Date | null; returnedAt: Date | null }, now: Date = new Date()): boolean {
  if (!record.dueDate || record.returnedAt) return false;
  return record.dueDate.getTime() < now.getTime();
}

/**
 * Group overdue records by owning user → one push payload per user per run.
 * Ownership comes from the book relation stored in the database.
 */
export function groupOverdueByUser(
  records: { book: { userId: string; title: string } }[],
  maxTitles = 3,
): { userId: string; payload: { title: string; body: string } }[] {
  const byUser = new Map<string, string[]>();
  for (const record of records) {
    const list = byUser.get(record.book.userId) ?? [];
    list.push(record.book.title);
    byUser.set(record.book.userId, list);
  }

  return Array.from(byUser.entries()).map(([userId, titles]) => {
    const shown = titles.slice(0, maxTitles).map((t) => `“${t}”`);
    const rest = titles.length - shown.length;
    const list = rest > 0 ? `${shown.join(", ")} +${rest} more` : shown.join(", ");
    return {
      userId,
      payload: {
        title: "Overdue book reminder",
        body: titles.length === 1 ? `1 book is overdue: ${list}` : `${titles.length} books are overdue: ${list}`,
      },
    };
  });
}
