"use client";

import { useTransition } from "react";
import { deleteBook, setBookStatus } from "@/app/actions/books";

type Book = {
  id: string;
  title: string;
  author: string | null;
  status: "TO_READ" | "READING" | "FINISHED";
};

export function BookRow({ book, dict }: { book: Book; dict: { status: Record<string, string>; markFinished: string; delete: string } }) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between gap-2 rounded border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <p className="font-medium">{book.title}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {book.author} · {dict.status[book.status]}
        </p>
      </div>
      <div className="flex gap-2 text-sm">
        {book.status !== "FINISHED" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => setBookStatus(book.id, "FINISHED"))}
            className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
          >
            {dict.markFinished}
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => deleteBook(book.id))}
          className="rounded border border-red-300 px-2 py-1 text-red-600 dark:border-red-800 dark:bg-neutral-800 dark:text-red-400"
        >
          {dict.delete}
        </button>
      </div>
    </li>
  );
}
