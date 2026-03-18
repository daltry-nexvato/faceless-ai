"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Channel } from "@/lib/types/channels";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Video,
  Search,
  BookOpen,
  Palette,
  BarChart3,
  Calendar,
  Settings,
  ArrowLeft,
} from "lucide-react";

const channelNavItems = [
  { path: "", label: "Dashboard", icon: LayoutDashboard },
  { path: "/projects", label: "Projects", icon: Video },
  { path: "/niche-finder", label: "Niche Finder", icon: Search },
  { path: "/research-board", label: "Research Board", icon: BookOpen },
  { path: "/style", label: "Style", icon: Palette },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/schedule", label: "Schedule", icon: Calendar },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function ChannelSidebar({ channel }: { channel: Channel }) {
  const pathname = usePathname();
  const basePath = `/dashboard/channels/${channel.channelId}`;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white lg:block">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4">
        <Link
          href="/dashboard/channels"
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">
            {channel.name}
          </p>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] px-1.5 py-0",
              channel.status === "draft"
                ? "bg-zinc-100 text-zinc-600"
                : "bg-green-100 text-green-700"
            )}
          >
            {channel.status}
          </Badge>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {channelNavItems.map((item) => {
          const href = `${basePath}${item.path}`;
          const isActive = item.path === ""
            ? pathname === basePath
            : pathname.startsWith(href);

          return (
            <Link
              key={item.path}
              href={href}
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
