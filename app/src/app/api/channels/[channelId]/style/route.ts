import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getSession } from "@/lib/auth/session";
import { getChannelById } from "@/lib/db/channels";
import {
  createStyle,
  getStyleByChannelId,
  updateStyleSection,
  countActiveStyles,
  type StyleSectionKey,
} from "@/lib/db/styles";
import { successResponse, errorResponse } from "@/lib/types/api";
import { STYLE_LIMITS } from "@/lib/constants";
import { STYLE_TEMPLATES, STYLE_TEMPLATE_META } from "@/lib/styles/templates";
import type { StyleTemplateId } from "@/lib/types/styles";

const createStyleSchema = z.object({
  templateId: z.enum([
    "true_crime",
    "educational",
    "finance",
    "tech_review",
    "gaming",
    "cooking",
    "travel",
    "health_fitness",
    "story_commentary",
    "shorts_viral",
  ] as const),
  name: z.string().min(1).max(100).optional(),
});

const updateStyleSectionSchema = z.object({
  section: z.enum([
    "scriptTone",
    "voice",
    "visualFormat",
    "colorPalette",
    "thumbnail",
    "musicSound",
    "captions",
    "introOutro",
    "structurePacing",
    "seoPatterns",
    "visualAnchors",
    "shortsOverride",
  ] as const),
  value: z.unknown(),
});

type RouteParams = { params: Promise<{ channelId: string }> };

// GET /api/channels/[channelId]/style — get the channel's style
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
      return NextResponse.json(
        successResponse({ style: null, templates: STYLE_TEMPLATE_META })
      );
    }

    return NextResponse.json(successResponse({ style }));
  } catch (err: unknown) {
    console.error("Get style error:", (err as Error).message);
    return NextResponse.json(errorResponse("Failed to load style.", "GET_FAILED"), { status: 500 });
  }
}

// POST /api/channels/[channelId]/style — create style from template
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

    // Check if channel already has a style
    const existing = await getStyleByChannelId(session.user.accountId, channelId);
    if (existing) {
      return NextResponse.json(
        errorResponse("Channel already has a style. Use PUT to update or regenerate.", "STYLE_EXISTS"),
        { status: 409 }
      );
    }

    // Check style tier limit (admin bypasses)
    if (session.user.role !== "admin") {
      const activeCount = await countActiveStyles(session.user.accountId);
      const limit = STYLE_LIMITS[session.user.tier] ?? 3;
      if (activeCount >= limit) {
        return NextResponse.json(
          errorResponse(
            `You've reached your plan's limit of ${limit} styles. Upgrade or delete an unused standalone style.`,
            "STYLE_LIMIT_REACHED"
          ),
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const parsed = createStyleSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(errorResponse(firstError, "VALIDATION_ERROR"), { status: 400 });
    }

    const templateId = parsed.data.templateId as StyleTemplateId;
    const template = STYLE_TEMPLATES[templateId];
    const meta = STYLE_TEMPLATE_META.find((t) => t.id === templateId);

    const style = await createStyle({
      accountId: session.user.accountId,
      channelId,
      name: parsed.data.name || `${meta?.name || "Custom"} Style`,
      niche: channel.niche || meta?.niche || null,
      isStandalone: false,
      style: {
        ...template,
        score: null,
      },
    });

    return NextResponse.json(successResponse({ style }), { status: 201 });
  } catch (err: unknown) {
    console.error("Create style error:", (err as Error).message);
    return NextResponse.json(errorResponse("Failed to create style.", "CREATE_FAILED"), { status: 500 });
  }
}

// PATCH /api/channels/[channelId]/style — update a single section
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const existing = await getStyleByChannelId(session.user.accountId, channelId);
    if (!existing) {
      return NextResponse.json(errorResponse("No style found. Create one first.", "NO_STYLE"), { status: 404 });
    }

    const body = await request.json();
    const parsed = updateStyleSectionSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(errorResponse(firstError, "VALIDATION_ERROR"), { status: 400 });
    }

    const style = await updateStyleSection(
      session.user.accountId,
      existing.styleId,
      parsed.data.section as StyleSectionKey,
      parsed.data.value
    );

    return NextResponse.json(successResponse({ style }));
  } catch (err: unknown) {
    console.error("Update style error:", (err as Error).message);
    return NextResponse.json(errorResponse("Failed to update style.", "UPDATE_FAILED"), { status: 500 });
  }
}
