import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { db, Tables } from "./client";
import type { Channel, ChannelSummary } from "@/lib/types/channels";
import { randomUUID } from "crypto";

export interface CreateChannelInput {
  accountId: string;
  name: string;
  description?: string;
  niche?: string;
}

export async function createChannel(input: CreateChannelInput): Promise<Channel> {
  const now = new Date().toISOString();
  const channelId = randomUUID();

  const channel: Channel = {
    accountId: input.accountId,
    channelId,
    name: input.name,
    description: input.description || null,
    niche: input.niche || null,
    status: "draft",
    isArchived: false,
    isPendingDelete: false,
    pendingDeleteAt: null,
    youtubeChannelId: null,
    youtubeChannelName: null,
    youtubeAvatarUrl: null,
    subscriberCount: null,
    createdAt: now,
    updatedAt: now,
  };

  await db.send(
    new PutCommand({
      TableName: Tables.Channels,
      Item: channel,
    })
  );

  return channel;
}

export async function getChannelById(
  accountId: string,
  channelId: string
): Promise<Channel | null> {
  const result = await db.send(
    new GetCommand({
      TableName: Tables.Channels,
      Key: { accountId, channelId },
    })
  );

  return (result.Item as Channel) || null;
}

export async function getChannelsByAccount(accountId: string): Promise<Channel[]> {
  const result = await db.send(
    new QueryCommand({
      TableName: Tables.Channels,
      KeyConditionExpression: "accountId = :accountId",
      ExpressionAttributeValues: { ":accountId": accountId },
    })
  );

  return (result.Items as Channel[]) || [];
}

export async function countActiveChannels(accountId: string): Promise<number> {
  const channels = await getChannelsByAccount(accountId);
  return channels.filter(
    (ch) => !ch.isArchived && ch.status !== "suspended"
  ).length;
}

export async function updateChannel(
  accountId: string,
  channelId: string,
  updates: Partial<Pick<Channel, "name" | "description" | "niche" | "status" | "isArchived" | "isPendingDelete" | "pendingDeleteAt" | "youtubeChannelId" | "youtubeChannelName" | "youtubeAvatarUrl" | "subscriberCount">>
): Promise<Channel | null> {
  const expressions: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      expressions.push(`#${key} = :${key}`);
      names[`#${key}`] = key;
      values[`:${key}`] = value;
    }
  }

  if (expressions.length === 0) return getChannelById(accountId, channelId);

  expressions.push("#updatedAt = :updatedAt");
  names["#updatedAt"] = "updatedAt";
  values[":updatedAt"] = new Date().toISOString();

  const result = await db.send(
    new UpdateCommand({
      TableName: Tables.Channels,
      Key: { accountId, channelId },
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );

  return (result.Attributes as Channel) || null;
}

export async function deleteChannelPermanently(
  accountId: string,
  channelId: string
): Promise<void> {
  await db.send(
    new DeleteCommand({
      TableName: Tables.Channels,
      Key: { accountId, channelId },
    })
  );
}

export function channelToSummary(channel: Channel): ChannelSummary {
  return {
    channelId: channel.channelId,
    name: channel.name,
    niche: channel.niche,
    status: channel.status,
    isArchived: channel.isArchived,
    youtubeAvatarUrl: channel.youtubeAvatarUrl,
    subscriberCount: channel.subscriberCount,
  };
}
