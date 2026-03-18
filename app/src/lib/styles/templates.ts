import type {
  Style,
  StyleTemplateMeta,
  StyleTemplateId,
  ScriptToneSection,
  VoiceSection,
  VisualFormatSection,
  ColorPaletteSection,
  ThumbnailSection,
  MusicSoundSection,
  CaptionsSection,
  IntroOutroSection,
  StructurePacingSection,
  SEOPatternsSection,
  VisualAnchorsSection,
  ShortsOverride,
} from "@/lib/types/styles";

type TemplateProfile = Omit<
  Style,
  | "accountId"
  | "styleId"
  | "channelId"
  | "name"
  | "niche"
  | "isStandalone"
  | "currentVersion"
  | "score"
  | "createdAt"
  | "updatedAt"
>;

export const STYLE_TEMPLATE_META: StyleTemplateMeta[] = [
  { id: "true_crime", name: "True Crime", description: "Dark, suspenseful, deep voice, moody thumbnails", niche: "True Crime" },
  { id: "educational", name: "Educational / Explainer", description: "Bright, clean, energetic voice, text-heavy thumbnails", niche: "Education" },
  { id: "finance", name: "Finance / Business", description: "Professional, data-driven, authoritative voice, minimal thumbnails", niche: "Finance" },
  { id: "tech_review", name: "Tech Review", description: "Modern, sleek, conversational voice, product-focused thumbnails", niche: "Technology" },
  { id: "gaming", name: "Gaming", description: "Vibrant, fast-paced, energetic voice, reaction thumbnails", niche: "Gaming" },
  { id: "cooking", name: "Cooking / Food", description: "Warm, inviting, friendly voice, food-photography thumbnails", niche: "Cooking" },
  { id: "travel", name: "Travel / Documentary", description: "Cinematic, ambient, calm narrative voice, landscape thumbnails", niche: "Travel" },
  { id: "health_fitness", name: "Health / Fitness", description: "Motivational, bright, coaching voice, before-after thumbnails", niche: "Health & Fitness" },
  { id: "story_commentary", name: "Story / Commentary", description: "Casual, personality-driven, conversational voice, reaction thumbnails", niche: "Commentary" },
  { id: "shorts_viral", name: "Shorts / Viral", description: "Fast, punchy, high-energy voice, bold text thumbnails", niche: "Viral Shorts" },
];

// ─── Default sections (shared base, overridden per template) ────────────────

const defaultScriptTone: ScriptToneSection = {
  scriptTone: "conversational and informative",
  hookPattern: "question",
  preferredHookLengthSeconds: 8,
  narrativeStructure: "linear",
  pacingPerSection: "medium intro → steady build → fast climax → calm outro",
  ctaStyle: "subtle_mention",
  vocabularyLevel: "intermediate",
  humorLevel: "light",
};

const defaultVoice: VoiceSection = {
  defaultVoiceId: null,
  voiceToneDescription: "clear, confident, friendly",
  speakingPaceWPM: 160,
  energyVariationPattern: "steady with emphasis on key points",
  pronunciationDictionary: {},
  multiVoiceSetup: [],
};

const defaultVisualFormat: VisualFormatSection = {
  primaryFormat: "mixed",
  aspectRatioDefault: "16:9",
  imageTierDefault: "standard",
  visualDensityPerMinute: 5,
  visualRelationshipPreference: "match",
  kenBurnsStyle: "standard",
};

const defaultColorPalette: ColorPaletteSection = {
  primaryColor: "#1a1a2e",
  secondaryColor: "#16213e",
  accentColor: "#e94560",
  backgroundMood: "dark",
  fontFamily: "Inter",
  fontWeight: "700",
  fontStyle: "normal",
  textShadowOutline: "2px 2px 4px rgba(0,0,0,0.8)",
};

const defaultThumbnail: ThumbnailSection = {
  thumbnailApproach: "text_heavy",
  textPlacement: "center",
  textColor: "#ffffff",
  textOutline: "3px black",
  backgroundTreatment: "blurred_scene",
  emojiIconUsage: false,
  emojiIconStyle: null,
  consistencyRule: "",
};

const defaultMusicSound: MusicSoundSection = {
  defaultMusicMood: "ambient background",
  musicEnergyCurve: "builds with content",
  soundEffectStyle: "subtle",
  musicVolumeRelativeToVoice: -18,
  introOutroMusicPreference: "same_as_body",
};

