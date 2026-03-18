import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getSession } from "@/lib/auth/session";
import { createChannel, getChannelsByAccount, countActiveChannels } from "@/lib/db/channels";
import { successResponse, errorResponse } from "@/lib/types/api";
import { CHANNEL_LIMITS } from "@/lib/constants";

const createChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required").max(100),
  description: z.string().max(500).optional(),
  niche: z.string().max(100).optional(),
});

// POST /api/channels — create a new channel
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(errorResponse("Not authenticated.", "UNAUTHORIZED"), { status: 401 });
    }

    const body = await request.json();
    const parsed = createChannelSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(errorResponse(firstError, "VALIDATION_ERROR"), { status: 400 });
    }

    // Check tier channel limit (admin bypasses)
    if (session.user.role !== "admin") {
      const activeCount = await countActiveChannels(session.user.accountId);
      const limit = CHANNEL_LIMITS[session.user.tier] ?? 2;

      if (activeCount >= limit) {
        return NextResponse.json(
          errorResponse(
            `You've reached your plan's limit of ${limit} channels. Upgrade your plan or archive an existing channel.`,
            "CHANNEL_LIMIT_REACHED"
          ),
          { status: 403 }
        );
      }
    }

    const channel = await createChannel({
      accountId: session.user.accountId,
      name: parsed.data.name,
      description: parsed.data.description,
      niche: parsed.data.niche,
    });

    return NextResponse.json(successResponse({ channel }), { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Create channel error:", error.message, error.stack);
    return NextResponse.json(
      errorResponse("Failed to create channel.", "CREATE_FAILED"),
      { status: 500 }
    );
  }
}

// GET /api/channels — list all channels for the authenticated user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(errorResponse("Not authenticated.", "UNAUTHORIZED"), { status: 401 });
    }

    const channels = await getChannelsByAccount(session.user.accountId);

    // Filter out pending-delete channels that have passed 30 days (cleanup)
    const visible = channels.filter((ch) => {
      if (ch.isPendingDelete && ch.pendingDeleteAt) {
        const deleteDate = new Date(ch.pendingDeleteAt);
        const thirtyDaysLater = new Date(deleteDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        return new Date() < thirtyDaysLater;
      }
      return true;
    });

    return NextResponse.json(successResponse({ channels: visible }));
  } catch (err: unknown) {
    const error = err as Error;
    console.error("List channels error:", error.message, error.stack);
    return NextResponse.json(
      errorResponse("Failed to load channels.", "LIST_FAILED"),
      { status: 500 }
    );
  }
}
