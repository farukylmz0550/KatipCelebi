import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { getDictionary } from "@/i18n/get-dictionary";
import { Users } from "lucide-react";
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
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{dict.people.title}</h1>
          <p className="text-sm text-muted-foreground">{dict.people.count}: {personsWithStats.length}</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <PersonForm placeholder={dict.people.namePlaceholder} addLabel={dict.people.add} removeLabel={dict.people.remove} selectedId={selectedPerson?.id} />
      </section>

      {personsWithStats.length === 0 ? (
        <p className="text-muted-foreground">{dict.people.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{dict.people.title}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{dict.people.trust}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{dict.people.returned}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{dict.people.out}</th>
              </tr>
            </thead>
            <tbody>
              {personsWithStats.map((p) => (
                <tr key={p.id} className={`border-t border-border transition-colors ${p.id === selectedId ? "bg-accent/50" : "bg-card hover:bg-accent/50"}`}>
                  <td className="px-4 py-3">
                    <Link href={`/people?person=${p.id}`} className="font-medium text-primary hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">{p.trust}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{p.returned}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{p.out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPerson && (
        <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-medium">
            {dict.people.historyFor} {selectedPerson.name}
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">{dict.people.historyEmpty}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-2 py-1">Book</th>
                  <th className="px-2 py-1">Lent</th>
                  <th className="px-2 py-1">Returned</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-2 py-1">{r.bookTitle ?? r.book?.title ?? r.bookId}</td>
                    <td className="px-2 py-1">{new Date(r.lentAt).toLocaleDateString()}</td>
                    <td className="px-2 py-1">{r.returnedAt ? new Date(r.returnedAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}
