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
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[200px]">
        <label className="mb-1 block text-[13px] text-muted-foreground">{dict.book}</label>
        <select
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[160px]">
        <label className="mb-1 block text-[13px] text-muted-foreground">{dict.borrower}</label>
        <input
          value={borrowerName}
          onChange={(e) => setBorrowerName(e.target.value)}
          placeholder="Name"
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={pending || !bookId || !borrowerName}
        className="rounded-lg bg-primary px-4 py-1.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {dict.lendCta}
      </button>
    </div>
  );
}
