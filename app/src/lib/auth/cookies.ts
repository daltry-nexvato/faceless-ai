import { cookies } from "next/headers";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_ID_TOKEN,
  COOKIE_REFRESH_TOKEN,
  ACCESS_TOKEN_MAX_AGE,
  ID_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/constants";

const isProduction = process.env.NODE_ENV === "production";

interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
}

export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
  const cookieStore = await cookies();

  const baseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  };

  cookieStore.set(COOKIE_ACCESS_TOKEN, tokens.accessToken, {
    ...baseOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  cookieStore.set(COOKIE_ID_TOKEN, tokens.idToken, {
    ...baseOptions,
    maxAge: ID_TOKEN_MAX_AGE,
  });

  if (tokens.refreshToken) {
    cookieStore.set(COOKIE_REFRESH_TOKEN, tokens.refreshToken, {
      ...baseOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/", // Need it accessible for refresh logic
    });
  }
}

export async function getAuthCookies(): Promise<{
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
}> {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(COOKIE_ACCESS_TOKEN)?.value || null,
    idToken: cookieStore.get(COOKIE_ID_TOKEN)?.value || null,
    refreshToken: cookieStore.get(COOKIE_REFRESH_TOKEN)?.value || null,
  };
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_ACCESS_TOKEN);
  cookieStore.delete(COOKIE_ID_TOKEN);
  cookieStore.delete(COOKIE_REFRESH_TOKEN);
}
