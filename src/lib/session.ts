// SPDX-License-Identifier: GPL-3.0-only
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/** Throws if there is no authenticated session; otherwise returns the user id. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function requireAdmin(): Promise<string> {
  const userId = await requireUserId();
  const user = await db.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (!user?.isAdmin) throw new Error("Forbidden: admin only");
  return userId;
}

/** For server components: redirects non-admins to /books instead of crashing. */
export async function requireAdminPage(): Promise<string> {
  const userId = await requireUserId();
  const user = await db.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (!user?.isAdmin) redirect("/books");
  return userId;
}
