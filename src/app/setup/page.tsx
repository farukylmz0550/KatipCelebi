import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import SetupForm from "./setup-form";

export default async function SetupPage() {
  const userCount = await db.user.count();
  if (userCount > 0) redirect("/login");
  const dict = await getDictionary();
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <SetupForm dict={dict.auth} />
    </main>
  );
}
