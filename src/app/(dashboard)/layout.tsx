import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getDictionary, getLocale, LOCALES } from "@/i18n/get-dictionary";
import { setLocale } from "@/app/actions/locale";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const dict = await getDictionary();
  const locale = await getLocale();

  const links = [
    { href: "/books", label: dict.nav.books },
    { href: "/lending", label: dict.nav.lending },
    { href: "/stats", label: dict.nav.stats },
    { href: "/achievements", label: dict.nav.achievements },
    { href: "/leaderboard", label: dict.nav.leaderboard },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <nav className="flex gap-4 text-sm font-medium">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-neutral-700 hover:text-neutral-950">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <form action={async () => {
              "use server";
              const next = locale === "en" ? "tr" : "en";
              await setLocale(next);
            }}>
              <button type="submit" className="rounded border border-neutral-300 px-2 py-1">
                {LOCALES.filter((l) => l !== locale)[0]}
              </button>
            </form>
            <span className="text-neutral-500">{session?.user?.name}</span>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
              <button type="submit" className="underline text-neutral-600">
                {dict.nav.logout}
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
