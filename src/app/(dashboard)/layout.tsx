import Link from "next/link";
import { Moon, Sun, BookOpen, Users, HandCoins, BarChart3, Trophy, Medal, User, Shield } from "lucide-react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getDictionary, getLocale, LOCALES } from "@/i18n/get-dictionary";
import { setLocale } from "@/app/actions/locale";
import { getTheme } from "@/lib/theme";
import { setTheme } from "@/app/actions/theme";
import { needsSetup } from "@/lib/setup";

const navIcons: Record<string, React.ReactNode> = {
  "/books": <BookOpen size={16} />,
  "/people": <Users size={16} />,
  "/lending": <HandCoins size={16} />,
  "/stats": <BarChart3 size={16} />,
  "/achievements": <Trophy size={16} />,
  "/leaderboard": <Medal size={16} />,
  "/profile": <User size={16} />,
  "/admin/covers": <Shield size={16} />,
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (await needsSetup()) redirect("/setup");
  const session = await auth();
  const dict = await getDictionary();
  const locale = await getLocale();
  const theme = await getTheme();

  let isAdmin = false;
  if (session?.user?.id) {
    const { db } = await import("@/lib/db");
    const u = await db.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } });
    isAdmin = !!u?.isAdmin;
  }

  const links = [
    { href: "/books", label: dict.nav.books },
    { href: "/people", label: dict.nav.people },
    { href: "/lending", label: dict.nav.lending },
    { href: "/stats", label: dict.nav.stats },
    { href: "/achievements", label: dict.nav.achievements },
    { href: "/leaderboard", label: dict.nav.leaderboard },
    { href: "/profile", label: dict.profile?.title ?? "Profile" },
    ...(isAdmin ? [{ href: "/admin/covers", label: "Admin" }] : []),
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/books" className="flex items-center gap-2 text-lg font-semibold text-primary">
            <BookOpen size={20} />
            <span className="hidden sm:inline">KatipCelebi</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {navIcons[link.href]}
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <form
              action={async () => {
                "use server";
                await setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              <button
                type="submit"
                aria-label="Toggle theme"
                className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </form>
            <form
              action={async () => {
                "use server";
                const idx = LOCALES.indexOf(locale);
                const next = LOCALES[(idx + 1) % LOCALES.length];
                await setLocale(next);
              }}
            >
              <button type="submit" className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" title={locale}>
                {locale.toUpperCase()}
              </button>
            </form>
            <span className="hidden sm:inline text-muted-foreground">{session?.user?.name}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-destructive">
                {dict.nav.logout}
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
