import { PutCommand, GetCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db, Tables } from "./client";
import type { Account, AccountRole, AuthProvider } from "@/lib/types/auth";
import { DEFAULT_TIER, DEFAULT_SUBSCRIPTION_STATUS, TRIAL_DURATION_DAYS, TRIAL_CREDITS } from "@/lib/constants";

export interface CreateAccountInput {
  accountId: string;
  email: string;
  name: string;
  registrationIp?: string;
  authProvider: AuthProvider;
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  const now = new Date().toISOString();
  const trialEnd = new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const account: Account = {
    accountId: input.accountId,
    email: input.email,
    name: input.name,
    role: "user" as AccountRole,
    tier: DEFAULT_TIER,
    subscriptionStatus: DEFAULT_SUBSCRIPTION_STATUS,
    trialStartDate: now,
    trialEndDate: trialEnd,
    subscriptionEndDate: null,
    registrationIp: input.registrationIp || null,
    authProviders: [input.authProvider],
    profilePictureUrl: null,
    timezone: "America/New_York",
    languagePreference: "en",
    credits: TRIAL_CREDITS,
    creditsResetDate: trialEnd,
    createdAt: now,
    updatedAt: now,
  };

  await db.send(
    new PutCommand({
      TableName: Tables.Accounts,
      Item: account,
      ConditionExpression: "attribute_not_exists(accountId)",
    })
  );

  return account;
}

export async function getAccountById(accountId: string): Promise<Account | null> {
  const result = await db.send(
    new GetCommand({
      TableName: Tables.Accounts,
      Key: { accountId },
    })
  );

  return (result.Item as Account) || null;
}

export async function getAccountByEmail(email: string): Promise<Account | null> {
  const result = await db.send(
    new QueryCommand({
      TableName: Tables.Accounts,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
      Limit: 1,
    })
  );

  return (result.Items?.[0] as Account) || null;
}

export async function updateAccount(
  accountId: string,
  updates: Partial<Pick<Account, "name" | "role" | "tier" | "subscriptionStatus" | "subscriptionEndDate" | "profilePictureUrl" | "timezone" | "languagePreference" | "credits" | "creditsResetDate">>
): Promise<Account | null> {
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

  if (expressions.length === 0) return getAccountById(accountId);

  expressions.push("#updatedAt = :updatedAt");
  names["#updatedAt"] = "updatedAt";
  values[":updatedAt"] = new Date().toISOString();

  const result = await db.send(
    new UpdateCommand({
      TableName: Tables.Accounts,
      Key: { accountId },
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );

  return (result.Attributes as Account) || null;
}

export async function isDisposableEmail(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  const result = await db.send(
    new GetCommand({
      TableName: Tables.DisposableEmailDomains,
      Key: { domain },
    })
  );

  return !!result.Item;
}

export function accountToUser(account: Account) {
  return {
    accountId: account.accountId,
    email: account.email,
    name: account.name,
    role: account.role,
    tier: account.tier,
    subscriptionStatus: account.subscriptionStatus,
    profilePictureUrl: account.profilePictureUrl,
  };
}
