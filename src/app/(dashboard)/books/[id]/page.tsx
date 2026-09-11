import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { BookFacts } from "./book-facts";
import { BookPersonal } from "./book-personal";
import { BookLending } from "./book-lending";
import { ShareButton } from "@/components/share-button";

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
      <Link
        href="/books"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {dict.books.back}
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="paper-surface flex h-[380px] w-[260px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface-elevated)]">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-6xl">📖</span>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-2">
            <h1 className="text-2xl font-semibold flex-1">{book.title}</h1>
            <ShareButton title={book.title} author={book.author ?? undefined} />
          </div>
          {book.author && <p className="text-muted-foreground">{book.author}</p>}
          {book.isbn && <p className="text-sm font-mono text-muted-foreground">{book.isbn}</p>}
          <div className="flex gap-2 text-xs">
            {book.status && (
              <span className="rounded-[8px] bg-[var(--secondary)] px-2 py-1 text-[var(--secondary-foreground)]">
                {(dict.books.status as Record<string, string>)[book.status] ?? book.status}
              </span>
            )}
            {lentOut > 0 && (
              <span className="rounded-[8px] bg-[var(--warning-soft)] px-2 py-1 text-[var(--warning-text)]">
                👤 {lentOut} {dict.books.out}
              </span>
            )}
            {book.signed && (
              <span className="rounded-[8px] bg-[var(--info-soft)] px-2 py-1 text-[var(--info-text)]">
                ✍️ {dict.books.signedBadge}
              </span>
            )}
            {book.copies > 1 && (
              <span className="rounded-[8px] bg-[var(--secondary)] px-2 py-1 text-[var(--secondary-foreground)]">
                {book.copies} {dict.books.copies}
              </span>
            )}
          </div>
        </div>
      </div>

      <BookFacts book={book} dict={dict.facts} />
      <BookPersonal book={book} dict={dict.personal} />
      <BookLending book={book} lendings={lendings} persons={persons} dict={dict.bookLending} />
    </div>
  );
}
