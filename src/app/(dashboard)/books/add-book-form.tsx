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
    <div className="flex flex-wrap gap-2">
      <input
        value={isbn}
        onChange={(e) => setIsbn(e.target.value)}
        placeholder={dict.isbn}
        className="rounded border border-neutral-300 px-2 py-1"
      />
      <button type="button" onClick={handleLookup} disabled={pending || !isbn} className="rounded border border-neutral-300 px-2 py-1">
        {dict.lookup}
      </button>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={dict.bookTitle}
        className="rounded border border-neutral-300 px-2 py-1"
      />
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder={dict.author}
        className="rounded border border-neutral-300 px-2 py-1"
      />
      <button type="button" onClick={handleAdd} disabled={pending || !title} className="rounded bg-neutral-900 px-3 py-1 text-white disabled:opacity-50">
        {dict.add}
      </button>
    </div>
  );
}
