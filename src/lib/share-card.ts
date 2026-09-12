// SPDX-License-Identifier: GPL-3.0-only
// Share-card content — pure, deterministic (same summary → same card data).
// The canvas renderer consumes this; text is never interpreted as markup.

import type { AnnualReadingSummary } from "./stats";

export type ShareCardLabels = {
  brand: string;
  cardTitle: string;
  booksRead: string;
  pagesRead: string;
  longestStreak: string;
  mostReadAuthor: string;
  mostReadGenre: string;
};

export type ShareCardStat = { label: string; value: string };

export type ShareCardData = {
  brand: string;
  title: string;
  year: number;
  stats: ShareCardStat[];
};

/**
 * Build the share-card content from a computed summary. Metrics without
 * reliable data are omitted (never rendered as fake zeros). Titles, author
 * names and genres stay plain text — the renderer must not interpret them.
 */
export function shareCardData(summary: AnnualReadingSummary, labels: ShareCardLabels): ShareCardData {
  const stats: ShareCardStat[] = [{ label: labels.booksRead, value: String(summary.booksRead) }];

  if (summary.pagesRead !== null) stats.push({ label: labels.pagesRead, value: String(summary.pagesRead) });
  if (summary.longestStreak > 0) stats.push({ label: labels.longestStreak, value: String(summary.longestStreak) });
  if (summary.topAuthor) stats.push({ label: labels.mostReadAuthor, value: summary.topAuthor });
  if (summary.topGenre) stats.push({ label: labels.mostReadGenre, value: summary.topGenre });

  return {
    brand: labels.brand,
    title: labels.cardTitle,
    year: summary.year,
    stats,
  };
}
