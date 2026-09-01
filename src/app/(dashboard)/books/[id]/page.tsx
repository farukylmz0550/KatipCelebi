import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { BookFacts } from "./book-facts";
import { BookPersonal } from "./book-personal";
import { BookLending } from "./book-lending";

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const dict = await getDictionary();
  const book = await db.book.findFirst({ where: { id, userId } });
  if (!book) notFound();

  const lendings = await db.lendingRecord.findMany({ where: { bookId: id }, orderBy: { lentAt: "desc" } });
  const lentOut = lendings.filter((l) => !l.returnedAt).length;
  const persons = await db.person.findMany({ where: { userId }, select: { id: true, name: true } });

  return (
    <div className="mx-auto max-w-[680px] space-y-6">
      <Link href="/books" className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
        ← Back
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex h-[380px] w-[260px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-6xl">📖</span>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-semibold">{book.title}</h1>
          {book.author && <p className="text-neutral-600 dark:text-neutral-400">{book.author}</p>}
          {book.isbn && <p className="text-sm font-mono text-neutral-500">{book.isbn}</p>}
          <div className="flex gap-2 text-xs">
            {book.status && <span className="rounded bg-neutral-100 px-2 py-1 dark:bg-neutral-800">{book.status}</span>}
            {lentOut > 0 && <span className="rounded bg-amber-100 px-2 py-1 dark:bg-amber-900">👤 {lentOut} out</span>}
            {book.signed && <span className="rounded bg-blue-100 px-2 py-1 dark:bg-blue-900">✍️ Signed</span>}
            {book.copies > 1 && <span className="rounded bg-neutral-100 px-2 py-1 dark:bg-neutral-800">{book.copies} copies</span>}
          </div>
        </div>
      </div>

      <BookFacts book={book} />
      <BookPersonal book={book} dict={dict.books} />
      <BookLending book={book} lendings={lendings} persons={persons} dict={dict.lending} />
    </div>
  );
}
