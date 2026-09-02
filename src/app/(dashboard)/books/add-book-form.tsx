"use client";

import { useState, useTransition } from "react";
import { Search, Plus } from "lucide-react";
import { addBook, lookupIsbnAction } from "@/app/actions/books";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          placeholder={dict.isbn}
          className="w-40"
        />
        <Button type="button" variant="outline" size="sm" onClick={handleLookup} disabled={pending || !isbn}>
          <Search size={14} />
          {dict.lookup}
        </Button>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={dict.bookTitle}
          className="w-48"
        />
        <Input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder={dict.author}
          className="w-36"
        />
        <Button type="button" size="sm" onClick={handleAdd} disabled={pending || !title}>
          <Plus size={14} />
          {dict.add}
        </Button>
      </div>
    </div>
  );
}
