"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Tv,
  FolderOpen,
  Wand2,
  Search,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/channels", label: "Channels", icon: Tv },
  { href: "/dashboard/media", label: "Media Library", icon: FolderOpen },
  { href: "/dashboard/generate", label: "Generate", icon: Wand2 },
  { href: "/dashboard/niche-finder", label: "Niche Finder", icon: Search },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white lg:block">
      <div className="flex h-14 items-center border-b border-zinc-200 px-6">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight text-zinc-900">
          Faceless AI
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
