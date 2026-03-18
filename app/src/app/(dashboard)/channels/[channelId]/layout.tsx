"use client";

import { useEffect, useMemo, useState } from "react";
import { useChannelStore } from "@/stores/channel-store";
import { ChannelSidebar } from "@/components/layout/channel-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import type { Channel } from "@/lib/types/channels";
import type { ApiResponse } from "@/lib/types/api";
import { useParams } from "next/navigation";

export default function ChannelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const channelId = params.channelId as string;
  const { channels, fetchChannels } = useChannelStore();
  const [fetchedChannel, setFetchedChannel] = useState<Channel | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derive channel from store without setState in effect
  const storeChannel = useMemo(
    () => channels.find((ch) => ch.channelId === channelId) || null,
    [channels, channelId]
  );

  // Use store channel if available, otherwise use fetched
  const channel = storeChannel || fetchedChannel;

  useEffect(() => {
    // If already in store, no need to fetch
    if (storeChannel) return;

    // Fetch directly
    async function load() {
      try {
        const res = await fetch(`/api/channels/${channelId}`);
        const json: ApiResponse<{ channel: Channel }> = await res.json();
        if (json.error) {
          setError(json.error.message);
        } else if (json.data) {
          setFetchedChannel(json.data.channel);
        }
      } catch {
        setError("Failed to load channel");
      }
    }

    load();
    // Also ensure channels list is loaded for the switcher
    if (channels.length === 0) fetchChannels();
  }, [channelId, storeChannel, channels.length, fetchChannels]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">{error}</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <ChannelSidebar channel={channel} />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 bg-zinc-50 p-6">{children}</main>
      </div>
    </div>
  );
}
