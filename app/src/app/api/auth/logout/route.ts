import { NextResponse } from "next/server";
import { cognitoGlobalSignOut } from "@/lib/auth/cognito";
import { getAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { successResponse } from "@/lib/types/api";

export async function POST() {
  try {
    const tokens = await getAuthCookies();

    // Try to revoke all refresh tokens in Cognito
    if (tokens.accessToken) {
      try {
        await cognitoGlobalSignOut(tokens.accessToken);
      } catch {
        // Even if Cognito sign-out fails, we still clear local cookies
      }
    }

    // Clear all auth cookies
    await clearAuthCookies();

    return NextResponse.json(successResponse({ message: "Logged out." }));
  } catch (err: unknown) {
    console.error("Logout error:", (err as Error).message);
    // Still clear cookies even on error
    await clearAuthCookies();
    return NextResponse.json(successResponse({ message: "Logged out." }));
  }
}
