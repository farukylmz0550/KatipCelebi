import { db } from "@/lib/db";

/** True when no user exists yet — first-time setup required. */
export async function needsSetup(): Promise<boolean> {
  const count = await db.user.count();
  return count === 0;
}
