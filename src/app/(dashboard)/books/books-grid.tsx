"use client";

import { useMemo, useState } from "react";
import { BookCard } from "./book-card";
import { FilterBar } from "./filter-bar";
import { Filters, defaultFilters, allows, arrange } from "@/lib/books/filters";
import { BookRow } from "./book-row";

type Book = {
  id: string;
  title: string;
  author?: string | null;
  isbn?: string | null;
  publishers?: string | null;
  tags?: string | null;
  rating?: number | null;
  signed?: boolean | null;
  status?: string | null;
  publishDate?: string | null;
  coverUrl?: string | null;
};

export function BooksGrid({ books, lentMap, dict }: { books: Book[]; lentMap: Record<string, boolean>; dict: { empty: string; noResults?: string } & Record<string, string> }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const tagsInUse = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.tags) b.tags.split(",").forEach((t) => set.add(t.trim()));
    });
    return Array.from(set).filter(Boolean).sort();
  }, [books]);

  const filtered = useMemo(() => {
    const map = new Map(Object.entries(lentMap));
    return arrange(books as never, filters, map as never);
  }, [books, filters, lentMap]);

  // Derive counts
  const total = books.length;
  const shown = filtered.length;

  return (
    <div className="space-y-4">
      <FilterBar onChange={setFilters} tagsInUse={tagsInUse} />
      <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
        <span>{shown} / {total} {shown === total ? "" : "filtered"}</span>
        {filtered.length === 0 && total > 0 && <span>{dict.noResults ?? "No results"}</span>}
      </div>
      {filtered.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400">{total === 0 ? dict.empty : (dict.noResults ?? "No results — try clearing filters")}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book as Book} lentOut={!!lentMap[book.id]} />
            ))}
          </div>
          <ul className="space-y-2 pt-4">
            {filtered.map((book) => (
              <BookRow key={`row-${book.id}`} book={book as never} dict={dict as never} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
