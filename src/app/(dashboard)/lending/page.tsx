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

  const active = records.filter((r) => !r.returnedAt);
  const returned = records.filter((r) => r.returnedAt);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-foreground">{dict.lending.title}</h1>
      <div className="rounded-xl border border-border bg-card p-4">
        <LendingForm books={books} dict={dict.lending} />
      </div>
      {records.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{dict.lending.empty}</p>
      ) : (
        <div className="space-y-4">
          {active.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border bg-muted/50 px-4 py-2">
                <p className="text-[11px] text-muted-foreground">Active Loans</p>
              </div>
              {active.map((record) => (
                <LendingRow key={record.id} record={record} dict={dict.lending} />
              ))}
            </div>
          )}
          {returned.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border bg-muted/50 px-4 py-2">
                <p className="text-[11px] text-muted-foreground">Returned</p>
              </div>
              {returned.map((record) => (
                <LendingRow key={record.id} record={record} dict={dict.lending} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
