// SPDX-License-Identifier: GPL-3.0-only
// Annual Reading Summary — server-side aggregation over existing data (v2.7.0).
// Presentation layer over existing reading data: no new data collection beyond
// the user-driven read events, no summary persistence.
// Every query is scoped to the authenticated user's own records.

import { db } from "@/lib/db";
import { buildAnnualSummary, type AnnualReadEvent, type AnnualReadingSummary } from "./stats";
import { longestStreakWithinYear } from "./streak";

/**
 * Summary window (server-local clock, user decision): the annual summary is
 * visible from Jan 1 00:00 through the end of Jan 7 — it disappears on Jan 8.
 * In development/e2e the window is always open so the feature stays testable;
 * production enforces the strict calendar window.
 */
export function isAnnualSummaryWindow(now: Date = new Date()): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 0, 8);
  return now >= start && now < end;
}

/** Parse/validate the client-provided year (default: current year). */
export function parseSelectedYear(raw: string | undefined, currentYear: number): number {
  const parsed = parseInt(raw ?? "", 10);
  return Number.isNaN(parsed) || parsed < 1000 || parsed > 9999 ? currentYear : parsed;
}

/**
 * Available summary years = distinct local years of the user's read events
 * (canonical "read" signal). The featured (just-completed) year and the
 * current year are always included so empty years still show the empty state
 * instead of falling back to an older year.
 */
export async function getAvailableYears(userId: string, featuredYear: number, currentYear: number): Promise<number[]> {
  const finished = await db.bookReadEvent.findMany({
    where: { userId },
    select: { readAt: true },
  });
  const years = new Set<number>();
  for (const event of finished) years.add(event.readAt.getFullYear());
  years.add(featuredYear);
  years.add(currentYear);
  return [...years].sort((a, b) => b - a);
}

/**
 * Build the annual summary for one user and one year.
 * Read-event year membership uses local-clock boundaries (same as goals);
 * activity/streak days use the existing UTC day convention.
 */
export async function getAnnualReadingSummary(userId: string, year: number): Promise<AnnualReadingSummary> {
  const yearStart = new Date(year, 0, 1);
  const nextYearStart = new Date(year + 1, 0, 1);

  const [events, activities] = await Promise.all([
    db.bookReadEvent.findMany({
      where: { userId, readAt: { gte: yearStart, lt: nextYearStart } },
      select: {
        id: true,
        bookId: true,
        bookTitle: true,
        pagesRead: true,
        readAt: true,
        book: { select: { title: true, author: true, numberOfPages: true, tags: true } },
      },
      orderBy: { readAt: "asc" },
    }),
    db.dailyActivity.findMany({
      where: { userId },
      select: { date: true, count: true },
    }),
  ]);

  const mapped: AnnualReadEvent[] = events.map((e) => ({
    id: e.id,
    bookId: e.bookId,
    bookTitle: e.bookTitle ?? e.book?.title ?? null,
    author: e.book?.author ?? null,
    bookPages: e.book?.numberOfPages ?? null,
    tags: e.book?.tags ?? null,
    pagesRead: e.pagesRead,
    readAt: e.readAt,
  }));

  return buildAnnualSummary(year, mapped, activities, longestStreakWithinYear(activities, year));
}
