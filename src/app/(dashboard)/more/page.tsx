import Link from "next/link";
import { Trophy, TrendingUp, Settings, Shield, Image } from "lucide-react";
import { auth } from "@/auth";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function MorePage() {
  const session = await auth();
  const dict = await getDictionary();

  let isAdmin = false;
  if (session?.user?.id) {
    const { db } = await import("@/lib/db");
    const u = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    isAdmin = !!u?.isAdmin;
  }

  const items = [
    {
      href: "/achievements",
      icon: Trophy,
      label: dict.nav.achievements,
    },
    {
      href: "/leaderboard",
      icon: TrendingUp,
      label: dict.nav.leaderboard,
    },
    {
      href: "/settings",
      icon: Settings,
      label: dict.nav.settings,
    },
  ];

  if (isAdmin) {
    items.push(
      { href: "/admin/users", icon: Shield, label: dict.common.admin },
      { href: "/admin/covers", icon: Image, label: "Covers" }
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Icon size={18} className="text-muted-foreground" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
