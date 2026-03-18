// ─── Section 1: Script & Tone ───────────────────────────────────────────────

export type HookPattern = "cold_open" | "question" | "statistic" | "story_teaser" | "bold_claim";
export type NarrativeStructure = "linear" | "mystery_reveal" | "problem_solution" | "listicle";
export type CTAStyle = "subtle_mention" | "direct_ask" | "end_card_focused";
export type VocabularyLevel = "simple" | "intermediate" | "advanced";
export type HumorLevel = "none" | "light" | "moderate" | "heavy";

export interface ScriptToneSection {
  scriptTone: string;
  hookPattern: HookPattern;
  preferredHookLengthSeconds: number;
  narrativeStructure: NarrativeStructure;
  pacingPerSection: string;
  ctaStyle: CTAStyle;
  vocabularyLevel: VocabularyLevel;
  humorLevel: HumorLevel;
}

// ─── Section 2: Voice ───────────────────────────────────────────────────────

export interface VoiceCharacter {
  role: string;
  voiceId: string;
  description: string;
}

export interface VoiceSection {
  defaultVoiceId: string | null;
  voiceToneDescription: string;
  speakingPaceWPM: number;
  energyVariationPattern: string;
  pronunciationDictionary: Record<string, string>;
  multiVoiceSetup: VoiceCharacter[];
}

// ─── Section 3: Visual Format ───────────────────────────────────────────────

export type VisualFormat = "stock_footage" | "ai_generated" | "mixed" | "animation";
export type AspectRatio = "16:9" | "9:16" | "1:1";
export type ImageTier = "draft" | "standard" | "premium";
export type VisualRelationship = "match" | "contrast" | "supplement" | "atmospheric";
export type KenBurnsStyle = "standard" | "parallax_depth";

export interface VisualFormatSection {
  primaryFormat: VisualFormat;
  aspectRatioDefault: AspectRatio;
  imageTierDefault: ImageTier;
  visualDensityPerMinute: number;
  visualRelationshipPreference: VisualRelationship;
  kenBurnsStyle: KenBurnsStyle;
}

// ─── Section 4: Color Palette & Typography ──────────────────────────────────

export interface ColorPaletteSection {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundMood: "dark" | "light" | "neutral" | "vibrant";
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textShadowOutline: string;
}

// ─── Section 5: Thumbnail Template ──────────────────────────────────────────

export type ThumbnailApproach = "text_heavy" | "face_focused" | "minimal" | "collage" | "before_after";
export type TextPlacement = "top" | "bottom" | "center" | "left_third" | "right_third";
export type BackgroundTreatment = "blurred_scene" | "solid_color" | "gradient" | "ai_generated";

export interface ThumbnailSection {
  thumbnailApproach: ThumbnailApproach;
  textPlacement: TextPlacement;
  textColor: string;
  textOutline: string;
  backgroundTreatment: BackgroundTreatment;
  emojiIconUsage: boolean;
  emojiIconStyle: string | null;
  consistencyRule: string;
}

// ─── Section 6: Music & Sound ───────────────────────────────────────────────

export type SoundEffectStyle = "realistic" | "dramatic" | "subtle" | "cartoon";

export interface MusicSoundSection {
  defaultMusicMood: string;
  musicEnergyCurve: string;
  soundEffectStyle: SoundEffectStyle;
  musicVolumeRelativeToVoice: number;
  introOutroMusicPreference: "separate_track" | "same_as_body";
}

// ─── Section 7: Captions ────────────────────────────────────────────────────

export type CaptionStyle = "animated_word" | "sentence_blocks" | "karaoke_highlight";
export type CaptionPosition = "bottom_center" | "top" | "custom";
export type CaptionEmphasis = "color_change" | "scale_up" | "glow" | "underline";
export type CaptionBackground = "none" | "semi_transparent" | "full_bar";

export interface CaptionsSection {
  captionStyle: CaptionStyle;
  fontFamily: string;
  fontSize: number;
  position: CaptionPosition;
  colorScheme: string;
  emphasisStyle: CaptionEmphasis;
  background: CaptionBackground;
}

// ─── Section 8: Intro/Outro ─────────────────────────────────────────────────

export interface IntroOutroSection {
  introTemplateId: string | null;
  introDurationTarget: number;
  outroTemplateId: string | null;
  outroDurationTarget: number;
  endScreenLayoutPreference: string;
}

// ─── Section 9: Structure & Pacing ──────────────────────────────────────────

