"use client";

import { useState, useTransition } from "react";
import { importBooksByIsbn } from "@/app/actions/books";

export function ImportForm({ dict }: { dict: { importPlaceholder: string; importCta: string } }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function handleImport() {
    startTransition(async () => {
      const { imported } = await importBooksByIsbn(text);
      setResult(imported);
      setText("");
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={dict.importPlaceholder}
        rows={3}
        className="w-full rounded border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 px-2 py-1"
      />
      <button type="button" onClick={handleImport} disabled={pending || !text.trim()} className="rounded border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 px-3 py-1 disabled:opacity-50">
        {dict.importCta}
      </button>
      {result !== null && <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">+{result}</span>}
    </div>
  );
}
