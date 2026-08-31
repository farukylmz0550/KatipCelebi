import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { LendingForm } from "./lending-form";
import { LendingRow } from "./lending-row";

export default async function LendingPage() {
  const userId = await requireUserId();
  const dict = await getDictionary();

  const [books, records] = await Promise.all([
    db.book.findMany({ where: { userId }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.lendingRecord.findMany({
      where: { book: { userId } },
      include: { book: { select: { title: true } } },
      orderBy: { lentAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.lending.title}</h1>
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <LendingForm books={books} dict={dict.lending} />
      </section>
      <ul className="space-y-2">
        {records.length === 0 && <p className="text-neutral-500">{dict.lending.empty}</p>}
        {records.map((record) => (
          <LendingRow key={record.id} record={record} dict={dict.lending} />
        ))}
      </ul>
    </div>
  );
}
