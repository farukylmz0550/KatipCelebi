import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { AddBookForm } from "./add-book-form";
import { ImportForm } from "./import-form";
import { BooksGrid } from "./books-grid";
import { ExcelActions } from "./excel-actions";

export default async function BooksPage() {
  const userId = await requireUserId();
  const dict = await getDictionary();
  const books = await db.book.findMany({ where: { userId }, orderBy: { addedAt: "desc" } });
  const lentRecords = await db.lendingRecord.findMany({ where: { book: { userId }, returnedAt: null }, select: { bookId: true } });
  const lentSet = new Set(lentRecords.map((r) => r.bookId));
  const lentMap: Record<string, boolean> = {};
  books.forEach((b) => (lentMap[b.id] = lentSet.has(b.id)));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-foreground">{dict.books.title}</h1>
      <div className="rounded-xl border border-border bg-card p-4">
        <AddBookForm dict={dict.books} />
        <div className="mt-3">
          <ImportForm dict={dict.books} />
        </div>
        <div className="mt-3">
          <ExcelActions />
        </div>
      </div>
      <BooksGrid books={books as never} lentMap={lentMap} dict={dict.books as never} />
    </div>
  );
}
