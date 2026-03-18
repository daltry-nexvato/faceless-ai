"use client";

import Link from "next/link";
import type { Channel } from "@/lib/types/channels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tv, Youtube } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  connected: "bg-green-100 text-green-700",
  disconnected: "bg-yellow-100 text-yellow-700",
  suspended: "bg-red-100 text-red-700",
};

export function ChannelCard({ channel }: { channel: Channel }) {
  const initials = channel.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/dashboard/channels/${channel.channelId}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <Avatar className="h-10 w-10">
            {channel.youtubeAvatarUrl ? (
              <AvatarImage src={channel.youtubeAvatarUrl} alt={channel.name} />
            ) : null}
            <AvatarFallback className="bg-zinc-200 text-sm font-medium text-zinc-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{channel.name}</CardTitle>
            {channel.niche && (
              <p className="text-xs text-zinc-500 truncate">{channel.niche}</p>
            )}
          </div>
          <Badge variant="secondary" className={statusColors[channel.status] || ""}>
            {channel.status === "draft" ? "Draft" : channel.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            {channel.status === "connected" ? (
              <>
                <div className="flex items-center gap-1">
                  <Youtube className="h-3.5 w-3.5" />
                  <span>{channel.youtubeChannelName || "Connected"}</span>
                </div>
                {channel.subscriberCount !== null && (
                  <span>{channel.subscriberCount.toLocaleString()} subscribers</span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Tv className="h-3.5 w-3.5" />
                <span>Planning mode — connect YouTube to publish</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
