"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function getCoverStats() {
  await requireAdmin();
  const count = await db.book.count({ where: { coverUrl: { not: null } } });
  const books = await db.book.findMany({ where: { coverUrl: { not: null } }, select: { coverUrl: true } });
  const totalUrlBytes = books.reduce((acc, b) => acc + (b.coverUrl?.length ?? 0), 0);
  return { count, totalUrlBytes };
}

export async function clearCoverCache() {
  await requireAdmin();
  // Admin clears all covers (self-host single tenant, admin can clear globally)
  // For safety, clear only admin's books if you want per-user: change to { userId }
  await db.book.updateMany({ where: { coverUrl: { not: null } }, data: { coverUrl: null, coverFetchedAt: null } });
  revalidatePath("/admin/covers");
  return { ok: true };
}
