"use client";

import { create } from "zustand";
import type { Channel } from "@/lib/types/channels";
import type { ApiResponse } from "@/lib/types/api";

interface ChannelState {
  channels: Channel[];
  selectedChannel: Channel | null;
  isLoading: boolean;

  fetchChannels: () => Promise<void>;
  createChannel: (data: { name: string; description?: string; niche?: string }) => Promise<Channel>;
  updateChannel: (channelId: string, data: Record<string, unknown>) => Promise<Channel>;
  selectChannel: (channelId: string) => void;
  clearSelection: () => void;
}

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.data as T;
}

export const useChannelStore = create<ChannelState>((set, get) => ({
  channels: [],
  selectedChannel: null,
  isLoading: false,

  fetchChannels: async () => {
    set({ isLoading: true });
    try {
      const data = await apiCall<{ channels: Channel[] }>("/api/channels");
      set({ channels: data.channels, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createChannel: async (data) => {
    const result = await apiCall<{ channel: Channel }>("/api/channels", {
      method: "POST",
      body: JSON.stringify(data),
    });
    set((state) => ({ channels: [...state.channels, result.channel] }));
    return result.channel;
  },

  updateChannel: async (channelId, data) => {
    const result = await apiCall<{ channel: Channel }>(`/api/channels/${channelId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.channelId === channelId ? result.channel : ch
      ),
      selectedChannel:
        state.selectedChannel?.channelId === channelId
          ? result.channel
          : state.selectedChannel,
    }));
    return result.channel;
  },

  selectChannel: (channelId) => {
    const channel = get().channels.find((ch) => ch.channelId === channelId) || null;
    set({ selectedChannel: channel });
  },

  clearSelection: () => {
    set({ selectedChannel: null });
  },
}));
