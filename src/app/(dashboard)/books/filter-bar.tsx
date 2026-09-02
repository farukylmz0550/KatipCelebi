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
    <div>
      <div className="flex items-center gap-3">
        <input
          placeholder="Search by title, author, ISBN..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="flex-1 border-b border-border bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 border-b border-border py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? "Hide" : "Filters"}
          {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={filters.searchField}
            onChange={(e) => update({ searchField: e.target.value })}
            className="border border-border bg-transparent px-2 py-1.5 text-xs text-foreground focus:outline-none"
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
            className="border border-border bg-transparent px-2 py-1.5 text-xs text-foreground focus:outline-none"
          >
            <option value="0">Any rating</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★☆ & up</option>
            <option value="3">★★★☆☆ & up</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => update({ status: e.target.value })}
            className="border border-border bg-transparent px-2 py-1.5 text-xs text-foreground focus:outline-none"
          >
            <option value="any">Status</option>
            <option value="TO_READ">To read</option>
            <option value="READING">Reading</option>
            <option value="FINISHED">Finished</option>
          </select>
          <select
            value={filters.signed}
            onChange={(e) => update({ signed: e.target.value })}
            className="border border-border bg-transparent px-2 py-1.5 text-xs text-foreground focus:outline-none"
          >
            <option value="any">Signed</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <select
            value={filters.lent}
            onChange={(e) => update({ lent: e.target.value })}
            className="border border-border bg-transparent px-2 py-1.5 text-xs text-foreground focus:outline-none"
          >
            <option value="any">Lending</option>
            <option value="home">At home</option>
            <option value="out">On loan</option>
          </select>
          <select
            value={filters.tag}
            onChange={(e) => update({ tag: e.target.value })}
            className="border border-border bg-transparent px-2 py-1.5 text-xs text-foreground focus:outline-none"
          >
            <option value="any">Tag</option>
            {tagsInUse.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="border border-border bg-transparent px-2 py-1.5 text-xs text-foreground focus:outline-none"
          >
            <option value={SORT_TITLE}>Sort: title</option>
            <option value={SORT_RATING}>Sort: rating</option>
            <option value={SORT_YEAR}>Sort: year</option>
          </select>
          <button
            onClick={() => update({ asc: !filters.asc })}
            className="border border-border px-2 py-1.5 text-xs text-foreground"
          >
            {filters.asc ? "↑ A–Z" : "↓ Z–A"}
          </button>
          <button
            onClick={() => { setFilters(defaultFilters); onChange(defaultFilters); }}
            className="border border-border px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