const defaultCaptions: CaptionsSection = {
  captionStyle: "animated_word",
  fontFamily: "Inter",
  fontSize: 42,
  position: "bottom_center",
  colorScheme: "white on dark",
  emphasisStyle: "scale_up",
  background: "semi_transparent",
};

const defaultIntroOutro: IntroOutroSection = {
  introTemplateId: null,
  introDurationTarget: 5,
  outroTemplateId: null,
  outroDurationTarget: 10,
  endScreenLayoutPreference: "subscribe button center, two video suggestions",
};

const defaultStructurePacing: StructurePacingSection = {
  targetVideoLengthMinutes: 10,
  shortsTargetLengthSeconds: 50,
  sceneCountTarget: 20,
  transitionStyle: "crossfade",
  transitionDurationSeconds: 0.5,
  chapterGroupingCount: 5,
};

const defaultSEOPatterns: SEOPatternsSection = {
  titlePattern: "Number + Power Word + Topic",
  titleLengthTarget: 60,
  descriptionStructure: "Hook paragraph, key takeaways, timestamps, social links",
  tagStrategy: "broad + specific + long-tail mix",
  shortsHashtagUsage: "3-5 relevant hashtags",
};

const defaultVisualAnchors: VisualAnchorsSection = {
  anchors: [],
};

const defaultShortsOverride: ShortsOverride = {
  hookLengthSeconds: 1.5,
  aspectRatio: "9:16",
  visualDensityPerMinute: 18,
  captionStyle: "animated_word",
  captionPosition: "bottom_center",
  captionBackground: "none",
  introTemplateId: null,
  outroTemplateId: null,
  chaptersEnabled: false,
  musicApproach: "high-energy, trending-style beats",
  targetLengthSeconds: 50,
  sceneCountTarget: 7,
  transitionStyle: "cut",
  transitionDurationSeconds: 0.15,
  seoTitlePattern: "Short, hashtag-focused",
  seoDescriptionStructure: "Minimal, hashtag-heavy",
  thumbnailApproach: "text_heavy",
  endScreenEnabled: false,
};

// ─── Per-template overrides ─────────────────────────────────────────────────

function buildTemplate(overrides: Partial<TemplateProfile>): TemplateProfile {
  return {
    scriptTone: overrides.scriptTone || defaultScriptTone,
    voice: overrides.voice || defaultVoice,
    visualFormat: overrides.visualFormat || defaultVisualFormat,
    colorPalette: overrides.colorPalette || defaultColorPalette,
    thumbnail: overrides.thumbnail || defaultThumbnail,
    musicSound: overrides.musicSound || defaultMusicSound,
    captions: overrides.captions || defaultCaptions,
    introOutro: overrides.introOutro || defaultIntroOutro,
    structurePacing: overrides.structurePacing || defaultStructurePacing,
    seoPatterns: overrides.seoPatterns || defaultSEOPatterns,
    visualAnchors: overrides.visualAnchors || defaultVisualAnchors,
    shortsOverride: overrides.shortsOverride || defaultShortsOverride,
  };
}

