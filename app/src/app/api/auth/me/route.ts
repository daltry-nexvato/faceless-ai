import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { successResponse, errorResponse } from "@/lib/types/api";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        errorResponse("Not authenticated.", "UNAUTHORIZED"),
        { status: 401 }
      );
    }

    return NextResponse.json(successResponse({ user: session.user }));
  } catch (err: unknown) {
    console.error("Session error:", (err as Error).message);
    return NextResponse.json(
      errorResponse("Not authenticated.", "UNAUTHORIZED"),
      { status: 401 }
    );
  }
}
