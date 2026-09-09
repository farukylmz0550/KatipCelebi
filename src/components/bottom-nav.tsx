"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Handshake, BarChart3, MoreHorizontal } from "lucide-react";

interface BottomNavProps {
  dict: {
    books: string;
    lending: string;
    stats: string;
    more: string;
  };
}

const tabs = [
  { href: "/books", icon: BookOpen, key: "books" as const },
  { href: "/lending", icon: Handshake, key: "lending" as const },
  { href: "/stats", icon: BarChart3, key: "stats" as const },
  { href: "/more", icon: MoreHorizontal, key: "more" as const },
];

export function BottomNav({ dict }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom md:hidden">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              title={dict[tab.key]}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                isActive ? "bg-primary/12 text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
