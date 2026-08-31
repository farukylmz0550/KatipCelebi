import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { AddBookForm } from "./add-book-form";
import { ImportForm } from "./import-form";
import { BookRow } from "./book-row";

export default async function BooksPage() {
  const userId = await requireUserId();
  const dict = await getDictionary();
  const books = await db.book.findMany({ where: { userId }, orderBy: { addedAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.books.title}</h1>
      <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <AddBookForm dict={dict.books} />
        <ImportForm dict={dict.books} />
      </section>
      <ul className="space-y-2">
        {books.length === 0 && <p className="text-neutral-500 dark:text-neutral-400">{dict.books.empty}</p>}
        {books.map((book) => (
          <BookRow key={book.id} book={book} dict={dict.books} />
        ))}
      </ul>
    </div>
  );
}
