import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getSession } from "@/lib/auth/session";
import { getChannelById, updateChannel, deleteChannelPermanently } from "@/lib/db/channels";
import { successResponse, errorResponse } from "@/lib/types/api";

const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  niche: z.string().max(100).optional(),
  isArchived: z.boolean().optional(),
  isPendingDelete: z.boolean().optional(),
});

// GET /api/channels/[channelId] — get a single channel
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
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

    return NextResponse.json(successResponse({ channel }));
  } catch (err: unknown) {
    console.error("Get channel error:", (err as Error).message);
    return NextResponse.json(
      errorResponse("Failed to load channel.", "GET_FAILED"),
      { status: 500 }
    );
  }
}

// PATCH /api/channels/[channelId] — update a channel
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(errorResponse("Not authenticated.", "UNAUTHORIZED"), { status: 401 });
    }

    const { channelId } = await params;
    const body = await request.json();
    const parsed = updateChannelSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(errorResponse(firstError, "VALIDATION_ERROR"), { status: 400 });
    }

    // Verify channel exists and belongs to user
    const existing = await getChannelById(session.user.accountId, channelId);
    if (!existing) {
      return NextResponse.json(errorResponse("Channel not found.", "NOT_FOUND"), { status: 404 });
    }

    // Can't modify suspended channels (unless admin)
    if (existing.status === "suspended" && session.user.role !== "admin") {
      return NextResponse.json(
        errorResponse("This channel is suspended. Contact support.", "CHANNEL_SUSPENDED"),
        { status: 403 }
      );
    }

    const updates: Record<string, unknown> = { ...parsed.data };

    // If setting isPendingDelete to true, record the timestamp
    if (parsed.data.isPendingDelete === true && !existing.isPendingDelete) {
      updates.pendingDeleteAt = new Date().toISOString();
    }

    // If cancelling pending delete
    if (parsed.data.isPendingDelete === false) {
      updates.pendingDeleteAt = null;
    }

    const channel = await updateChannel(session.user.accountId, channelId, updates);

    return NextResponse.json(successResponse({ channel }));
  } catch (err: unknown) {
    console.error("Update channel error:", (err as Error).message);
    return NextResponse.json(
      errorResponse("Failed to update channel.", "UPDATE_FAILED"),
      { status: 500 }
    );
  }
}

// DELETE /api/channels/[channelId] — permanently delete (admin or after 30-day pending)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
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

    // Only admin can permanently delete immediately
    // Regular users use the isPendingDelete flow (PATCH with isPendingDelete: true)
    if (session.user.role !== "admin") {
      return NextResponse.json(
        errorResponse("Use archive or request deletion instead.", "USE_ARCHIVE"),
        { status: 403 }
      );
    }

    await deleteChannelPermanently(session.user.accountId, channelId);

    return NextResponse.json(successResponse({ message: "Channel deleted permanently." }));
  } catch (err: unknown) {
    console.error("Delete channel error:", (err as Error).message);
    return NextResponse.json(
      errorResponse("Failed to delete channel.", "DELETE_FAILED"),
      { status: 500 }
    );
  }
}
