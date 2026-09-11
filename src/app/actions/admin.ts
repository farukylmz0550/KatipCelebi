"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function getUsers() {
  await requireAdmin();
  return db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      approved: true,
      xp: true,
      createdAt: true,
      _count: { select: { books: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function approveUser(userId: string) {
  await requireAdmin();
  await db.user.update({ where: { id: userId }, data: { approved: true } });
  return { ok: true };
}

export async function rejectUser(userId: string) {
  await requireAdmin();
  await db.user.update({ where: { id: userId }, data: { approved: false } });
  return { ok: true };
}

export async function toggleAdmin(userId: string) {
  await requireAdmin();
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { isAdmin: true } });
  if (user.isAdmin) {
    const adminCount = await db.user.count({ where: { isAdmin: true } });
    if (adminCount <= 1) throw new Error("Cannot demote the last admin");
  }
  await db.user.update({ where: { id: userId }, data: { isAdmin: !user.isAdmin } });
  return { ok: true };
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { isAdmin: true } });
  if (user.isAdmin) {
    const adminCount = await db.user.count({ where: { isAdmin: true } });
    if (adminCount <= 1) throw new Error("Cannot delete the last admin");
  }
  await db.user.delete({ where: { id: userId } });
  return { ok: true };
}
