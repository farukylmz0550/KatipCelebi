import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { needsSetup } from "@/lib/setup";

export default async function HomePage() {
  if (await needsSetup()) redirect("/setup");
  const session = await auth();
  redirect(session ? "/books" : "/login");
}
