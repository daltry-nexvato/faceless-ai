import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { cognitoConfirmSignUp, cognitoLogin } from "@/lib/auth/cognito";
import { setAuthCookies } from "@/lib/auth/cookies";
import { verifyIdToken } from "@/lib/auth/jwt";
import { createAccount, getAccountByEmail, accountToUser } from "@/lib/db/accounts";
import { successResponse, errorResponse } from "@/lib/types/api";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(1, "Verification code is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(errorResponse(firstError, "VALIDATION_ERROR"), { status: 400 });
    }

    const { email, code } = parsed.data;

    // Confirm the signup with Cognito
    await cognitoConfirmSignUp({ email, code });

    // Auto-login after verification
    const authResult = await cognitoLogin({ email, password: "" }).catch(() => null);

    // If auto-login fails (we don't have the password), that's OK — user will login manually
    // But typically the frontend sends the password along or the user logs in right after
    if (!authResult?.AccessToken || !authResult.IdToken) {
      return NextResponse.json(
        successResponse({ message: "Email verified. Please sign in.", verified: true }),
      );
    }

    // Set auth cookies
    await setAuthCookies({
      accessToken: authResult.AccessToken,
      idToken: authResult.IdToken,
      refreshToken: authResult.RefreshToken,
    });

    // Decode ID token to get user info
    const idPayload = await verifyIdToken(authResult.IdToken);

    // Create account in DynamoDB if it doesn't exist
    let account = await getAccountByEmail(email);
    if (!account) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                 request.headers.get("x-real-ip") ||
                 "unknown";

      account = await createAccount({
        accountId: idPayload.sub,
        email,
        name: idPayload.name || email.split("@")[0],
        registrationIp: ip,
        authProvider: "email",
      });
    }

    return NextResponse.json(
      successResponse({ user: accountToUser(account), verified: true }),
    );
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };

    if (error.name === "CodeMismatchException") {
      return NextResponse.json(
        errorResponse("Invalid verification code.", "INVALID_CODE"),
        { status: 400 }
      );
    }

    if (error.name === "ExpiredCodeException") {
      return NextResponse.json(
        errorResponse("Verification code has expired. Request a new one.", "EXPIRED_CODE"),
        { status: 400 }
      );
    }

    console.error("Verification error:", error.message);
    return NextResponse.json(
      errorResponse("Verification failed. Please try again.", "VERIFICATION_FAILED"),
      { status: 500 }
    );
  }
}
