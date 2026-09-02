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
    <Link href={`/books/${book.id}`} className="group block">
      <div className="relative mb-2 aspect-[3/4] overflow-hidden rounded-xl bg-muted transition-shadow group-hover:shadow-md">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl opacity-20">📖</span>
          </div>
        )}
      </div>
      <p className="text-[13px] font-medium leading-snug text-foreground line-clamp-2">{book.title}</p>
      {book.author && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{book.author}</p>}
      <div className="mt-1 flex items-center gap-1.5">
        {rating > 0 && (
          <span className="text-xs text-yellow-600 dark:text-yellow-400">
            {"★".repeat(rating)}{"☆".repeat(5 - rating)}
          </span>
        )}
        {book.status && (
          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
            {book.status}
          </span>
        )}
        {lentOut && <span className="text-[10px] text-muted-foreground">on loan</span>}
      </div>
    </Link>
  );
}
