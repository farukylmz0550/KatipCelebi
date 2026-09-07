import { redirect } from "next/navigation";
import { needsSetup } from "@/lib/setup";
import { getDictionary } from "@/i18n/get-dictionary";
import LoginForm from "./login-form";

export default async function LoginPage() {
  if (await needsSetup()) redirect("/setup");
  const dict = await getDictionary();
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <LoginForm dict={dict.auth} />
    </main>
  );
}
