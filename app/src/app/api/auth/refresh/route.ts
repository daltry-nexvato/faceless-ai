import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { successResponse, errorResponse } from "@/lib/types/api";

export async function POST() {
  try {
    // getSession() already handles refresh logic internally
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        errorResponse("Session expired. Please sign in again.", "SESSION_EXPIRED"),
        { status: 401 }
      );
    }

    return NextResponse.json(successResponse({ user: session.user }));
  } catch (err: unknown) {
    console.error("Refresh error:", (err as Error).message);
    return NextResponse.json(
      errorResponse("Session expired. Please sign in again.", "SESSION_EXPIRED"),
      { status: 401 }
    );
  }
}
