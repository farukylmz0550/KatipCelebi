"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { addBook } from "@/app/actions/books";
import { AddBookForm } from "./add-book-form";

type Dict = {
  isbn: string;
  lookup: string;
  bookTitle: string;
  author: string;
  add: string;
  pages: string;
  scan: string;
  notFound?: string;
  lookupFailed?: string;
  addSuccess?: string;
  addFailed?: string;
  required?: string;
};

export function BooksAddSection({ dict, excel }: { dict: Dict; excel: React.ReactNode }) {
  const [showDetailed, setShowDetailed] = useState(false);

  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <AddBookForm dict={dict} />
      <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <button
          type="button"
          onClick={() => setShowDetailed((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-[8px] px-2 py-1.5 font-[var(--font-sans)] text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          {showDetailed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Detaylı ekle
        </button>
        <span className="font-[var(--font-sans)] text-xs text-muted-foreground">veya tüm alanlarla</span>
      </div>
      {showDetailed && (
        <div className="mt-4 animate-in fade-in">
          <DetailedAddForm dict={dict} onDone={() => setShowDetailed(false)} />
        </div>
      )}
      <div className="mt-4">{excel}</div>
    </div>
  );
}

function DetailedAddForm({ dict, onDone }: { dict: Dict; onDone?: () => void }) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    subtitle: "",
    publishers: "",
    publishDate: "",
    publishPlaces: "",
    editionName: "",
    series: "",
    numberOfPages: "",
    languages: "",
    isbn10: "",
    isbn13: "",
    subjects: "",
    coverUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update(key: keyof typeof form, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
    if (error) setError(null);
  }

  function handleAdd() {
    const title = form.title.trim();
    if (!title) {
      setError(dict.required ?? "Başlık gerekli");
      toast.error(dict.required ?? "Başlık gerekli");
      return;
    }
    startTransition(async () => {
      const result = await addBook({
        title,
        author: form.author.trim() || undefined,
        isbn: form.isbn.trim() || undefined,
        coverUrl: form.coverUrl.trim() || undefined,
        subtitle: form.subtitle.trim() || undefined,
        publishers: form.publishers.trim() || undefined,
        publishDate: form.publishDate.trim() || undefined,
        publishPlaces: form.publishPlaces.trim() || undefined,
        editionName: form.editionName.trim() || undefined,
        series: form.series.trim() || undefined,
        numberOfPages: form.numberOfPages.trim() || undefined,
        languages: form.languages.trim() || undefined,
        isbn10: form.isbn10.trim() || undefined,
        isbn13: form.isbn13.trim() || undefined,
        subjects: form.subjects.trim() || undefined,
      });
      if (!result.ok) {
        const msg = result.error || (dict.addFailed ?? "Kitap eklenemedi");
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success(dict.addSuccess ?? "Kitap eklendi", { icon: <Check size={16} /> });
      setForm({
        title: "",
        author: "",
        isbn: "",
        subtitle: "",
        publishers: "",
        publishDate: "",
        publishPlaces: "",
        editionName: "",
        series: "",
        numberOfPages: "",
        languages: "",
        isbn10: "",
        isbn13: "",
        subjects: "",
        coverUrl: "",
      });
      onDone?.();
    });
  }

  const inputCls =
    "w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 font-[var(--font-sans)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]";
  const labelCls =
    "mb-1 block font-[var(--font-sans)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground";

  return (
    <div className="space-y-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
      <p className="font-[var(--font-serif)] text-sm font-semibold text-foreground">Detaylı kitap ekle</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Başlık *</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder={dict.bookTitle}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Alt başlık</label>
          <input
            value={form.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
            placeholder="Alt başlık"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>{dict.author}</label>
          <input
            value={form.author}
            onChange={(e) => update("author", e.target.value)}
            placeholder={dict.author}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>ISBN</label>
          <input
            value={form.isbn}
            onChange={(e) => update("isbn", e.target.value)}
            placeholder="978..."
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>ISBN 10</label>
          <input
            value={form.isbn10}
            onChange={(e) => update("isbn10", e.target.value)}
            placeholder="ISBN10"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>ISBN 13</label>
          <input
            value={form.isbn13}
            onChange={(e) => update("isbn13", e.target.value)}
            placeholder="ISBN13"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Yayıncı</label>
          <input
            value={form.publishers}
            onChange={(e) => update("publishers", e.target.value)}
            placeholder="Yayıncı"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Yayın tarihi</label>
          <input
            value={form.publishDate}
            onChange={(e) => update("publishDate", e.target.value)}
            placeholder="2024"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Yayın yeri</label>
          <input
            value={form.publishPlaces}
            onChange={(e) => update("publishPlaces", e.target.value)}
            placeholder="İstanbul"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Baskı</label>
          <input
            value={form.editionName}
            onChange={(e) => update("editionName", e.target.value)}
            placeholder="1. Baskı"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Dizi</label>
          <input
            value={form.series}
            onChange={(e) => update("series", e.target.value)}
            placeholder="Dizi"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Sayfa</label>
          <input
            value={form.numberOfPages}
            onChange={(e) => update("numberOfPages", e.target.value)}
            placeholder="320"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Diller</label>
          <input
            value={form.languages}
            onChange={(e) => update("languages", e.target.value)}
            placeholder="tr, en"
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Konular</label>
          <input
            value={form.subjects}
            onChange={(e) => update("subjects", e.target.value)}
            placeholder="roman, tarih"
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Kapak URL</label>
          <input
            value={form.coverUrl}
            onChange={(e) => update("coverUrl", e.target.value)}
            placeholder="https://..."
            className={inputCls}
          />
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-[8px] border border-[var(--border-strong)] bg-[var(--error-soft)] px-3 py-2 text-sm text-[var(--error-text)]">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          disabled={pending || !form.title.trim()}
          className="rounded-[8px] bg-[var(--accent)] px-5 py-2 font-[var(--font-sans)] text-sm font-medium text-white hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] disabled:opacity-40"
        >
          {pending ? "..." : dict.add}
        </button>
      </div>
    </div>
  );
}
