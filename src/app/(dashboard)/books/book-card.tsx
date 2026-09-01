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
  const stars = rating > 0 ? "★".repeat(rating) + "☆".repeat(5 - rating) : "";
  return (
    <Link href={`/books/${book.id}`} className="flex w-[160px] flex-col rounded-lg border border-neutral-200 bg-white p-2 hover:shadow dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex h-[210px] w-[150px] items-center justify-center overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl">📖</span>
        )}
      </div>
      <div className="mt-2 space-y-1">
        <p className="line-clamp-2 text-sm font-medium leading-tight">{book.author ? `${book.author} — ${book.title}` : book.title}</p>
        {stars && <p className="text-xs text-amber-500">{stars}</p>}
        <div className="flex gap-1 text-xs">
          {book.status && <span className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">{book.status}</span>}
          {lentOut && <span title="Lent out">👤</span>}
          {book.signed && <span title="Signed">✍️</span>}
        </div>
      </div>
    </Link>
  );
}
