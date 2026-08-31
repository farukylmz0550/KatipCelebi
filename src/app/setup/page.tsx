import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SetupForm from "./setup-form";

export default async function SetupPage() {
  const userCount = await db.user.count();
  if (userCount > 0) redirect("/login");

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <SetupForm />
    </main>
  );
}
