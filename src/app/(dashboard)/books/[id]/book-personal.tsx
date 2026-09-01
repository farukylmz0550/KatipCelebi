"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBook, setBookStatus } from "@/app/actions/books";
import { show } from "@/lib/books/tags";

type Book = {
  id: string;
  rating: number | null;
  signed: boolean | null;
  tags?: string | null;
  notes?: string | null;
  status: string;
  startedAt?: Date | string | null;
  finishedAt?: Date | string | null;
};

export function BookPersonal({ book, dict }: { book: Book; dict: Record<string, unknown> }) {
  const [rating, setRating] = useState(book.rating ?? 0);
  const [signed, setSigned] = useState(!!book.signed);
  const [tags, setTags] = useState(book.tags ?? "");
  const [notes, setNotes] = useState(book.notes ?? "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function saveRating(next: number) {
    setRating(next);
    startTransition(async () => {
      await updateBook(book.id, { rating: next });
      router.refresh();
    });
  }

  function saveSigned(next: boolean) {
    setSigned(next);
    startTransition(async () => {
      await updateBook(book.id, { signed: next });
      router.refresh();
    });
  }

  function saveTags() {
    startTransition(async () => {
      await updateBook(book.id, { tags });
      router.refresh();
    });
  }

  function saveNotes() {
    startTransition(async () => {
      await updateBook(book.id, { notes });
      router.refresh();
    });
  }

  function onStatusChange(status: "TO_READ" | "READING" | "FINISHED") {
    startTransition(async () => {
      await setBookStatus(book.id, status);
      router.refresh();
    });
  }

  const days = book.startedAt && book.finishedAt ? Math.round((new Date(book.finishedAt).getTime() - new Date(book.startedAt).getTime()) / 86400000) : null;

  return (
    <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="font-medium">Personal</h2>

      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">Rating:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => saveRating(n === rating ? 0 : n)} className={`text-lg ${n <= rating ? "text-amber-500" : "text-neutral-300"}`}>
              ★
            </button>
          ))}
        </div>
        <label className="ml-4 flex items-center gap-1 text-sm">
          <input type="checkbox" checked={signed} onChange={(e) => saveSigned(e.target.checked)} />
          Signed
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">Status:</span>
        <select value={book.status} onChange={(e) => onStatusChange(e.target.value as never)} className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800">
          <option value="TO_READ">To read</option>
          <option value="READING">Reading</option>
          <option value="FINISHED">Finished</option>
        </select>
        {book.startedAt && <span className="text-xs text-neutral-500">Started {new Date(book.startedAt).toLocaleDateString()}</span>}
        {book.finishedAt && <span className="text-xs text-neutral-500">Finished {new Date(book.finishedAt).toLocaleDateString()}</span>}
        {days !== null && <span className="text-xs text-neutral-500">· {days} days</span>}
      </div>

      <div className="space-y-1">
        <label className="text-sm text-neutral-600 dark:text-neutral-400">Tags (comma separated)</label>
        <div className="flex gap-2">
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. fiction, history" className="flex-1 rounded border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800" />
          <button onClick={saveTags} disabled={pending} className="rounded border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-neutral-700">Save</button>
        </div>
        {tags && <p className="text-xs text-neutral-500">Show: {show(tags)}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm text-neutral-600 dark:text-neutral-400">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Your notes…" className="w-full rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" />
        <button onClick={saveNotes} disabled={pending} className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">Save notes</button>
        {notes && (
          <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-800">
            <p className="mb-1 text-xs text-neutral-500">Preview:</p>
            <p className="whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </div>
    </section>
  );
}
