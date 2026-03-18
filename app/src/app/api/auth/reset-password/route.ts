import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { cognitoConfirmForgotPassword } from "@/lib/auth/cognito";
import { successResponse, errorResponse } from "@/lib/types/api";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().min(1, "Reset code is required"),
  newPassword: z
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
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(errorResponse(firstError, "VALIDATION_ERROR"), { status: 400 });
    }

    const { email, code, newPassword } = parsed.data;

    await cognitoConfirmForgotPassword({ email, code, newPassword });

    return NextResponse.json(
      successResponse({ message: "Password reset successful. Please sign in." })
    );
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };

    if (error.name === "CodeMismatchException") {
      return NextResponse.json(
        errorResponse("Invalid reset code.", "INVALID_CODE"),
        { status: 400 }
      );
    }

    if (error.name === "ExpiredCodeException") {
      return NextResponse.json(
        errorResponse("Reset code has expired. Request a new one.", "EXPIRED_CODE"),
        { status: 400 }
      );
    }

    console.error("Reset password error:", error.message);
    return NextResponse.json(
      errorResponse("Password reset failed. Please try again.", "RESET_FAILED"),
      { status: 500 }
    );
  }
}
