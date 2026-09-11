"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { BookCard } from "./book-card";
import { FilterBar } from "./filter-bar";
import { Filters, defaultFilters, arrange } from "@/lib/books/filters";
import { clientHasConsent } from "@/lib/cookies-client";

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

type ViewMode = "card" | "list";

function getInitialView(): ViewMode {
  if (typeof document === "undefined") return "card";
  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("view-mode="))
    ?.split("=")[1];
  if (cookie === "list" || cookie === "card") return cookie as ViewMode;
  try {
    const ls = localStorage.getItem("view-mode");
    if (ls === "list" || ls === "card") return ls as ViewMode;
  } catch {}
  return "card";
}

function setViewCookie(mode: ViewMode) {
  const hasPref = clientHasConsent("preferences");
  const maxAge = 60 * 60 * 24 * 365;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  if (hasPref || !document.cookie.includes("cookie-consent=")) {
    try {
      const raw = document.cookie.includes("cookie-consent=") ? document.cookie : "";
      const hasReject = raw.includes("preferences%22%3Afalse") || raw.includes('"preferences":false');
      if (hasReject) {
        localStorage.setItem("view-mode", mode);
        return;
      }
    } catch {}
    document.cookie = `view-mode=${mode}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  } else {
    try {
      localStorage.setItem("view-mode", mode);
    } catch {}
  }
}

export function BooksGrid({
  books,
  lentMap,
  dict,
}: {
  books: Book[];
  lentMap: Record<string, boolean>;
  dict: { empty: string; noResults?: string } & Record<string, string>;
}) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [view, setView] = useState<ViewMode>("card");
  const tagsInUse = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.tags) b.tags.split(",").forEach((t) => set.add(t.trim()));
    });
    return Array.from(set).filter(Boolean).sort();
  }, [books]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView(getInitialView());
  }, []);

  function handleViewChange(mode: ViewMode) {
    setView(mode);
    setViewCookie(mode);
  }

  const filtered = useMemo(() => {
    const map = new Map(Object.entries(lentMap));
    return arrange(books as never, filters, map as never) as unknown as Book[];
  }, [books, filters, lentMap]);

  const total = books.length;
  const shown = filtered.length;

  return (
    <div className="space-y-4">
      <FilterBar
        onChange={setFilters}
        tagsInUse={tagsInUse}
        dict={(dict as Record<string, unknown>).filter as Record<string, string>}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="font-[var(--font-sans)] text-xs text-muted-foreground">
          {shown === total ? `${total} ${dict.booksCount ?? "books"}` : `${shown} ${dict.ofTotal ?? "of"} ${total}`}
        </p>
        <div className="flex items-center rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-0.5">
          <button
            type="button"
            onClick={() => handleViewChange("card")}
            aria-label="Card view"
            aria-pressed={view === "card"}
            className={`flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
              view === "card"
                ? "bg-[var(--accent)] text-white"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleViewChange("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={`flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
              view === "list"
                ? "bg-[var(--accent)] text-white"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="mb-4 h-16 w-16 opacity-20" />
          <p className="font-[var(--font-sans)] text-sm text-muted-foreground">
            {total === 0 ? dict.empty : (dict.noResults ?? "No results — try clearing filters")}
          </p>
        </div>
      ) : view === "card" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book as Book}
              lentOut={!!lentMap[book.id]}
              statusLabels={{ toRead: dict.toRead, reading: dict.reading, finished: dict.finished }}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)]">
          <div className="hidden grid-cols-[3rem_1fr_12rem_6rem_5rem] gap-3 border-b border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 sm:grid">
            <span className="font-[var(--font-sans)] text-[10px] uppercase tracking-widest text-muted-foreground">
              {dict.cover ?? "Cover"}
            </span>
            <span className="font-[var(--font-sans)] text-[10px] uppercase tracking-widest text-muted-foreground">
              {dict.title}
            </span>
            <span className="font-[var(--font-sans)] text-[10px] uppercase tracking-widest text-muted-foreground">
              {dict.author}
            </span>
            <span className="font-[var(--font-sans)] text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              {dict.status}
            </span>
            <span className="font-[var(--font-sans)] text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              {dict.rating ?? "Rating"}
            </span>
          </div>
          {filtered.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="grid grid-cols-[3rem_1fr] sm:grid-cols-[3rem_1fr_12rem_6rem_5rem] gap-3 items-center border-b border-[var(--border)] last:border-b-0 bg-[var(--surface)] px-3 py-2.5 hover:bg-[var(--surface-elevated)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <div className="h-10 w-8 overflow-hidden rounded-[4px] bg-[var(--surface-elevated)] border border-[var(--border)] shrink-0">
                {book.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.svg" alt="" className="h-4 w-4 opacity-20" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-[var(--font-serif)] text-sm font-medium leading-tight text-foreground truncate">
                  {book.title}
                </p>
                <p className="font-[var(--font-sans)] text-xs text-muted-foreground sm:hidden truncate">
                  {book.author ?? "—"}
                </p>
                {lentMap[book.id] && (
                  <span className="mt-1 inline-block rounded-[4px] bg-[var(--accent)] px-1.5 py-0.5 font-[var(--font-sans)] text-[10px] text-white sm:hidden">
                    On Loan
                  </span>
                )}
              </div>
              <p className="hidden font-[var(--font-sans)] text-sm text-muted-foreground truncate sm:block">
                {book.author ?? "—"}
              </p>
              <span className="hidden justify-center sm:flex">
                <span className="rounded-[4px] border border-[var(--border)] bg-[var(--surface-elevated)] px-1.5 py-0.5 font-[var(--font-sans)] text-xs text-muted-foreground">
                  {book.status ?? "TO_READ"}
                </span>
              </span>
              <span className="hidden justify-center sm:flex font-[var(--font-sans)] text-xs text-[var(--warning)]">
                {book.rating ? "★".repeat(book.rating) : "—"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
