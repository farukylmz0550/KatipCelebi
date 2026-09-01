"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBook } from "@/app/actions/books";

type Book = {
  id: string;
  title: string;
  subtitle?: string | null;
  publishers?: string | null;
  publishDate?: string | null;
  publishPlaces?: string | null;
  editionName?: string | null;
  series?: string | null;
  numberOfPages?: string | null;
  languages?: string | null;
  isbn10?: string | null;
  isbn13?: string | null;
  subjects?: string | null;
  author?: string | null;
  isbn?: string | null;
};

export function BookFacts({ book }: { book: Book }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({
    title: book.title ?? "",
    subtitle: book.subtitle ?? "",
    author: book.author ?? "",
    publishers: book.publishers ?? "",
    publishDate: book.publishDate ?? "",
    publishPlaces: book.publishPlaces ?? "",
    editionName: book.editionName ?? "",
    series: book.series ?? "",
    numberOfPages: book.numberOfPages ?? "",
    languages: book.languages ?? "",
    isbn10: book.isbn10 ?? "",
    isbn13: book.isbn13 ?? "",
    subjects: book.subjects ?? "",
  });

  function onSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateBook(book.id, form as never);
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  const fields: Array<[string, string]> = [
    ["title", "Title *"],
    ["subtitle", "Subtitle"],
    ["author", "Authors"],
    ["publishers", "Publishers"],
    ["publishDate", "Publish date"],
    ["publishPlaces", "Publish places"],
    ["editionName", "Edition"],
    ["series", "Series"],
    ["numberOfPages", "Pages"],
    ["languages", "Languages"],
    ["isbn10", "ISBN 10"],
    ["isbn13", "ISBN 13"],
    ["subjects", "Subjects"],
  ];

  if (!editing) {
    return (
      <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Facts</h2>
          <button onClick={() => setEditing(true)} className="rounded border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700">Edit</button>
        </div>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {fields.map(([key, label]) => (
            <div key={key} className="flex gap-2">
              <dt className="min-w-[110px] text-neutral-500 dark:text-neutral-400">{label}:</dt>
              <dd className="flex-1 truncate">{(form as Record<string, string>)[key] || "—"}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 font-medium">Edit facts</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(([key, label]) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
            <input value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full rounded border border-neutral-300 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800" />
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={onSave} disabled={pending} className="rounded bg-neutral-900 px-4 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">Save</button>
        <button onClick={() => setEditing(false)} className="rounded border border-neutral-300 px-4 py-1.5 text-sm dark:border-neutral-700">Cancel</button>
      </div>
    </section>
  );
}
