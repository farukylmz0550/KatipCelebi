"use client";

import { useState } from "react";
import { Filters, defaultFilters, SIGNED_ANY, LENT_ANY, SORT_TITLE, SORT_RATING, SORT_YEAR } from "@/lib/books/filters";

export function FilterBar({ onChange, tagsInUse }: { onChange: (f: Filters) => void; tagsInUse: string[] }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [advanced, setAdvanced] = useState(false);

  function update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    onChange(next);
  }

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex gap-2">
        <input
          placeholder="Search"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        />
        <select value={filters.searchField} onChange={(e) => update({ searchField: e.target.value })} className="rounded border border-neutral-300 px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800">
          <option value="all">All</option>
          <option value="title">Title</option>
          <option value="authors">Authors</option>
          <option value="isbn">ISBN</option>
          <option value="publishers">Publishers</option>
        </select>
        <button onClick={() => setAdvanced(!advanced)} className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700">
          {advanced ? "▾" : "▸"} Advanced
        </button>
      </div>

      {advanced && (
        <div className="flex flex-wrap gap-2">
          <select value={String(filters.minRating)} onChange={(e) => update({ minRating: parseInt(e.target.value, 10) })} className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800">
            <option value="0">Any rating</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★☆ & up</option>
            <option value="3">★★★☆☆ & up</option>
          </select>
          <select value={filters.signed} onChange={(e) => update({ signed: e.target.value })} className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800">
            <option value="any">Signed: any</option>
            <option value="yes">Signed: yes</option>
            <option value="no">Signed: no</option>
          </select>
          <select value={filters.lent} onChange={(e) => update({ lent: e.target.value })} className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800">
            <option value="any">Lent: any</option>
            <option value="home">At home</option>
            <option value="out">Out</option>
          </select>
          <select value={filters.status} onChange={(e) => update({ status: e.target.value })} className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800">
            <option value="any">Status: any</option>
            <option value="TO_READ">To read</option>
            <option value="READING">Reading</option>
            <option value="FINISHED">Finished</option>
          </select>
          <select value={filters.tag} onChange={(e) => update({ tag: e.target.value })} className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800">
            <option value="any">Tag: any</option>
            {tagsInUse.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={filters.sort} onChange={(e) => update({ sort: e.target.value })} className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800">
            <option value={SORT_TITLE}>Sort: title</option>
            <option value={SORT_RATING}>Sort: rating</option>
            <option value={SORT_YEAR}>Sort: year</option>
          </select>
          <button onClick={() => update({ asc: !filters.asc })} className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700">
            {filters.asc ? "↑" : "↓"}
          </button>
          <button onClick={() => { setFilters(defaultFilters); onChange(defaultFilters); }} className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
