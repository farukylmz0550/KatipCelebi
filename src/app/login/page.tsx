import { redirect } from "next/navigation";
import { needsSetup } from "@/lib/setup";
import LoginForm from "./login-form";

export default async function LoginPage() {
  if (await needsSetup()) redirect("/setup");
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}