export type TransitionStyle = "cut" | "crossfade" | "wipe" | "zoom";

export interface StructurePacingSection {
  targetVideoLengthMinutes: number;
  shortsTargetLengthSeconds: number;
  sceneCountTarget: number;
  transitionStyle: TransitionStyle;
  transitionDurationSeconds: number;
  chapterGroupingCount: number;
}

// ─── Section 10: SEO Patterns ───────────────────────────────────────────────

export interface SEOPatternsSection {
  titlePattern: string;
  titleLengthTarget: number;
  descriptionStructure: string;
  tagStrategy: string;
  shortsHashtagUsage: string;
}

// ─── Section 11: Visual Anchors ─────────────────────────────────────────────

export type VisualAnchorType = "character" | "object" | "setting" | "logo";
export type FormatApplicability = "both" | "long_form_only" | "shorts_only";

export interface VisualAnchor {
  anchorId: string;
  name: string;
  type: VisualAnchorType;
  referenceImageS3Key: string | null;
  description: string;
  usageRules: string;
  formatApplicability: FormatApplicability;
  falaiReferenceData: {
    model: string;
    seed: number;
    prompt: string;
  } | null;
}

export interface VisualAnchorsSection {
  anchors: VisualAnchor[];
}

// ─── Shorts Override ────────────────────────────────────────────────────────

export interface ShortsOverride {
  hookLengthSeconds?: number;
  aspectRatio?: AspectRatio;
  visualDensityPerMinute?: number;
  captionStyle?: CaptionStyle;
  captionPosition?: CaptionPosition;
  captionBackground?: CaptionBackground;
  introTemplateId?: string | null;
  outroTemplateId?: string | null;
  chaptersEnabled?: boolean;
  musicApproach?: string;
  targetLengthSeconds?: number;
  sceneCountTarget?: number;
  transitionStyle?: TransitionStyle;
  transitionDurationSeconds?: number;
  seoTitlePattern?: string;
  seoDescriptionStructure?: string;
  thumbnailApproach?: ThumbnailApproach;
  endScreenEnabled?: boolean;
}

// ─── Style Score ────────────────────────────────────────────────────────────

export interface StyleScoreBreakdown {
  thumbnail: number;
  hook: number;
  pacing: number;
  seo: number;
  overall: number;
}

export interface StyleScore {
  longForm: StyleScoreBreakdown | null;
  shorts: StyleScoreBreakdown | null;
  confidence: "low" | "medium" | "high" | "limited_data";
  lastCalculatedAt: string;
}

// ─── Full Style Profile ─────────────────────────────────────────────────────

export interface Style {
  accountId: string;
  styleId: string;
  channelId: string | null;
  name: string;
  niche: string | null;
  isStandalone: boolean;
  currentVersion: number;

  // 11 Sections
  scriptTone: ScriptToneSection;
  voice: VoiceSection;
  visualFormat: VisualFormatSection;
  colorPalette: ColorPaletteSection;
  thumbnail: ThumbnailSection;
  musicSound: MusicSoundSection;
  captions: CaptionsSection;
  introOutro: IntroOutroSection;
  structurePacing: StructurePacingSection;
  seoPatterns: SEOPatternsSection;
  visualAnchors: VisualAnchorsSection;

  // Shorts Override
  shortsOverride: ShortsOverride;

  // Style Score
  score: StyleScore | null;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ─── Style Version (snapshot) ───────────────────────────────────────────────

export interface StyleVersion {
  styleId: string;
  versionNumber: number;
  snapshot: Omit<Style, "accountId" | "styleId" | "channelId" | "name" | "isStandalone" | "currentVersion" | "createdAt" | "updatedAt">;
  changeSummary: string;
  userNote: string | null;
  createdAt: string;
}

// ─── Pinned Style (copied into project) ─────────────────────────────────────

export interface PinnedStyle {
  sourceStyleId: string;
  sourceVersionNumber: number;
  snapshot: Style;
  pinnedAt: string;
}

// ─── Style Template ─────────────────────────────────────────────────────────

export type StyleTemplateId =
  | "true_crime"
  | "educational"
  | "finance"
  | "tech_review"
  | "gaming"
  | "cooking"
  | "travel"
  | "health_fitness"
  | "story_commentary"
  | "shorts_viral";

export interface StyleTemplateMeta {
  id: StyleTemplateId;
  name: string;
  description: string;
  niche: string;
}