export const STYLE_TEMPLATES: Record<StyleTemplateId, TemplateProfile> = {
  true_crime: buildTemplate({
    scriptTone: { ...defaultScriptTone, scriptTone: "suspenseful and dark, slow reveal", hookPattern: "story_teaser", narrativeStructure: "mystery_reveal", humorLevel: "none" },
    voice: { ...defaultVoice, voiceToneDescription: "deep, calm, authoritative with pauses for tension", speakingPaceWPM: 140 },
    colorPalette: { ...defaultColorPalette, primaryColor: "#0d0d0d", secondaryColor: "#1a1a1a", accentColor: "#cc0000", backgroundMood: "dark" },
    thumbnail: { ...defaultThumbnail, thumbnailApproach: "text_heavy", textColor: "#ff0000", backgroundTreatment: "blurred_scene" },
    musicSound: { ...defaultMusicSound, defaultMusicMood: "dark ambient tension", soundEffectStyle: "dramatic" },
  }),

  educational: buildTemplate({
    scriptTone: { ...defaultScriptTone, scriptTone: "clear, energetic, and educational", hookPattern: "statistic", narrativeStructure: "problem_solution", humorLevel: "light" },
    voice: { ...defaultVoice, voiceToneDescription: "bright, enthusiastic, clear articulation", speakingPaceWPM: 170 },
    visualFormat: { ...defaultVisualFormat, primaryFormat: "mixed", visualDensityPerMinute: 6 },
    colorPalette: { ...defaultColorPalette, primaryColor: "#ffffff", secondaryColor: "#f0f4f8", accentColor: "#3b82f6", backgroundMood: "light", fontFamily: "Inter" },
    thumbnail: { ...defaultThumbnail, thumbnailApproach: "text_heavy", textColor: "#1e3a5f", textOutline: "none", backgroundTreatment: "solid_color" },
    musicSound: { ...defaultMusicSound, defaultMusicMood: "upbeat lo-fi background", soundEffectStyle: "subtle" },
  }),

  finance: buildTemplate({
    scriptTone: { ...defaultScriptTone, scriptTone: "professional and data-driven", hookPattern: "bold_claim", narrativeStructure: "linear", vocabularyLevel: "advanced", humorLevel: "none" },
    voice: { ...defaultVoice, voiceToneDescription: "authoritative, measured, confident", speakingPaceWPM: 155 },
    colorPalette: { ...defaultColorPalette, primaryColor: "#0a192f", secondaryColor: "#172a45", accentColor: "#64ffda", backgroundMood: "dark" },
    thumbnail: { ...defaultThumbnail, thumbnailApproach: "minimal", textColor: "#ffffff", backgroundTreatment: "gradient" },
    musicSound: { ...defaultMusicSound, defaultMusicMood: "corporate ambient, subtle and clean" },
  }),

  tech_review: buildTemplate({
    scriptTone: { ...defaultScriptTone, scriptTone: "conversational and analytical", hookPattern: "question", narrativeStructure: "linear", humorLevel: "light" },
    voice: { ...defaultVoice, voiceToneDescription: "conversational, modern, tech-savvy", speakingPaceWPM: 165 },
    visualFormat: { ...defaultVisualFormat, primaryFormat: "stock_footage", visualDensityPerMinute: 4 },
    colorPalette: { ...defaultColorPalette, primaryColor: "#18181b", secondaryColor: "#27272a", accentColor: "#a855f7", backgroundMood: "dark" },
    thumbnail: { ...defaultThumbnail, thumbnailApproach: "minimal", backgroundTreatment: "blurred_scene" },
  }),

  gaming: buildTemplate({
    scriptTone: { ...defaultScriptTone, scriptTone: "high energy and entertaining", hookPattern: "bold_claim", narrativeStructure: "listicle", humorLevel: "moderate" },
    voice: { ...defaultVoice, voiceToneDescription: "energetic, youthful, fast-paced", speakingPaceWPM: 180 },
    visualFormat: { ...defaultVisualFormat, primaryFormat: "mixed", visualDensityPerMinute: 8 },
    colorPalette: { ...defaultColorPalette, primaryColor: "#0f0f23", secondaryColor: "#1a1a3e", accentColor: "#00ff88", backgroundMood: "vibrant" },
    thumbnail: { ...defaultThumbnail, thumbnailApproach: "text_heavy", textColor: "#00ff88", emojiIconUsage: true, emojiIconStyle: "gaming/reaction" },
    musicSound: { ...defaultMusicSound, defaultMusicMood: "upbeat electronic gaming", soundEffectStyle: "dramatic" },
    structurePacing: { ...defaultStructurePacing, targetVideoLengthMinutes: 12, transitionStyle: "cut", transitionDurationSeconds: 0.3 },
  }),

  cooking: buildTemplate({
    scriptTone: { ...defaultScriptTone, scriptTone: "warm, inviting, step-by-step", hookPattern: "cold_open", narrativeStructure: "linear", humorLevel: "light" },
    voice: { ...defaultVoice, voiceToneDescription: "warm, friendly, encouraging", speakingPaceWPM: 150 },
    visualFormat: { ...defaultVisualFormat, primaryFormat: "stock_footage", visualDensityPerMinute: 4 },
    colorPalette: { ...defaultColorPalette, primaryColor: "#fefce8", secondaryColor: "#fef3c7", accentColor: "#f59e0b", backgroundMood: "light" },
    thumbnail: { ...defaultThumbnail, thumbnailApproach: "face_focused", textColor: "#92400e", backgroundTreatment: "blurred_scene" },
    musicSound: { ...defaultMusicSound, defaultMusicMood: "acoustic, warm, kitchen vibes" },
  }),

  travel: buildTemplate({
    scriptTone: { ...defaultScriptTone, scriptTone: "cinematic and immersive storytelling", hookPattern: "cold_open", narrativeStructure: "linear", humorLevel: "none" },
    voice: { ...defaultVoice, voiceToneDescription: "calm, reflective, documentary-style narration", speakingPaceWPM: 140 },
    visualFormat: { ...defaultVisualFormat, primaryFormat: "stock_footage", kenBurnsStyle: "standard", visualDensityPerMinute: 3 },
    colorPalette: { ...defaultColorPalette, primaryColor: "#0c1821", secondaryColor: "#1b2838", accentColor: "#cda434", backgroundMood: "dark" },
    thumbnail: { ...defaultThumbnail, thumbnailApproach: "minimal", textPlacement: "bottom", backgroundTreatment: "blurred_scene" },
    musicSound: { ...defaultMusicSound, defaultMusicMood: "cinematic orchestral, epic and ambient", introOutroMusicPreference: "separate_track" },
    structurePacing: { ...defaultStructurePacing, targetVideoLengthMinutes: 15, transitionStyle: "crossfade", transitionDurationSeconds: 1.0 },
  }),

  health_fitness: buildTemplate({
    scriptTone: { ...defaultScriptTone, scriptTone: "motivational and coaching", hookPattern: "statistic", narrativeStructure: "problem_solution", humorLevel: "light" },
    voice: { ...defaultVoice, voiceToneDescription: "energetic, coaching, motivational", speakingPaceWPM: 165 },
    colorPalette: { ...defaultColorPalette, primaryColor: "#ffffff", secondaryColor: "#f0fdf4", accentColor: "#22c55e", backgroundMood: "light" },
    thumbnail: { ...defaultThumbnail, thumbnailApproach: "before_after", textColor: "#166534", backgroundTreatment: "solid_color" },
    musicSound: { ...defaultMusicSound, defaultMusicMood: "upbeat motivational pop" },
  }),

  story_commentary: buildTemplate({
    scriptTone: { ...defaultScriptTone, scriptTone: "casual, personality-driven, opinionated", hookPattern: "bold_claim", narrativeStructure: "linear", humorLevel: "moderate" },
    voice: { ...defaultVoice, voiceToneDescription: "casual, relatable, like talking to a friend", speakingPaceWPM: 170 },
    colorPalette: { ...defaultColorPalette, primaryColor: "#1c1917", secondaryColor: "#292524", accentColor: "#fb923c", backgroundMood: "dark" },
    thumbnail: { ...defaultThumbnail, thumbnailApproach: "text_heavy", emojiIconUsage: true, emojiIconStyle: "reaction/expressive" },
    musicSound: { ...defaultMusicSound, defaultMusicMood: "lo-fi chill background" },
  }),

  shorts_viral: buildTemplate({
    scriptTone: { ...defaultScriptTone, scriptTone: "fast, punchy, hook-driven", hookPattern: "bold_claim", preferredHookLengthSeconds: 2, narrativeStructure: "listicle", humorLevel: "moderate" },
    voice: { ...defaultVoice, voiceToneDescription: "high energy, fast-paced, TikTok style", speakingPaceWPM: 190 },
    visualFormat: { ...defaultVisualFormat, aspectRatioDefault: "9:16", visualDensityPerMinute: 20 },
    colorPalette: { ...defaultColorPalette, primaryColor: "#000000", secondaryColor: "#111111", accentColor: "#ff3366", backgroundMood: "vibrant" },
    thumbnail: { ...defaultThumbnail, thumbnailApproach: "text_heavy", textColor: "#ff3366" },
    musicSound: { ...defaultMusicSound, defaultMusicMood: "high-energy trending beats" },
    structurePacing: { ...defaultStructurePacing, targetVideoLengthMinutes: 1, shortsTargetLengthSeconds: 45, sceneCountTarget: 7, transitionStyle: "cut", transitionDurationSeconds: 0.15 },
  }),
};

export function getTemplateProfile(templateId: StyleTemplateId): TemplateProfile {
  return STYLE_TEMPLATES[templateId];
}

export function getTemplateMeta(templateId: StyleTemplateId): StyleTemplateMeta | undefined {
  return STYLE_TEMPLATE_META.find((t) => t.id === templateId);
}
