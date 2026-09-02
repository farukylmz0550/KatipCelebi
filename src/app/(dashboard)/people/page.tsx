import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { PersonForm } from "./person-form";
import Link from "next/link";

export default async function PeoplePage({ searchParams }: { searchParams?: Promise<{ person?: string }> }) {
  const userId = await requireUserId();
  const dict = await getDictionary();
  const params = await searchParams;
  const selectedId = params?.person;

  const persons = await db.person.findMany({ where: { userId }, orderBy: { name: "asc" } });
  const personsWithStats = await Promise.all(
    persons.map(async (p) => {
      const [out, returned] = await Promise.all([
        db.lendingRecord.count({ where: { personId: p.id, returnedAt: null } }),
        db.lendingRecord.count({ where: { personId: p.id, returnedAt: { not: null } } }),
      ]);
      return { ...p, out, returned, trust: returned - out };
    })
  );

  const selectedPerson = selectedId ? personsWithStats.find((p) => p.id === selectedId) : null;
  const history = selectedPerson
    ? await db.lendingRecord.findMany({
        where: { personId: selectedPerson.id },
        include: { book: { select: { title: true } } },
        orderBy: { lentAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-foreground">{dict.people.title}</h1>
        <p className="text-xs text-muted-foreground">{dict.people.count}: {personsWithStats.length}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <PersonForm placeholder={dict.people.namePlaceholder} addLabel={dict.people.add} removeLabel={dict.people.remove} selectedId={selectedPerson?.id} />
      </div>
      {personsWithStats.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{dict.people.empty}</p>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_5rem_5rem_5rem] gap-4 border-b border-border bg-muted/50 px-4 py-2">
            <span className="text-[11px] text-muted-foreground">{dict.people.title}</span>
            <span className="text-[11px] text-center text-muted-foreground">{dict.people.trust}</span>
            <span className="text-[11px] text-center text-muted-foreground">{dict.people.returned}</span>
            <span className="text-[11px] text-center text-muted-foreground">{dict.people.out}</span>
          </div>
          {personsWithStats.map((p) => (
            <div key={p.id} className={`grid grid-cols-[1fr_5rem_5rem_5rem] items-center gap-4 border-b border-border last:border-b-0 px-4 py-2.5 transition-colors ${p.id === selectedId ? "bg-primary/5" : ""}`}>
              <Link href={`/people?person=${p.id}`} className="text-sm font-medium text-primary hover:underline">
                {p.name}
              </Link>
              <span className="text-center text-sm tabular-nums text-muted-foreground">{p.trust}</span>
              <span className="text-center text-sm tabular-nums text-muted-foreground">{p.returned}</span>
              <span className="text-center text-sm tabular-nums text-muted-foreground">{p.out}</span>
            </div>
          ))}
        </div>
      )}
      {selectedPerson && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/50 px-4 py-2">
            <p className="text-[11px] text-muted-foreground">{dict.people.historyFor} {selectedPerson.name}</p>
          </div>
          {history.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted-foreground">{dict.people.historyEmpty}</p>
          ) : (
            <div>
              <div className="grid grid-cols-[1fr_8rem_8rem] gap-4 border-b border-border bg-muted/30 px-4 py-2">
                <span className="text-[11px] text-muted-foreground">Book</span>
                <span className="text-[11px] text-muted-foreground">Lent</span>
                <span className="text-[11px] text-muted-foreground">Returned</span>
              </div>
              {history.map((r) => (
                <div key={r.id} className="grid grid-cols-[1fr_8rem_8rem] gap-4 border-b border-border last:border-b-0 px-4 py-2">
                  <span className="text-sm text-foreground">{r.bookTitle ?? r.book?.title ?? r.bookId}</span>
                  <span className="text-sm text-muted-foreground">{new Date(r.lentAt).toLocaleDateString()}</span>
                  <span className="text-sm text-muted-foreground">{r.returnedAt ? new Date(r.returnedAt).toLocaleDateString() : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
