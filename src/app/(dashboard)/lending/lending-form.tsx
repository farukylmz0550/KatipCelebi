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
    <div className="flex flex-wrap gap-2">
      <select value={bookId} onChange={(e) => setBookId(e.target.value)} className="rounded border border-neutral-300 px-2 py-1">
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.title}
          </option>
        ))}
      </select>
      <input
        value={borrowerName}
        onChange={(e) => setBorrowerName(e.target.value)}
        placeholder={dict.borrower}
        className="rounded border border-neutral-300 px-2 py-1"
      />
      <button type="button" onClick={handleSubmit} disabled={pending || !bookId || !borrowerName} className="rounded bg-neutral-900 px-3 py-1 text-white disabled:opacity-50">
        {dict.lendCta}
      </button>
    </div>
  );
}
