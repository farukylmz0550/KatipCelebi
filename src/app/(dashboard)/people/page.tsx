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
    <div>
      <div className="mb-8">
        <p className="editorial-label mb-2">Contacts</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {dict.people.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{personsWithStats.length} {dict.people.count}</p>
        <div className="editorial-rule-accent mt-4" />
      </div>

      <div className="mb-8">
        <PersonForm placeholder={dict.people.namePlaceholder} addLabel={dict.people.add} removeLabel={dict.people.remove} selectedId={selectedPerson?.id} />
      </div>

      {personsWithStats.length === 0 ? (
        <p className="text-muted-foreground">{dict.people.empty}</p>
      ) : (
        <div className="border-t border-border">
          <div className="grid grid-cols-[1fr_5rem_5rem_5rem] gap-4 border-b border-border px-4 py-2">
            <span className="editorial-label">{dict.people.title}</span>
            <span className="editorial-label text-center">{dict.people.trust}</span>
            <span className="editorial-label text-center">{dict.people.returned}</span>
            <span className="editorial-label text-center">{dict.people.out}</span>
          </div>
          {personsWithStats.map((p) => (
            <div key={p.id} className={`grid grid-cols-[1fr_5rem_5rem_5rem] items-center gap-4 border-b border-border px-4 py-3 transition-colors ${p.id === selectedId ? "bg-foreground/[0.04]" : ""}`}>
              <Link href={`/people?person=${p.id}`} className="text-sm font-medium hover:underline">
                {p.name}
              </Link>
              <span className="text-center text-sm tabular-nums">{p.trust}</span>
              <span className="text-center text-sm tabular-nums text-muted-foreground">{p.returned}</span>
              <span className="text-center text-sm tabular-nums text-muted-foreground">{p.out}</span>
            </div>
          ))}
        </div>
      )}

      {selectedPerson && (
        <div className="mt-8">
          <p className="editorial-label mb-3">{dict.people.historyFor} {selectedPerson.name}</p>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">{dict.people.historyEmpty}</p>
          ) : (
            <div className="border-t border-border">
              <div className="grid grid-cols-[1fr_8rem_8rem] gap-4 border-b border-border px-4 py-2">
                <span className="editorial-label">Book</span>
                <span className="editorial-label">Lent</span>
                <span className="editorial-label">Returned</span>
              </div>
              {history.map((r) => (
                <div key={r.id} className="grid grid-cols-[1fr_8rem_8rem] gap-4 border-b border-border px-4 py-2">
                  <span className="text-sm">{r.bookTitle ?? r.book?.title ?? r.bookId}</span>
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
