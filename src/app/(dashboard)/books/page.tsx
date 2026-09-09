import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { BooksAddSection } from "./books-add-section";
import { BooksGrid } from "./books-grid";
import { ExcelActions } from "./excel-actions";

export default async function BooksPage() {
  const userId = await requireUserId();
  const dict = await getDictionary();
  const books = await db.book.findMany({ where: { userId }, orderBy: { addedAt: "desc" } });
  const lentRecords = await db.lendingRecord.findMany({
    where: { book: { userId }, returnedAt: null },
    select: { bookId: true },
  });
  const lentSet = new Set(lentRecords.map((r) => r.bookId));
  const lentMap: Record<string, boolean> = {};
  books.forEach((b) => (lentMap[b.id] = lentSet.has(b.id)));

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-[var(--font-serif)] text-2xl font-semibold tracking-tight text-foreground">
          {dict.books.title}
        </h1>
        <p className="font-[var(--font-sans)] text-sm text-muted-foreground">
          {books.length} {dict.common.books} · {dict.books.addBook}
        </p>
      </header>
      <BooksAddSection dict={dict.books as never} excel={<ExcelActions dict={dict.excel} />} />
      <BooksGrid books={books as never} lentMap={lentMap} dict={{ ...dict.books, filter: dict.filter } as never} />
    </div>
  );
}
