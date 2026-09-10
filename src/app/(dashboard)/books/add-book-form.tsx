"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { addBook, lookupIsbnAction } from "@/app/actions/books";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { enqueuePendingBook, setupPendingBookSync } from "@/lib/offline-queue";

export function AddBookForm({
  dict,
}: {
  dict: {
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
}) {
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [numberOfPages, setNumberOfPages] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [lookupPending, startLookup] = useTransition();
  const [addPending, startAdd] = useTransition();

  const pending = lookupPending || addPending;

  useEffect(() => setupPendingBookSync(), []);

  function handleLookup(scannedIsbn?: string) {
    const raw = scannedIsbn ?? isbn;
    const cleaned = raw.replace(/[^0-9Xx]/g, "");
    if (!cleaned) {
      setLookupError(dict.required ?? "ISBN is required");
      return;
    }
    setLookupError(null);
    setAddError(null);
    startLookup(async () => {
      const res = await lookupIsbnAction(raw);
      if (res.ok && res.data) {
        const data = res.data;
        // Direct add — with all details, one step
        const result = await addBook({
          isbn: data.isbn || cleaned,
          title: data.title,
          author: data.author ?? undefined,
          coverUrl: data.coverUrl,
          numberOfPages: data.numberOfPages,
          publishers: data.publishers,
          publishDate: data.publishDate,
          publishPlaces: data.publishPlaces,
          languages: data.languages,
          subjects: data.subjects,
          isbn10: data.isbn10,
          isbn13: data.isbn13,
        });
        if (result.ok) {
          toast.success(dict.addSuccess ?? "Kitap eklendi", { description: data.title, icon: <Check size={16} /> });
          setIsbn("");
          setTitle("");
          setAuthor("");
          setCoverUrl(undefined);
          setNumberOfPages("");
          setLookupError(null);
        } else {
          const msg = result.error || (dict.addFailed ?? "Kitap eklenemedi");
          setAddError(msg);
          toast.error(msg);
          // Fallback: fill form so manual correction is possible
          setTitle(data.title);
          setAuthor(data.author ?? "");
          setCoverUrl(data.coverUrl);
          if (data.numberOfPages) setNumberOfPages(data.numberOfPages);
        }
      } else if (res.ok) {
        const msg = dict.notFound ?? "ISBN not found — enter manually.";
        setLookupError(msg);
        toast.error(msg);
      } else {
        const msg =
          res.error === "NOT_FOUND"
            ? (dict.notFound ?? "ISBN not found — enter manually.")
            : (dict.lookupFailed ?? "Lookup failed. Try again.");
        setLookupError(msg);
        toast.error(msg);
      }
    });
  }

  function handleAdd() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setAddError(dict.required ?? "Title is required");
      toast.error(dict.required ?? "Title is required");
      return;
    }
    setAddError(null);
    startAdd(async () => {
      const bookInput = {
        isbn: isbn || undefined,
        title: trimmedTitle,
        author: author.trim() || undefined,
        coverUrl,
        numberOfPages: numberOfPages || undefined,
      };
      try {
        const result = await addBook(bookInput);
        if (!result.ok) {
          const msg = result.error || (dict.addFailed ?? "Kitap eklenemedi");
          setAddError(msg);
          toast.error(msg);
          return;
        }
      } catch (error) {
        // Network/server unreachable — queue for background sync when offline
        if (!navigator.onLine) {
          enqueuePendingBook(bookInput);
          toast.info("Offline — kitap kaydedildi, bağlantı gelince eklenecek");
          setIsbn("");
          setTitle("");
          setAuthor("");
          setCoverUrl(undefined);
          setNumberOfPages("");
          setLookupError(null);
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready
              .then((reg) => {
                // Background Sync is not yet in the default TS DOM lib
                const sync = (reg as ServiceWorkerRegistration & { sync?: { register(tag: string): Promise<void> } })
                  .sync;
                return sync?.register("bookshelf-sync-books");
              })
              .catch(() => {});
          }
          return;
        }
        throw error;
      }
      toast.success(dict.addSuccess ?? "Kitap eklendi", { icon: <Check size={16} /> });
      setIsbn("");
      setTitle("");
      setAuthor("");
      setCoverUrl(undefined);
      setNumberOfPages("");
      setLookupError(null);
    });
  }

  function handleScan(isbn: string) {
    setIsbn(isbn);
    if (lookupError) setLookupError(null);
    handleLookup(isbn);
  }

  return (
    <div className="space-y-3">
      {/* Header — Where am I? → What can I do? per UI_Design_Language:482 */}
      <div className="flex items-baseline justify-between">
        <h2 className="font-[var(--font-serif)] text-[15px] font-semibold tracking-tight text-foreground">
          {dict.bookTitle} — {dict.add}
        </h2>
        <span className="text-xs text-muted-foreground">
          {dict.pages && numberOfPages ? `${dict.pages}: ${numberOfPages}` : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block font-[var(--font-sans)] text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {dict.isbn}
          </label>
          <div className="flex gap-1">
            <input
              value={isbn}
              onChange={(e) => {
                setIsbn(e.target.value);
                if (lookupError) setLookupError(null);
              }}
              placeholder={dict.isbn}
              aria-invalid={!!lookupError}
              className={`w-full rounded-[8px] border bg-[var(--surface-elevated)] px-3 py-2 font-[var(--font-sans)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                lookupError ? "border-[var(--destructive)] bg-[var(--error-soft)]" : "border-border"
              }`}
            />
            <BarcodeScanner onDetected={handleScan} title={dict.scan} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleLookup()}
          disabled={lookupPending || !isbn.trim()}
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-secondary px-3.5 py-2 font-[var(--font-sans)] text-[13px] font-medium text-secondary-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search size={14} />
          {lookupPending ? "..." : dict.lookup}
        </button>

        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block font-[var(--font-sans)] text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {dict.bookTitle} <span className="text-[var(--destructive)]">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (addError) setAddError(null);
            }}
            placeholder={dict.bookTitle}
            aria-invalid={!!addError}
            className={`w-full rounded-[8px] border bg-[var(--surface-elevated)] px-3 py-2 font-[var(--font-serif)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
              addError ? "border-[var(--destructive)] bg-[var(--error-soft)]" : "border-border"
            }`}
          />
        </div>

        <div className="min-w-[120px]">
          <label className="mb-1 block font-[var(--font-sans)] text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {dict.author}
          </label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={dict.author}
            className="w-full rounded-[8px] border border-border bg-[var(--surface-elevated)] px-3 py-2 font-[var(--font-sans)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={addPending || !title.trim()}
          className="rounded-[8px] bg-[var(--accent)] px-5 py-2 font-[var(--font-sans)] text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {addPending ? "..." : dict.add}
        </button>
      </div>

      {/* States — distinguishable without color alone per UI_Design_Language:532 */}
      {lookupError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-[8px] border border-[var(--border-strong)] bg-[var(--error-soft)] px-3 py-2 text-sm text-[var(--error-text)]"
        >
          <AlertCircle size={14} className="shrink-0" />
          <span>{lookupError}</span>
        </div>
      )}
      {addError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-[8px] border border-[var(--border-strong)] bg-[var(--error-soft)] px-3 py-2 text-sm text-[var(--error-text)]"
        >
          <AlertCircle size={14} className="shrink-0" />
          <span>{addError}</span>
        </div>
      )}

      {pending && (
        <div className="text-xs text-muted-foreground" aria-live="polite">
          ...
        </div>
      )}
    </div>
  );
}
