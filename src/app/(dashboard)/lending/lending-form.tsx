"use client";

import { useState, useTransition } from "react";
import { createLending } from "@/app/actions/lending";

type Book = { id: string; title: string };

export function LendingForm({ books, dict }: { books: Book[]; dict: { book: string; borrower: string; lendCta: string } }) {
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
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[200px]">
        <label className="editorial-label mb-1 block">{dict.book}</label>
        <select
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="w-full border-b border-border bg-transparent py-1.5 text-sm text-foreground focus:border-foreground focus:outline-none"
        >
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[160px]">
        <label className="editorial-label mb-1 block">{dict.borrower}</label>
        <input
          value={borrowerName}
          onChange={(e) => setBorrowerName(e.target.value)}
          placeholder="Name"
          className="w-full border-b border-border bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={pending || !bookId || !borrowerName}
        className="bg-foreground px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {dict.lendCta}
      </button>
    </div>
  );
}
