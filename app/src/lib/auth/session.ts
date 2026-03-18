import { getAuthCookies, setAuthCookies } from "./cookies";
import { verifyAccessToken } from "./jwt";
import { cognitoRefreshTokens } from "./cognito";
import { getAccountById } from "@/lib/db/accounts";
import type { User } from "@/lib/types/auth";
import { accountToUser } from "@/lib/db/accounts";

export interface Session {
  user: User;
  accessToken: string;
}

/**
 * Get the current session from cookies.
 * Validates the access token, refreshes if expired, and returns the user.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<Session | null> {
  const tokens = await getAuthCookies();

  if (!tokens.accessToken) {
    // No access token — try to refresh
    if (tokens.refreshToken) {
      return tryRefresh(tokens.refreshToken);
    }
    return null;
  }

  try {
    // Verify the access token
    const accessPayload = await verifyAccessToken(tokens.accessToken);

    // Look up the account in DynamoDB for authoritative role/tier/status
    const account = await getAccountById(accessPayload.sub);
    if (!account) return null;

    return {
      user: accountToUser(account),
      accessToken: tokens.accessToken,
    };
  } catch {
    // Access token expired or invalid — try to refresh
    if (tokens.refreshToken) {
      return tryRefresh(tokens.refreshToken);
    }
    return null;
  }
}

async function tryRefresh(refreshToken: string): Promise<Session | null> {
  try {
    // We need the email for the secret hash — decode the refresh token or use a stored value
    // Cognito refresh tokens are opaque, so we need to get the email from the ID token
    const tokens = await getAuthCookies();
    let email: string | undefined;

    if (tokens.idToken) {
      try {
        // Try to decode (not verify — it's expired) the ID token to get the email
        const parts = tokens.idToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
          email = payload.email;
        }
      } catch {
        // Can't decode ID token
      }
    }

    if (!email) return null;

    const authResult = await cognitoRefreshTokens(refreshToken, email);

    if (!authResult.AccessToken || !authResult.IdToken) return null;

    // Set new cookies
    await setAuthCookies({
      accessToken: authResult.AccessToken,
      idToken: authResult.IdToken,
      // Refresh token is NOT returned on refresh — keep the existing one
    });

    // Verify the new access token
    const accessPayload = await verifyAccessToken(authResult.AccessToken);
    const account = await getAccountById(accessPayload.sub);
    if (!account) return null;

    return {
      user: accountToUser(account),
      accessToken: authResult.AccessToken,
    };
  } catch {
    return null;
  }
}
