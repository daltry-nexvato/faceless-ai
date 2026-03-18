import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { cognitoLogin } from "@/lib/auth/cognito";
import { setAuthCookies } from "@/lib/auth/cookies";
import { verifyIdToken } from "@/lib/auth/jwt";
import { getAccountById, createAccount, accountToUser } from "@/lib/db/accounts";
import { successResponse, errorResponse } from "@/lib/types/api";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(errorResponse(firstError, "VALIDATION_ERROR"), { status: 400 });
    }

    const { email, password } = parsed.data;

    // Authenticate with Cognito
    const authResult = await cognitoLogin({ email, password });

    if (!authResult.AccessToken || !authResult.IdToken) {
      return NextResponse.json(
        errorResponse("Authentication failed.", "AUTH_FAILED"),
        { status: 401 }
      );
    }

    // Set auth cookies
    await setAuthCookies({
      accessToken: authResult.AccessToken,
      idToken: authResult.IdToken,
      refreshToken: authResult.RefreshToken,
    });

    // Get user info from ID token
    const idPayload = await verifyIdToken(authResult.IdToken);

    // Look up or create account in DynamoDB
    let account = await getAccountById(idPayload.sub);
    if (!account) {
      // Account doesn't exist in DynamoDB yet (first login after migration, etc.)
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                 request.headers.get("x-real-ip") ||
                 "unknown";

      account = await createAccount({
        accountId: idPayload.sub,
        email: idPayload.email || email,
        name: idPayload.name || email.split("@")[0],
        registrationIp: ip,
        authProvider: "email",
      });
    }

    return NextResponse.json(successResponse({ user: accountToUser(account) }));
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };

    if (
      error.name === "NotAuthorizedException" ||
      error.name === "UserNotFoundException"
    ) {
      return NextResponse.json(
        errorResponse("Incorrect email or password.", "INVALID_CREDENTIALS"),
        { status: 401 }
      );
    }

    if (error.name === "UserNotConfirmedException") {
      return NextResponse.json(
        errorResponse("Please verify your email first.", "UNVERIFIED"),
        { status: 403 }
      );
    }

    if (error.name === "TooManyRequestsException") {
      return NextResponse.json(
        errorResponse("Too many attempts. Please try again later.", "RATE_LIMITED"),
        { status: 429 }
      );
    }

    console.error("Login error:", error.message);
    return NextResponse.json(
      errorResponse("Login failed. Please try again.", "LOGIN_FAILED"),
      { status: 500 }
    );
  }
}
