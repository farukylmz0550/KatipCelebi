"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { BookPlus, RotateCcw } from "lucide-react";
import { setBookStatus, logPagesRead, startReRead } from "@/app/actions/books";
import { useSwipe, useLongPress } from "@/lib/touch-gestures";
import { hapticFeedback } from "@/lib/haptic";
import { getNextStatus, getPrevStatus, statusLabel, STATUS_ORDER, type StatusLabels } from "@/lib/books/status-cycle";

type Book = {
  id: string;
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  rating?: number | null;
  signed?: boolean | null;
  status?: string | null;
  currentPage?: number | null;
  numberOfPages?: string | null;
};

type CardDict = {
  toRead: string;
  reading: string;
  finished: string;
  logPagesButton: string;
  logPagesToast: string;
  logPagesError: string;
  pagesLeft: string;
  reReadButton: string;
  bookFinishedToast: string;
  earlyFinishBlocked: string;
};

export function BookCard({
  book,
  lentOut,
  statusLabels,
  pagesPerReadEvent,
  dict,
  onFinished,
}: {
  book: Book;
  lentOut: boolean;
  statusLabels?: StatusLabels;
  pagesPerReadEvent: number;
  dict: CardDict;
  onFinished?: (title: string) => void;
}) {
  const rating = book.rating ?? 0;
  const status = book.status ?? "TO_READ";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const longPressedRef = useRef(false);

  const totalPages = book.numberOfPages ? parseInt(book.numberOfPages, 10) : null;
  const knownPages = totalPages !== null && !isNaN(totalPages) && totalPages > 0;
  const pagesLeft = knownPages ? Math.max(0, totalPages - (book.currentPage ?? 0)) : null;

  function changeStatus(next: string) {
    hapticFeedback("medium");
    startTransition(async () => {
      const res = await setBookStatus(book.id, next as "TO_READ" | "READING" | "FINISHED");
      if (!res.ok) {
        toast.error(res.error === "RemainingPages" ? dict.earlyFinishBlocked : dict.logPagesError);
        return;
      }
      if (next === "FINISHED") toast.success(dict.bookFinishedToast);
      router.refresh();
      if (next === "FINISHED" && onFinished) onFinished(book.title);
    });
  }

  function logPages() {
    hapticFeedback("light");
    startTransition(async () => {
      const res = await logPagesRead(book.id);
      if (!res.ok) {
        toast.error(dict.logPagesError);
        return;
      }
      toast.success(
        res.finished
          ? dict.bookFinishedToast
          : dict.logPagesToast.replace("{count}", String(res.logged ?? pagesPerReadEvent)),
      );
      router.refresh();
      if (res.finished && onFinished) onFinished(book.title);
    });
  }

  function reRead() {
    hapticFeedback("medium");
    startTransition(async () => {
      const res = await startReRead(book.id);
      if (!res.ok) {
        toast.error(dict.logPagesError);
        return;
      }
      toast.success(dict.reReadButton);
      router.refresh();
    });
  }

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => changeStatus(getNextStatus(status)),
    onSwipeRight: () => changeStatus(getPrevStatus(status)),
    threshold: 60,
  });

  const longPressHandlers = useLongPress({
    onLongPress: () => {
      longPressedRef.current = true;
      setMenuOpen(true);
    },
    delay: 450,
  });

  return (
    <>
      <Link
        href={`/books/${book.id}`}
        className="group flex h-[380px] flex-col overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)] transition-colors hover:border-[var(--border-strong)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        {...swipeHandlers}
        {...longPressHandlers}
        onClick={(e) => {
          // Swallow the tap that triggered the long-press
          if (longPressedRef.current) {
            e.preventDefault();
            longPressedRef.current = false;
          }
        }}
      >
        {/* Fixed cover area — 60% — cover fits fully */}
        <div className="relative h-[60%] shrink-0 overflow-hidden bg-[var(--surface-elevated)] p-2">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverUrl} alt={book.title} className="h-full w-full object-contain" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--surface-elevated)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="h-14 w-14 opacity-15" />
            </div>
          )}
          {lentOut && (
            <div className="absolute right-2 top-2 rounded-[4px] bg-[var(--accent)] px-2 py-0.5 font-[var(--font-sans)] text-[10px] font-medium text-white shadow-sm">
              On Loan
            </div>
          )}
          {book.signed && (
            <div className="absolute left-2 top-2 rounded-[4px] bg-[var(--warning-soft)] px-1.5 py-0.5 font-[var(--font-sans)] text-[9px] font-medium text-[var(--warning-text)]">
              Signed
            </div>
          )}
        </div>

        {/* Fixed metadata area — 40% — okunabilir, 152px */}
        <div className="flex h-[40%] flex-col justify-center gap-1 px-3 py-3">
          <h3 className="font-[var(--font-serif)] text-[15px] font-semibold leading-snug text-foreground line-clamp-2">
            {book.title}
          </h3>
          {book.author ? (
            <p className="font-[var(--font-sans)] text-sm leading-tight text-foreground/80 line-clamp-1">
              {book.author}
            </p>
          ) : (
            <p className="font-[var(--font-sans)] text-sm leading-tight text-foreground/80 opacity-0 select-none line-clamp-1">
              —
            </p>
          )}
          <div className="flex items-center gap-1.5 pt-0.5">
            {rating > 0 ? (
              <span
                className="font-[var(--font-sans)] text-xs tracking-tight text-[var(--warning)]"
                aria-label={`Rating ${rating} of 5`}
              >
                {"★".repeat(rating)}
                <span className="text-muted-foreground/30">{"☆".repeat(5 - rating)}</span>
              </span>
            ) : (
              <span className="text-xs text-transparent select-none">★</span>
            )}
            {book.status && (
              <span className="ml-auto rounded-[4px] bg-[var(--surface-elevated)] border border-[var(--border)] px-2 py-0.5 font-[var(--font-sans)] text-[11px] font-medium text-foreground">
                {pending ? "…" : statusLabel(book.status, statusLabels)}
              </span>
            )}
          </div>
          {/* v2.7.0 — remaining pages for books being read + streak-only actions */}
          {status === "READING" && knownPages && (
            <p className="font-[var(--font-sans)] text-[11px] tabular-nums text-muted-foreground">
              {dict.pagesLeft.replace("{count}", String(pagesLeft))}
            </p>
          )}
          {status === "READING" && (
            <button
              type="button"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logPages();
              }}
              className="inline-flex w-full items-center justify-center gap-1 rounded-[6px] border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-1 font-[var(--font-sans)] text-[11px] font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              <BookPlus size={12} />
              {dict.logPagesButton.replace("{count}", String(pagesPerReadEvent))}
            </button>
          )}
          {status === "FINISHED" && (
            <button
              type="button"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                reRead();
              }}
              className="inline-flex w-full items-center justify-center gap-1 rounded-[6px] border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-1 font-[var(--font-sans)] text-[11px] font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              <RotateCcw size={12} />
              {dict.reReadButton}
            </button>
          )}
        </div>
      </Link>

      {/* Long-press status menu — rendered outside the Link so taps don't navigate */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(false);
          }}
        >
          <div
            className="w-full max-w-xs rounded-xl bg-card p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={book.title}
          >
            <h3 className="mb-3 font-[var(--font-serif)] text-sm font-semibold text-foreground line-clamp-1">
              {book.title}
            </h3>
            <div className="flex flex-col gap-1">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (s !== status) changeStatus(s);
                    setMenuOpen(false);
                  }}
                  className={`rounded-[8px] px-3 py-2 text-left font-[var(--font-sans)] text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                    s === status ? "bg-[var(--surface-elevated)] font-medium" : ""
                  }`}
                >
                  {statusLabel(s, statusLabels)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
