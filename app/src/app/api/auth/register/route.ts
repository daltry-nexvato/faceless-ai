import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { cognitoSignUp } from "@/lib/auth/cognito";
import { isDisposableEmail } from "@/lib/db/accounts";
import { successResponse, errorResponse } from "@/lib/types/api";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(errorResponse(firstError, "VALIDATION_ERROR"), { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // Check disposable email
    const disposable = await isDisposableEmail(email);
    if (disposable) {
      return NextResponse.json(
        errorResponse("Please use a permanent email address to sign up.", "DISPOSABLE_EMAIL"),
        { status: 400 }
      );
    }

    // Register with Cognito
    const { userSub } = await cognitoSignUp({ email, password, name });

    return NextResponse.json(
      successResponse({
        message: "Verification code sent to your email.",
        userSub,
      }),
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };

    if (error.name === "UsernameExistsException") {
      return NextResponse.json(
        errorResponse("An account with this email already exists.", "EMAIL_EXISTS"),
        { status: 409 }
      );
    }

    if (error.name === "InvalidPasswordException") {
      return NextResponse.json(
        errorResponse("Password does not meet requirements.", "INVALID_PASSWORD"),
        { status: 400 }
      );
    }

    console.error("Registration error:", error.message);
    return NextResponse.json(
      errorResponse("Registration failed. Please try again.", "REGISTRATION_FAILED"),
      { status: 500 }
    );
  }
}
