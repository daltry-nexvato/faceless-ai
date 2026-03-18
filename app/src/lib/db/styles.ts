import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { db, Tables } from "./client";
import type { Style, StyleVersion } from "@/lib/types/styles";
import { randomUUID } from "crypto";

// ─── Create ─────────────────────────────────────────────────────────────────

export interface CreateStyleInput {
  accountId: string;
  channelId: string | null;
  name: string;
  niche: string | null;
  isStandalone: boolean;
  style: Omit<
    Style,
    | "accountId"
    | "styleId"
    | "channelId"
    | "name"
    | "niche"
    | "isStandalone"
    | "currentVersion"
    | "createdAt"
    | "updatedAt"
  >;
}

export async function createStyle(input: CreateStyleInput): Promise<Style> {
  const now = new Date().toISOString();
  const styleId = randomUUID();

  const style: Style = {
    accountId: input.accountId,
    styleId,
    channelId: input.channelId,
    name: input.name,
    niche: input.niche,
    isStandalone: input.isStandalone,
    currentVersion: 1,
    ...input.style,
    createdAt: now,
    updatedAt: now,
  };

  await db.send(
    new PutCommand({
      TableName: Tables.Styles,
      Item: style,
    })
  );

  // Save Version 1
  await saveStyleVersion(styleId, 1, style, "Initial style generation", null);

  return style;
}

// ─── Read ───────────────────────────────────────────────────────────────────

export async function getStyleById(
  accountId: string,
  styleId: string
): Promise<Style | null> {
  const result = await db.send(
    new GetCommand({
      TableName: Tables.Styles,
      Key: { accountId, styleId },
    })
  );
  return (result.Item as Style) || null;
}

export async function getStyleByChannelId(
  accountId: string,
  channelId: string
): Promise<Style | null> {
  const result = await db.send(
    new QueryCommand({
      TableName: Tables.Styles,
      IndexName: "channelId-index",
      KeyConditionExpression: "accountId = :accountId AND channelId = :channelId",
      ExpressionAttributeValues: {
        ":accountId": accountId,
        ":channelId": channelId,
      },
    })
  );
  const items = result.Items as Style[] | undefined;
  return items?.[0] || null;
}

export async function getStylesByAccount(accountId: string): Promise<Style[]> {
  const result = await db.send(
    new QueryCommand({
      TableName: Tables.Styles,
      KeyConditionExpression: "accountId = :accountId",
      ExpressionAttributeValues: { ":accountId": accountId },
    })
  );
  return (result.Items as Style[]) || [];
}

export async function countActiveStyles(accountId: string): Promise<number> {
  const styles = await getStylesByAccount(accountId);
  // Archived channels' styles don't count
  return styles.length;
}

// ─── Update ─────────────────────────────────────────────────────────────────

export type StyleSectionKey =
  | "scriptTone"
  | "voice"
  | "visualFormat"
  | "colorPalette"
  | "thumbnail"
  | "musicSound"
  | "captions"
  | "introOutro"
  | "structurePacing"
  | "seoPatterns"
  | "visualAnchors"
  | "shortsOverride"
  | "score";

export async function updateStyleSection(
  accountId: string,
  styleId: string,
  section: StyleSectionKey,
  value: unknown
): Promise<Style | null> {
  const result = await db.send(
    new UpdateCommand({
      TableName: Tables.Styles,
      Key: { accountId, styleId },
      UpdateExpression: "SET #section = :value, #updatedAt = :now",
      ExpressionAttributeNames: {
        "#section": section,
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":value": value,
        ":now": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return (result.Attributes as Style) || null;
}

export async function updateStyleMetadata(
  accountId: string,
  styleId: string,
  updates: Partial<Pick<Style, "name" | "niche" | "shortsOverride">>
): Promise<Style | null> {
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

  if (expressions.length === 0) return getStyleById(accountId, styleId);

  expressions.push("#updatedAt = :updatedAt");
  names["#updatedAt"] = "updatedAt";
  values[":updatedAt"] = new Date().toISOString();

  const result = await db.send(
    new UpdateCommand({
      TableName: Tables.Styles,
      Key: { accountId, styleId },
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );
  return (result.Attributes as Style) || null;
}

// ─── Versioning ─────────────────────────────────────────────────────────────

async function saveStyleVersion(
  styleId: string,
  versionNumber: number,
  style: Style,
  changeSummary: string,
  userNote: string | null
): Promise<StyleVersion> {
  const now = new Date().toISOString();

  const snapshot = {
    scriptTone: style.scriptTone,
    voice: style.voice,
    visualFormat: style.visualFormat,
    colorPalette: style.colorPalette,
    thumbnail: style.thumbnail,
    musicSound: style.musicSound,
    captions: style.captions,
    introOutro: style.introOutro,
    structurePacing: style.structurePacing,
    seoPatterns: style.seoPatterns,
    visualAnchors: style.visualAnchors,
    shortsOverride: style.shortsOverride,
    score: style.score,
    niche: style.niche,
  };

  const version: StyleVersion = {
    styleId,
    versionNumber,
    snapshot,
    changeSummary,
    userNote,
    createdAt: now,
  };

  await db.send(
    new PutCommand({
      TableName: Tables.StyleVersions,
      Item: version,
    })
  );

  return version;
}

export async function createNewVersion(
  accountId: string,
  styleId: string,
  changeSummary: string,
  userNote: string | null
): Promise<StyleVersion | null> {
  const style = await getStyleById(accountId, styleId);
  if (!style) return null;

  const newVersion = style.currentVersion + 1;

  // Increment version on the style record
  await db.send(
    new UpdateCommand({
      TableName: Tables.Styles,
      Key: { accountId, styleId },
      UpdateExpression: "SET currentVersion = :v, updatedAt = :now",
      ExpressionAttributeValues: {
        ":v": newVersion,
        ":now": new Date().toISOString(),
      },
    })
  );

  return saveStyleVersion(styleId, newVersion, { ...style, currentVersion: newVersion }, changeSummary, userNote);
}

export async function getStyleVersions(styleId: string): Promise<StyleVersion[]> {
  const result = await db.send(
    new QueryCommand({
      TableName: Tables.StyleVersions,
      KeyConditionExpression: "styleId = :styleId",
      ExpressionAttributeValues: { ":styleId": styleId },
      ScanIndexForward: false, // newest first
    })
  );
  return (result.Items as StyleVersion[]) || [];
}

export async function getStyleVersion(
  styleId: string,
  versionNumber: number
): Promise<StyleVersion | null> {
  const result = await db.send(
    new GetCommand({
      TableName: Tables.StyleVersions,
      Key: { styleId, versionNumber },
    })
  );
  return (result.Item as StyleVersion) || null;
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export async function deleteStyle(
  accountId: string,
  styleId: string
): Promise<void> {
  // Delete the style record
  await db.send(
    new DeleteCommand({
      TableName: Tables.Styles,
      Key: { accountId, styleId },
    })
  );

  // Delete all versions (query then batch delete)
  const versions = await getStyleVersions(styleId);
  for (const version of versions) {
    await db.send(
      new DeleteCommand({
        TableName: Tables.StyleVersions,
        Key: { styleId: version.styleId, versionNumber: version.versionNumber },
      })
    );
  }
}
