"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLending, returnLending } from "@/app/actions/lending";
import { updateBook } from "@/app/actions/books";

type Book = { id: string; copies: number | null; title: string };
type Lending = { id: string; borrowerName: string; personName?: string | null; lentAt: Date | string; returnedAt?: Date | string | null };
type Person = { id: string; name: string };

export function BookLending({ book, lendings, persons, dict }: { book: Book; lendings: Lending[]; persons: Person[]; dict: Record<string, string> }) {
  const [copies, setCopies] = useState(String(book.copies ?? 1));
  const [borrower, setBorrower] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const out = lendings.filter((l) => !l.returnedAt).length;

  function saveCopies() {
    const n = Math.max(1, Math.min(999, parseInt(copies || "1", 10)));
    startTransition(async () => {
      await updateBook(book.id, { copies: n });
      router.refresh();
    });
  }

  function onLend(e: React.FormEvent) {
    e.preventDefault();
    if (!borrower.trim()) return;
    startTransition(async () => {
      try {
        await createLending(book.id, borrower.trim());
        setBorrower("");
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : String(err));
      }
    });
  }

  function onReturn(id: string) {
    startTransition(async () => {
      await returnLending(id);
      router.refresh();
    });
  }

  return (
    <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="font-medium">Lending</h2>

      <div className="flex items-center gap-2 text-sm">
        <label className="text-neutral-600 dark:text-neutral-400">Copies:</label>
        <input type="number" min={1} max={999} value={copies} onChange={(e) => setCopies(e.target.value)} className="w-20 rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800" />
        <button onClick={saveCopies} disabled={pending} className="rounded border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-neutral-700">Save</button>
        <span className="text-xs text-neutral-500">{out} out / {book.copies ?? 1} total · {out === 0 ? "All here" : out >= (book.copies ?? 1) ? "All out" : "Some here"}</span>
      </div>

      <form onSubmit={onLend} className="flex gap-2">
        <input list="persons" value={borrower} onChange={(e) => setBorrower(e.target.value)} placeholder={dict.borrower ?? "Borrower name"} className="flex-1 rounded border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-800" />
        <datalist id="persons">
          {persons.map((p) => (
            <option key={p.id} value={p.name} />
          ))}
        </datalist>
        <button type="submit" disabled={pending || !borrower.trim()} className="rounded bg-neutral-900 px-4 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">Lend</button>
      </form>

      <ul className="space-y-1 text-sm">
        {lendings.length === 0 ? (
          <li className="text-neutral-500">No lending history</li>
        ) : (
          lendings.map((l) => (
            <li key={l.id} className="flex items-center justify-between rounded border border-neutral-200 px-3 py-2 dark:border-neutral-800">
              <span>{l.personName ?? l.borrowerName} — {new Date(l.lentAt).toLocaleDateString()} {l.returnedAt ? `(returned ${new Date(l.returnedAt).toLocaleDateString()})` : "(out)"}</span>
              {!l.returnedAt && (
                <button onClick={() => onReturn(l.id)} disabled={pending} className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-50 dark:border-neutral-700">Take back</button>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
