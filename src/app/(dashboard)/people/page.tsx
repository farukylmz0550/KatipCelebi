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
      <h1 className="text-2xl font-semibold">{dict.people.title}</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{dict.people.count}: {personsWithStats.length}</p>

      <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <PersonForm placeholder={dict.people.namePlaceholder} addLabel={dict.people.add} removeLabel={dict.people.remove} selectedId={selectedPerson?.id} />
      </section>

      {personsWithStats.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400">{dict.people.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-800">
              <tr>
                <th className="px-3 py-2 text-left">{dict.people.title}</th>
                <th className="px-3 py-2 text-center">{dict.people.trust}</th>
                <th className="px-3 py-2 text-center">{dict.people.returned}</th>
                <th className="px-3 py-2 text-center">{dict.people.out}</th>
                <th className="px-3 py-2 text-center">{dict.people.id}</th>
              </tr>
            </thead>
            <tbody>
              {personsWithStats.map((p) => (
                <tr key={p.id} className={p.id === selectedId ? "bg-neutral-50 dark:bg-neutral-900" : "bg-white dark:bg-neutral-900"}>
                  <td className="px-3 py-2">
                    <Link href={`/people?person=${p.id}`} className="underline hover:text-neutral-900 dark:hover:text-white">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums">{p.trust}</td>
                  <td className="px-3 py-2 text-center tabular-nums">{p.returned}</td>
                  <td className="px-3 py-2 text-center tabular-nums">{p.out}</td>
                  <td className="px-3 py-2 text-center font-mono text-xs">{p.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPerson && (
        <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-medium">
            {dict.people.historyFor} {selectedPerson.name} — {dict.people.history}
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{dict.people.historyEmpty}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 dark:text-neutral-400">
                  <th className="px-2 py-1">Book</th>
                  <th className="px-2 py-1">Lent</th>
                  <th className="px-2 py-1">Returned</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-800">
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
