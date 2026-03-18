export type AccountRole = "user" | "admin";

export type SubscriptionTier = "starter" | "creator" | "pro" | "agency";

export type SubscriptionStatus =
  | "trial"
  | "trial_expired"
  | "active"
  | "past_due"
  | "cancelled"
  | "lapsed";

export type AuthProvider = "email" | "google" | "apple";

export interface Account {
  accountId: string;
  email: string;
  name: string;
  role: AccountRole;
  tier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  trialStartDate: string | null;
  trialEndDate: string | null;
  subscriptionEndDate: string | null;
  registrationIp: string | null;
  authProviders: AuthProvider[];
  profilePictureUrl: string | null;
  timezone: string;
  languagePreference: string;
  credits: number;
  creditsResetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  accountId: string;
  email: string;
  name: string;
  role: AccountRole;
  tier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  profilePictureUrl: string | null;
}

export interface TeamMembership {
  userId: string;
  parentAccountId: string;
  role: "owner" | "member";
  invitedBy: string;
  invitedAt: string;
  acceptedAt: string | null;
  status: "pending" | "active" | "frozen" | "removed";
}
