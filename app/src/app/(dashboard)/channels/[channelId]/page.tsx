"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Channel } from "@/lib/types/channels";
import type { ApiResponse } from "@/lib/types/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tv, Plus, Youtube } from "lucide-react";
import Link from "next/link";

export default function ChannelDashboardPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/channels/${channelId}`);
      const json: ApiResponse<{ channel: Channel }> = await res.json();
      if (json.data) setChannel(json.data.channel);
    }
    load();
  }, [channelId]);

  if (!channel) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{channel.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {channel.niche && (
              <span className="text-sm text-zinc-500">{channel.niche}</span>
            )}
            <Badge
              variant="secondary"
              className={
                channel.status === "draft"
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-green-100 text-green-700"
              }
            >
              {channel.status}
            </Badge>
          </div>
        </div>
        <Link href={`/dashboard/channels/${channelId}/settings`}>
          <Button variant="outline" size="sm">
            Channel Settings
          </Button>
        </Link>
      </div>

      {channel.status === "draft" && (
        <Card className="border-dashed border-2 border-zinc-300 bg-zinc-50">
          <CardContent className="flex items-center gap-4 py-6">
            <Youtube className="h-8 w-8 text-zinc-400" />
            <div className="flex-1">
              <p className="font-medium text-zinc-900">Connect YouTube to publish</p>
              <p className="text-sm text-zinc-500">
                Your channel is in planning mode. Connect a YouTube channel when you&apos;re ready to publish videos.
              </p>
            </div>
            <Button variant="outline" disabled>
              Connect YouTube
              <span className="ml-2 text-xs text-zinc-400">(Coming soon)</span>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-500">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-zinc-900">0</span>
              <Button size="sm" variant="outline" disabled>
                <Plus className="mr-1 h-3 w-3" />
                New Project
              </Button>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Projects available after Style is generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-500">Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-zinc-300" />
              <span className="text-sm text-zinc-500">Not generated yet</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Save reference channels first, then generate your Style
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-500">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-zinc-300" />
              <span className="text-sm text-zinc-500">Connect YouTube to unlock</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
