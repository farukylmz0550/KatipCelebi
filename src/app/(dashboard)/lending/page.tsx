import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { HandCoins } from "lucide-react";
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
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <HandCoins size={20} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{dict.lending.title}</h1>
      </div>
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <LendingForm books={books} dict={dict.lending} />
      </section>
      <ul className="space-y-2">
        {records.length === 0 && (
          <p className="text-muted-foreground">{dict.lending.empty}</p>
        )}
        {records.map((record) => (
          <LendingRow key={record.id} record={record} dict={dict.lending} />
        ))}
      </ul>
    </div>
  );
}
