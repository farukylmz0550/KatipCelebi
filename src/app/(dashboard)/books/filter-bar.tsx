"use client";

import { useState } from "react";
import { Filters, defaultFilters, SORT_TITLE, SORT_RATING, SORT_YEAR } from "@/lib/books/filters";

export function FilterBar({ onChange, tagsInUse }: { onChange: (f: Filters) => void; tagsInUse: string[] }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [expanded, setExpanded] = useState(false);

  function update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    onChange(next);
  }

  const hasActiveFilters = filters.minRating > 0 || filters.signed !== "any" || filters.lent !== "any" || filters.status !== "any" || filters.tag !== "any";

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <input
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-[13px] text-secondary-foreground transition-colors hover:bg-accent"
        >
          Filters
          {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          <select
            value={filters.searchField}
            onChange={(e) => update({ searchField: e.target.value })}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All fields</option>
            <option value="title">Title</option>
            <option value="authors">Authors</option>
            <option value="isbn">ISBN</option>
            <option value="publishers">Publishers</option>
          </select>
          <select
            value={String(filters.minRating)}
            onChange={(e) => update({ minRating: parseInt(e.target.value, 10) })}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="0">Any rating</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★☆ & up</option>
            <option value="3">★★★☆☆ & up</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => update({ status: e.target.value })}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="any">Status</option>
            <option value="TO_READ">To read</option>
            <option value="READING">Reading</option>
            <option value="FINISHED">Finished</option>
          </select>
          <select
            value={filters.signed}
            onChange={(e) => update({ signed: e.target.value })}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="any">Signed</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <select
            value={filters.lent}
            onChange={(e) => update({ lent: e.target.value })}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="any">Lending</option>
            <option value="home">At home</option>
            <option value="out">On loan</option>
          </select>
          <select
            value={filters.tag}
            onChange={(e) => update({ tag: e.target.value })}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="any">Tag</option>
            {tagsInUse.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={SORT_TITLE}>Sort: title</option>
            <option value={SORT_RATING}>Sort: rating</option>
            <option value={SORT_YEAR}>Sort: year</option>
          </select>
          <button
            onClick={() => update({ asc: !filters.asc })}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
          >
            {filters.asc ? "↑ A–Z" : "↓ Z–A"}
          </button>
          <button
            onClick={() => { setFilters(defaultFilters); onChange(defaultFilters); }}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
