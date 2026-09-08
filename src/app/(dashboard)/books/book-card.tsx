"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setBookStatus } from "@/app/actions/books";
import { useSwipe } from "@/lib/touch-gestures";
import { hapticFeedback } from "@/lib/haptic";

type Book = {
  id: string;
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  rating?: number | null;
  signed?: boolean | null;
  status?: string | null;
};

const STATUS_ORDER = ["TO_READ", "READING", "FINISHED"] as const;

function getNextStatus(current: string): string {
  const idx = STATUS_ORDER.indexOf(current as (typeof STATUS_ORDER)[number]);
  if (idx === -1) return STATUS_ORDER[0];
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
}

function getPrevStatus(current: string): string {
  const idx = STATUS_ORDER.indexOf(current as (typeof STATUS_ORDER)[number]);
  if (idx === -1) return STATUS_ORDER[STATUS_ORDER.length - 1];
  return STATUS_ORDER[(idx - 1 + STATUS_ORDER.length) % STATUS_ORDER.length];
}

const STATUS_LABELS: Record<string, string> = {
  TO_READ: "Okunacak",
  READING: "Okunuyor",
  FINISHED: "Tamamlandı",
};

export function BookCard({ book, lentOut, dict }: { book: Book; lentOut: boolean; dict?: Record<string, string> }) {
  const rating = book.rating ?? 0;
  const status = book.status ?? "TO_READ";
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      hapticFeedback("medium");
      const next = getNextStatus(status);
      startTransition(async () => {
        await setBookStatus(book.id, next as "TO_READ" | "READING" | "FINISHED");
        router.refresh();
      });
    },
    onSwipeRight: () => {
      hapticFeedback("medium");
      const prev = getPrevStatus(status);
      startTransition(async () => {
        await setBookStatus(book.id, prev as "TO_READ" | "READING" | "FINISHED");
        router.refresh();
      });
    },
    threshold: 60,
  });

  return (
    <Link href={`/books/${book.id}`} className="group block" {...swipeHandlers}>
      <div className="relative mb-2.5 aspect-[3/4] overflow-hidden rounded-xl bg-muted transition-all group-hover:shadow-md">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" className="h-12 w-12 opacity-20" />
          </div>
        )}
        {lentOut && (
          <div className="absolute right-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground">
            Ödünç
          </div>
        )}
      </div>
      <p className="text-[13px] font-medium leading-snug text-foreground line-clamp-2">{book.title}</p>
      {book.author && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{book.author}</p>}
      <div className="mt-1 flex items-center gap-1.5">
        {rating > 0 && (
          <span className="text-xs text-yellow-600 dark:text-yellow-400">
            {"★".repeat(rating)}
            {"☆".repeat(5 - rating)}
          </span>
        )}
        {book.status && (
          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
            {pending ? "..." : STATUS_LABELS[book.status] ?? book.status}
          </span>
        )}
      </div>
    </Link>
  );
}
