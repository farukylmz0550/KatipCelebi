"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { normalizeName } from "@/lib/person";

export async function createPerson(name: string) {
  const userId = await requireUserId();
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name required" };
  const normalized = normalizeName(trimmed);
  // Dedup case-insensitive
  const existing = await db.person.findFirst({ where: { userId, name: { equals: trimmed } } });
  // Also check normalized
  const all = await db.person.findMany({ where: { userId }, select: { name: true } });
  if (all.some((p) => normalizeName(p.name) === normalized)) {
    return { error: "Person already exists" };
  }
  if (existing) return { error: "Person already exists" };
  await db.person.create({ data: { userId, name: trimmed } });
  revalidatePath("/people");
  revalidatePath("/lending");
  return { ok: true };
}

export async function removePerson(personId: string) {
  const userId = await requireUserId();
  const person = await db.person.findFirst({ where: { id: personId, userId } });
  if (!person) return { error: "Not found" };
  const outCount = await db.lendingRecord.count({ where: { personId, returnedAt: null } });
  if (outCount > 0) return { error: "Still has books out" };
  await db.person.delete({ where: { id: personId } });
  revalidatePath("/people");
  revalidatePath("/lending");
  return { ok: true };
}

export async function getPeopleWithStats() {
  const userId = await requireUserId();
  const persons = await db.person.findMany({ where: { userId }, orderBy: { name: "asc" } });
  const stats = await Promise.all(
    persons.map(async (p) => {
      const [out, returned] = await Promise.all([
        db.lendingRecord.count({ where: { personId: p.id, returnedAt: null } }),
        db.lendingRecord.count({ where: { personId: p.id, returnedAt: { not: null } } }),
      ]);
      return { ...p, out, returned, trust: returned - out };
    })
  );
  return stats;
}
