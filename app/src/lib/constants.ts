// Cookie names
export const COOKIE_ACCESS_TOKEN = "faceless_access_token";
export const COOKIE_ID_TOKEN = "faceless_id_token";
export const COOKIE_REFRESH_TOKEN = "faceless_refresh_token";

// Cookie config
export const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1 hour in seconds
export const ID_TOKEN_MAX_AGE = 60 * 60; // 1 hour
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Auth
export const PASSWORD_MIN_LENGTH = 8;

// Routes
export const AUTH_ROUTES = ["/login", "/register", "/verify", "/forgot-password", "/reset-password"];
export const PROTECTED_ROUTE_PREFIX = "/dashboard";
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
export const DEFAULT_LOGOUT_REDIRECT = "/login";

// App
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Faceless AI";

// Channel limits per tier
export const CHANNEL_LIMITS: Record<string, number> = {
  starter: 2,
  creator: 5,
  pro: 15,
  agency: Infinity,
};

// Style limits per tier (channel styles + standalone styles combined)
export const STYLE_LIMITS: Record<string, number> = {
  starter: 3,
  creator: 10,
  pro: 25,
  agency: Infinity,
};

// Style costs in credits
export const STYLE_GENERATION_COST = 75;
export const STYLE_AI_PREVIEW_COST = 15;
export const MAX_VISUAL_ANCHORS_PER_STYLE = 10;

// Account defaults
export const DEFAULT_TIER = "starter" as const;
export const DEFAULT_SUBSCRIPTION_STATUS = "trial" as const;
export const TRIAL_DURATION_DAYS = 7;
export const TRIAL_CREDITS = 5000;
