"use client";

import { useEffect } from "react";
import { useChannelStore } from "@/stores/channel-store";
import { ChannelCard } from "@/components/channels/channel-card";
import { CreateChannelDialog } from "@/components/channels/create-channel-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tv } from "lucide-react";

export default function ChannelsPage() {
  const { channels, isLoading, fetchChannels } = useChannelStore();

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const activeChannels = channels.filter((ch) => !ch.isArchived);
  const archivedChannels = channels.filter((ch) => ch.isArchived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Channels</h1>
          <p className="text-sm text-zinc-500">
            Manage your faceless YouTube channels
          </p>
        </div>
        <CreateChannelDialog />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : activeChannels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 py-16">
          <Tv className="h-12 w-12 text-zinc-300" />
          <h3 className="mt-4 text-lg font-medium text-zinc-900">
            No channels yet
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Create your first channel to start making videos.
          </p>
          <div className="mt-6">
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

      {archivedChannels.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-700">Archived</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-60">
            {archivedChannels.map((channel) => (
              <ChannelCard key={channel.channelId} channel={channel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
