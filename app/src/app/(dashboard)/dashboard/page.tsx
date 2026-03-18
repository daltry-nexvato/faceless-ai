"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useChannelStore } from "@/stores/channel-store";
import { ChannelCard } from "@/components/channels/channel-card";
import { CreateChannelDialog } from "@/components/channels/create-channel-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { channels, isLoading, fetchChannels } = useChannelStore();

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const activeChannels = channels.filter((ch) => !ch.isArchived);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Welcome back, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-zinc-500">
            Here&apos;s an overview of your channels.
          </p>
          {user?.role === "admin" && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
              Admin
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Your Channels</h2>
          <CreateChannelDialog />
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : activeChannels.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center">
            <h3 className="text-lg font-medium text-zinc-900">
              Create your first channel
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Start by creating a channel. You can plan it first or connect YouTube right away.
            </p>
            <div className="mt-4">
              <CreateChannelDialog />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeChannels.map((channel) => (
              <ChannelCard key={channel.channelId} channel={channel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
