"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createLending } from "@/app/actions/lending";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex-1 min-w-[200px]">
        <select
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
      </div>
      <Input
        value={borrowerName}
        onChange={(e) => setBorrowerName(e.target.value)}
        placeholder={dict.borrower}
        className="w-48"
      />
      <Button size="sm" onClick={handleSubmit} disabled={pending || !bookId || !borrowerName}>
        <Plus size={14} />
        {dict.lendCta}
      </Button>
    </div>
  );
}
