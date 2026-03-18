export type ChannelStatus = "draft" | "connected" | "disconnected" | "suspended";

export interface Channel {
  accountId: string;
  channelId: string;
  name: string;
  description: string | null;
  niche: string | null;
  status: ChannelStatus;
  isArchived: boolean;
  isPendingDelete: boolean;
  pendingDeleteAt: string | null;
  youtubeChannelId: string | null;
  youtubeChannelName: string | null;
  youtubeAvatarUrl: string | null;
  subscriberCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelSummary {
  channelId: string;
  name: string;
  niche: string | null;
  status: ChannelStatus;
  isArchived: boolean;
  youtubeAvatarUrl: string | null;
  subscriberCount: number | null;
}
