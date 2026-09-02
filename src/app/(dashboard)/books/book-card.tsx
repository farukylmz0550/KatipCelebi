"use client";

import Link from "next/link";

type Book = {
  id: string;
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  rating?: number | null;
  signed?: boolean | null;
  status?: string | null;
};

export function BookCard({ book, lentOut }: { book: Book; lentOut: boolean }) {
  const rating = book.rating ?? 0;
  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex flex-col"
    >
      <div className="relative mb-2.5 aspect-[3/4] overflow-hidden bg-muted transition-transform duration-300 group-hover:scale-[1.02]">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-3xl opacity-30">📖</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="text-xs text-white/90 line-clamp-1">{book.author}</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">{book.title}</p>
        {book.author && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{book.author}</p>}
        <div className="mt-1 flex items-center gap-2">
          {rating > 0 && (
            <span className="text-xs tracking-tight text-amber-600 dark:text-amber-400">
              {"★".repeat(rating)}{"☆".repeat(5 - rating)}
            </span>
          )}
          {book.status && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {book.status}
            </span>
          )}
          {lentOut && <span className="text-[10px] text-muted-foreground">on loan</span>}
        </div>
      </div>
    </Link>
  );
}
