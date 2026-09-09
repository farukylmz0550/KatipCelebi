"use client";

import { useState, useTransition } from "react";
import { createLending } from "@/app/actions/lending";

type Book = { id: string; title: string };

export function LendingForm({
  books,
  dict,
}: {
  books: Book[];
  dict: { book: string; borrower: string; lendCta: string; namePlaceholder: string };
}) {
  const [bookId, setBookId] = useState(books[0]?.id ?? "");
  const [borrowerName, setBorrowerName] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (!bookId || !borrowerName) return;
    startTransition(async () => {
      await createLending(bookId, borrowerName);
      setBorrowerName("");
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <label className="mb-1 block font-[var(--font-sans)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {dict.book}
        </label>
        <select
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 font-[var(--font-sans)] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[160px]">
        <label className="mb-1 block font-[var(--font-sans)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {dict.borrower}
        </label>
        <input
          value={borrowerName}
          onChange={(e) => setBorrowerName(e.target.value)}
          placeholder={dict.namePlaceholder}
          className="w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 font-[var(--font-sans)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={pending || !bookId || !borrowerName}
        className="rounded-[8px] bg-[var(--accent)] px-5 py-2 font-[var(--font-sans)] text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {dict.lendCta}
      </button>
    </div>
  );
}
