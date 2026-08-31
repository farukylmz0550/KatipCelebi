import { auth } from "@/auth";

/** Throws if there is no authenticated session; otherwise returns the user id. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}
