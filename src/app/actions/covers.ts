"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function getCoverStats() {
  await requireAdmin();
  const count = await db.book.count({ where: { coverUrl: { not: null } } });
  const books = await db.book.findMany({ where: { coverUrl: { not: null } }, select: { coverUrl: true } });
  // Estimate size: URLs avg ~80 chars, plus overhead
  const estimatedBytes = books.reduce((acc, b) => acc + (b.coverUrl?.length ?? 0), 0);
  const mb = estimatedBytes / (1024 * 1024);
  return { count, mb };
}

export async function clearCoverCache() {
  const userId = await requireAdmin();
  // Admin clears all covers (self-host single tenant, admin can clear globally)
  // For safety, clear only admin's books if you want per-user: change to { userId }
  await db.book.updateMany({ where: { coverUrl: { not: null } }, data: { coverUrl: null, coverFetchedAt: null } });
  revalidatePath("/admin/covers");
  return { ok: true };
}
