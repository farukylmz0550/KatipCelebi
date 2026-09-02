"use client";

import { useState, useTransition } from "react";
import { addBook, lookupIsbnAction } from "@/app/actions/books";

export function AddBookForm({ dict }: { dict: { isbn: string; lookup: string; bookTitle: string; author: string; add: string } }) {
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function handleLookup() {
    startTransition(async () => {
      const result = await lookupIsbnAction(isbn);
      if (result) {
        setTitle(result.title);
        setAuthor(result.author ?? "");
        setCoverUrl(result.coverUrl);
      }
    });
  }

  function handleAdd() {
    if (!title) return;
    startTransition(async () => {
      await addBook({ isbn: isbn || undefined, title, author: author || undefined, coverUrl });
      setIsbn("");
      setTitle("");
      setAuthor("");
      setCoverUrl(undefined);
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[140px]">
        <label className="editorial-label mb-1 block">ISBN</label>
        <input
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          placeholder={dict.isbn}
          className="w-full border-b border-border bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
      </div>
      <button
        type="button"
        onClick={handleLookup}
        disabled={pending || !isbn}
        className="border-b border-primary px-1 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:text-primary/80 disabled:opacity-40"
      >
        {dict.lookup}
      </button>
      <div className="flex-1 min-w-[180px]">
        <label className="editorial-label mb-1 block">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={dict.bookTitle}
          className="w-full border-b border-border bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
      </div>
      <div className="min-w-[120px]">
        <label className="editorial-label mb-1 block">Author</label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder={dict.author}
          className="w-full border-b border-border bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={pending || !title}
        className="bg-foreground px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {dict.add}
      </button>
    </div>
  );
}
