import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getSession } from "@/lib/auth/session";
import { getChannelById } from "@/lib/db/channels";
import { getStyleByChannelId, createNewVersion, getStyleVersions } from "@/lib/db/styles";
import { successResponse, errorResponse } from "@/lib/types/api";

const createVersionSchema = z.object({
  changeSummary: z.string().min(1).max(500),
  userNote: z.string().max(500).optional(),
});

type RouteParams = { params: Promise<{ channelId: string }> };

// GET /api/channels/[channelId]/style/versions — list all versions
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(errorResponse("Not authenticated.", "UNAUTHORIZED"), { status: 401 });
    }

    const { channelId } = await params;
    const channel = await getChannelById(session.user.accountId, channelId);
    if (!channel) {
      return NextResponse.json(errorResponse("Channel not found.", "NOT_FOUND"), { status: 404 });
    }

    const style = await getStyleByChannelId(session.user.accountId, channelId);
    if (!style) {
      return NextResponse.json(successResponse({ versions: [] }));
    }

    const versions = await getStyleVersions(style.styleId);

    return NextResponse.json(successResponse({ versions, currentVersion: style.currentVersion }));
  } catch (err: unknown) {
    console.error("List style versions error:", (err as Error).message);
    return NextResponse.json(errorResponse("Failed to load versions.", "LIST_FAILED"), { status: 500 });
  }
}

// POST /api/channels/[channelId]/style/versions — save current state as new version
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(errorResponse("Not authenticated.", "UNAUTHORIZED"), { status: 401 });
    }

    const { channelId } = await params;
    const channel = await getChannelById(session.user.accountId, channelId);
    if (!channel) {
      return NextResponse.json(errorResponse("Channel not found.", "NOT_FOUND"), { status: 404 });
    }

    const style = await getStyleByChannelId(session.user.accountId, channelId);
    if (!style) {
      return NextResponse.json(errorResponse("No style found. Create one first.", "NO_STYLE"), { status: 404 });
    }

    const body = await request.json();
    const parsed = createVersionSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(errorResponse(firstError, "VALIDATION_ERROR"), { status: 400 });
    }

    const version = await createNewVersion(
      session.user.accountId,
      style.styleId,
      parsed.data.changeSummary,
      parsed.data.userNote || null
    );

    if (!version) {
      return NextResponse.json(errorResponse("Failed to create version.", "VERSION_FAILED"), { status: 500 });
    }

    return NextResponse.json(successResponse({ version }), { status: 201 });
  } catch (err: unknown) {
    console.error("Create style version error:", (err as Error).message);
    return NextResponse.json(errorResponse("Failed to save version.", "CREATE_FAILED"), { status: 500 });
  }
}
