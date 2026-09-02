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
    <div>
      <div className="mb-8">
        <p className="editorial-label mb-2">Lending</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {dict.lending.title}
        </h1>
        <div className="editorial-rule-accent mt-4" />
      </div>

      <div className="mb-8">
        <LendingForm books={books} dict={dict.lending} />
      </div>

      {records.length === 0 ? (
        <p className="text-muted-foreground">{dict.lending.empty}</p>
      ) : (
        <div>
          {active.length > 0 && (
            <div className="mb-8">
              <p className="editorial-label mb-3">Active</p>
              <div className="space-y-px">
                {active.map((record) => (
                  <LendingRow key={record.id} record={record} dict={dict.lending} />
                ))}
              </div>
            </div>
          )}
          {returned.length > 0 && (
            <div>
              <p className="editorial-label mb-3">Returned</p>
              <div className="space-y-px">
                {returned.map((record) => (
                  <LendingRow key={record.id} record={record} dict={dict.lending} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
