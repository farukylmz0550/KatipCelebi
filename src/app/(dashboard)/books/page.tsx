import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { BookOpen } from "lucide-react";
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
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookOpen size={20} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{dict.books.title}</h1>
      </div>
      <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <AddBookForm dict={dict.books} />
        <ImportForm dict={dict.books} />
        <ExcelActions />
      </section>
      <BooksGrid books={books as never} lentMap={lentMap} dict={dict.books as never} />
    </div>
  );
}
