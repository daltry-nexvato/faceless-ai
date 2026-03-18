import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { cognitoForgotPassword } from "@/lib/auth/cognito";
import { successResponse, errorResponse } from "@/lib/types/api";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("Please enter a valid email address.", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    try {
      await cognitoForgotPassword(email);
    } catch {
      // Swallow errors — don't reveal if email exists or not
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      successResponse({
        message: "If an account exists with that email, a password reset code has been sent.",
      })
    );
  } catch (err: unknown) {
    console.error("Forgot password error:", (err as Error).message);
    return NextResponse.json(
      successResponse({
        message: "If an account exists with that email, a password reset code has been sent.",
      })
    );
  }
}
