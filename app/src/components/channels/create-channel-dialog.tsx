"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChannelStore } from "@/stores/channel-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

export function CreateChannelDialog() {
  const router = useRouter();
  const createChannel = useChannelStore((s) => s.createChannel);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const channel = await createChannel({
        name,
        niche: niche || undefined,
      });
      toast.success(`Channel "${channel.name}" created`);
      setOpen(false);
      setName("");
      setNiche("");
      router.push(`/dashboard/channels/${channel.channelId}`);
    } catch (err) {
      toast.error((err as Error).message || "Failed to create channel");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Channel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>Create a new channel</DialogTitle>
            <DialogDescription>
              Start planning your channel. You can connect YouTube later when you&apos;re ready to publish.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel name</Label>
              <Input
                id="channel-name"
                placeholder="e.g., My True Crime Channel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel-niche">
                Niche <span className="text-zinc-400">(optional)</span>
              </Label>
              <Input
                id="channel-niche"
                placeholder="e.g., True Crime, Finance, Education"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-zinc-500">
                You can set this later from the Niche Finder.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create channel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
