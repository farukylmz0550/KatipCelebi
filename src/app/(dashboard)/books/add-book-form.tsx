"use client";

import { useState, useTransition } from "react";
import { Camera } from "lucide-react";
import { addBook, lookupIsbnAction } from "@/app/actions/books";

export function AddBookForm({
  dict,
}: {
  dict: { isbn: string; lookup: string; bookTitle: string; author: string; add: string; pages: string; scan: string };
}) {
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [numberOfPages, setNumberOfPages] = useState("");
  const [pending, startTransition] = useTransition();

  function handleLookup() {
    startTransition(async () => {
      const result = await lookupIsbnAction(isbn);
      if (result) {
        setTitle(result.title);
        setAuthor(result.author ?? "");
        setCoverUrl(result.coverUrl);
        if (result.numberOfPages) setNumberOfPages(result.numberOfPages);
      }
    });
  }

  function handleAdd() {
    if (!title) return;
    startTransition(async () => {
      await addBook({
        isbn: isbn || undefined,
        title,
        author: author || undefined,
        coverUrl,
        numberOfPages: numberOfPages || undefined,
      });
      setIsbn("");
      setTitle("");
      setAuthor("");
      setCoverUrl(undefined);
      setNumberOfPages("");
    });
  }

  function handleScan() {
    // Barcode scanner integration — opens camera modal
    // Will be implemented with html5-qrcode
    alert("Barkod tarama yakında eklenecek!");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-[13px] text-muted-foreground">{dict.isbn}</label>
          <div className="flex gap-1">
            <input
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder={dict.isbn}
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={handleScan}
              className="flex-shrink-0 rounded-lg border border-border bg-secondary px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent md:hidden"
              title={dict.scan}
            >
              <Camera size={16} />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLookup}
          disabled={pending || !isbn}
          className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-[13px] text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-40"
        >
          {dict.lookup}
        </button>
        <div className="flex-1 min-w-[180px]">
          <label className="mb-1 block text-[13px] text-muted-foreground">{dict.bookTitle}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.bookTitle}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="min-w-[120px]">
          <label className="mb-1 block text-[13px] text-muted-foreground">{dict.author}</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={dict.author}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={pending || !title}
          className="rounded-lg bg-primary px-4 py-1.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {dict.add}
        </button>
      </div>
      {numberOfPages && (
        <div className="text-xs text-muted-foreground">
          {dict.pages}: {numberOfPages}
        </div>
      )}
    </div>
  );
}
