"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Channel } from "@/lib/types/channels";
import type { ApiResponse } from "@/lib/types/api";
import { useChannelStore } from "@/stores/channel-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ChannelSettingsPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const updateChannel = useChannelStore((s) => s.updateChannel);

  const [channel, setChannel] = useState<Channel | null>(null);
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/channels/${channelId}`);
      const json: ApiResponse<{ channel: Channel }> = await res.json();
      if (json.data) {
        const ch = json.data.channel;
        setChannel(ch);
        setName(ch.name);
        setNiche(ch.niche || "");
        setDescription(ch.description || "");
      }
    }
    load();
  }, [channelId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateChannel(channelId, { name, niche: niche || null, description: description || null });
      setChannel(updated);
      toast.success("Channel settings saved");
    } catch (err) {
      toast.error((err as Error).message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive() {
    setIsArchiving(true);
    try {
      const updated = await updateChannel(channelId, { isArchived: !channel?.isArchived });
      setChannel(updated);
      toast.success(updated.isArchived ? "Channel archived" : "Channel restored");
    } catch (err) {
      toast.error((err as Error).message || "Failed to update");
    } finally {
      setIsArchiving(false);
    }
  }

  if (!channel) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Channel Settings</h1>
        <p className="text-sm text-zinc-500">Manage your channel configuration</p>
      </div>

      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>Update your channel name, niche, and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Channel name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="niche">Niche</Label>
              <Input
                id="niche"
                placeholder="e.g., True Crime, Finance"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Notes about this channel"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Separator />

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            {channel.isArchived
              ? "This channel is archived. Restore it to make it active again."
              : "Archive this channel to hide it from your dashboard. You can restore it later."}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="outline"
            className={channel.isArchived ? "border-green-300 text-green-700 hover:bg-green-50" : "border-red-300 text-red-600 hover:bg-red-50"}
            onClick={handleArchive}
            disabled={isArchiving}
          >
            {isArchiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {channel.isArchived ? "Restore Channel" : "Archive Channel"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
