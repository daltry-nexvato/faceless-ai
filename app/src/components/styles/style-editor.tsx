"use client";

import { useState } from "react";
import { StyleSectionCard } from "./style-section-card";
import { StyleField } from "./style-field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Style } from "@/lib/types/styles";

interface StyleEditorProps {
  style: Style;
  onUpdateSection: (section: string, value: unknown) => Promise<void>;
  onSaveVersion: () => void;
  isSaving: boolean;
}

export function StyleEditor({ style, onUpdateSection, onSaveVersion, isSaving }: StyleEditorProps) {
  const [viewMode, setViewMode] = useState<"longform" | "shorts">("longform");

  const scoreColor = (score: number): "green" | "yellow" | "red" =>
    score >= 70 ? "green" : score >= 40 ? "yellow" : "red";

  const longFormScore = style.score?.longForm;
  const shortsScore = style.score?.shorts;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">{style.name}</h2>
          <p className="text-sm text-zinc-500">
            Version {style.currentVersion} &middot; Last updated{" "}
            {new Date(style.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Style Score badge */}
          {style.score && (
            <div className="flex items-center gap-2">
              {longFormScore && (
                <Badge
                  className={cn(
                    "text-xs",
                    longFormScore.overall >= 70
                      ? "bg-green-100 text-green-700"
                      : longFormScore.overall >= 40
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  Long-form: {longFormScore.overall}
                </Badge>
              )}
              {shortsScore && (
                <Badge
                  className={cn(
                    "text-xs",
                    shortsScore.overall >= 70
                      ? "bg-green-100 text-green-700"
                      : shortsScore.overall >= 40
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  Shorts: {shortsScore.overall}
                </Badge>
              )}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={onSaveVersion} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save as New Version"}
          </Button>
        </div>
      </div>

      {/* Format Toggle */}
      <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 w-fit">
        <button
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            viewMode === "longform"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900"
          )}
          onClick={() => setViewMode("longform")}
        >
          Long-Form Settings
        </button>
        <button
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            viewMode === "shorts"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900"
          )}
          onClick={() => setViewMode("shorts")}
        >
          Shorts Settings
        </button>
      </div>

      {/* Section Cards */}
      <div className="space-y-3">
        {/* Section 1: Script & Tone */}
        <StyleSectionCard
          title="Script & Tone"
          description="How your scripts are written — tone, hooks, structure"
          defaultOpen
          scoreLabel={longFormScore ? `Hook: ${longFormScore.hook}` : undefined}
          scoreColor={longFormScore ? scoreColor(longFormScore.hook) : undefined}
        >
          <div className="space-y-0">
            <StyleField label="Script Tone" value={style.scriptTone.scriptTone} onSave={(v) => onUpdateSection("scriptTone", { ...style.scriptTone, scriptTone: v })} />
            <StyleField label="Hook Pattern" value={style.scriptTone.hookPattern} type="select" options={[{ label: "Cold Open", value: "cold_open" }, { label: "Question", value: "question" }, { label: "Statistic", value: "statistic" }, { label: "Story Teaser", value: "story_teaser" }, { label: "Bold Claim", value: "bold_claim" }]} onSave={(v) => onUpdateSection("scriptTone", { ...style.scriptTone, hookPattern: v })} />
            <StyleField label="Hook Length (seconds)" value={viewMode === "shorts" && style.shortsOverride.hookLengthSeconds ? style.shortsOverride.hookLengthSeconds : style.scriptTone.preferredHookLengthSeconds} type="number" onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, hookLengthSeconds: v }) : onUpdateSection("scriptTone", { ...style.scriptTone, preferredHookLengthSeconds: v })} />
            <StyleField label="Narrative Structure" value={style.scriptTone.narrativeStructure} type="select" options={[{ label: "Linear", value: "linear" }, { label: "Mystery Reveal", value: "mystery_reveal" }, { label: "Problem-Solution", value: "problem_solution" }, { label: "Listicle", value: "listicle" }]} onSave={(v) => onUpdateSection("scriptTone", { ...style.scriptTone, narrativeStructure: v })} />
            <StyleField label="Vocabulary Level" value={style.scriptTone.vocabularyLevel} type="select" options={[{ label: "Simple", value: "simple" }, { label: "Intermediate", value: "intermediate" }, { label: "Advanced", value: "advanced" }]} onSave={(v) => onUpdateSection("scriptTone", { ...style.scriptTone, vocabularyLevel: v })} />
            <StyleField label="Humor Level" value={style.scriptTone.humorLevel} type="select" options={[{ label: "None", value: "none" }, { label: "Light", value: "light" }, { label: "Moderate", value: "moderate" }, { label: "Heavy", value: "heavy" }]} onSave={(v) => onUpdateSection("scriptTone", { ...style.scriptTone, humorLevel: v })} />
          </div>
        </StyleSectionCard>

        {/* Section 2: Voice */}
        <StyleSectionCard title="Voice" description="Voice selection, pacing, and pronunciation">
          <div className="space-y-0">
            <StyleField label="Voice Tone" value={style.voice.voiceToneDescription} onSave={(v) => onUpdateSection("voice", { ...style.voice, voiceToneDescription: v })} />
            <StyleField label="Speaking Pace (WPM)" value={style.voice.speakingPaceWPM} type="number" onSave={(v) => onUpdateSection("voice", { ...style.voice, speakingPaceWPM: v })} />
            <StyleField label="Energy Pattern" value={style.voice.energyVariationPattern} onSave={(v) => onUpdateSection("voice", { ...style.voice, energyVariationPattern: v })} />
          </div>
        </StyleSectionCard>

        {/* Section 3: Visual Format */}
        <StyleSectionCard title="Visual Format" description="Image style, aspect ratio, visual density">
          <div className="space-y-0">
            <StyleField label="Primary Format" value={style.visualFormat.primaryFormat} type="select" options={[{ label: "Stock Footage", value: "stock_footage" }, { label: "AI Generated", value: "ai_generated" }, { label: "Mixed", value: "mixed" }, { label: "Animation", value: "animation" }]} onSave={(v) => onUpdateSection("visualFormat", { ...style.visualFormat, primaryFormat: v })} />
            <StyleField label="Aspect Ratio" value={viewMode === "shorts" && style.shortsOverride.aspectRatio ? style.shortsOverride.aspectRatio : style.visualFormat.aspectRatioDefault} type="select" options={[{ label: "16:9 (Landscape)", value: "16:9" }, { label: "9:16 (Portrait)", value: "9:16" }, { label: "1:1 (Square)", value: "1:1" }]} onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, aspectRatio: v }) : onUpdateSection("visualFormat", { ...style.visualFormat, aspectRatioDefault: v })} />
            <StyleField label="Image Tier" value={style.visualFormat.imageTierDefault} type="select" options={[{ label: "Draft (Fast)", value: "draft" }, { label: "Standard", value: "standard" }, { label: "Premium (Best)", value: "premium" }]} onSave={(v) => onUpdateSection("visualFormat", { ...style.visualFormat, imageTierDefault: v })} />
            <StyleField label="Visual Changes/Min" value={viewMode === "shorts" && style.shortsOverride.visualDensityPerMinute ? style.shortsOverride.visualDensityPerMinute : style.visualFormat.visualDensityPerMinute} type="number" onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, visualDensityPerMinute: v }) : onUpdateSection("visualFormat", { ...style.visualFormat, visualDensityPerMinute: v })} />
          </div>
        </StyleSectionCard>

        {/* Section 4: Color Palette */}
        <StyleSectionCard title="Color Palette & Typography" description="Colors, fonts, and text styling">
          <div className="space-y-0">
            <StyleField label="Primary Color" value={style.colorPalette.primaryColor} type="color" onSave={(v) => onUpdateSection("colorPalette", { ...style.colorPalette, primaryColor: v })} />
            <StyleField label="Secondary Color" value={style.colorPalette.secondaryColor} type="color" onSave={(v) => onUpdateSection("colorPalette", { ...style.colorPalette, secondaryColor: v })} />
            <StyleField label="Accent Color" value={style.colorPalette.accentColor} type="color" onSave={(v) => onUpdateSection("colorPalette", { ...style.colorPalette, accentColor: v })} />
            <StyleField label="Background Mood" value={style.colorPalette.backgroundMood} type="select" options={[{ label: "Dark", value: "dark" }, { label: "Light", value: "light" }, { label: "Neutral", value: "neutral" }, { label: "Vibrant", value: "vibrant" }]} onSave={(v) => onUpdateSection("colorPalette", { ...style.colorPalette, backgroundMood: v })} />
            <StyleField label="Font Family" value={style.colorPalette.fontFamily} onSave={(v) => onUpdateSection("colorPalette", { ...style.colorPalette, fontFamily: v })} />
          </div>
        </StyleSectionCard>

        {/* Section 5: Thumbnail */}
        <StyleSectionCard
          title="Thumbnail Template"
          description="How your video thumbnails look"
          scoreLabel={longFormScore ? `Thumb: ${longFormScore.thumbnail}` : undefined}
          scoreColor={longFormScore ? scoreColor(longFormScore.thumbnail) : undefined}
        >
          <div className="space-y-0">
            <StyleField label="Approach" value={style.thumbnail.thumbnailApproach} type="select" options={[{ label: "Text Heavy", value: "text_heavy" }, { label: "Face Focused", value: "face_focused" }, { label: "Minimal", value: "minimal" }, { label: "Collage", value: "collage" }, { label: "Before/After", value: "before_after" }]} onSave={(v) => onUpdateSection("thumbnail", { ...style.thumbnail, thumbnailApproach: v })} />
            <StyleField label="Text Placement" value={style.thumbnail.textPlacement} type="select" options={[{ label: "Top", value: "top" }, { label: "Bottom", value: "bottom" }, { label: "Center", value: "center" }, { label: "Left Third", value: "left_third" }, { label: "Right Third", value: "right_third" }]} onSave={(v) => onUpdateSection("thumbnail", { ...style.thumbnail, textPlacement: v })} />
            <StyleField label="Text Color" value={style.thumbnail.textColor} type="color" onSave={(v) => onUpdateSection("thumbnail", { ...style.thumbnail, textColor: v })} />
            <StyleField label="Background" value={style.thumbnail.backgroundTreatment} type="select" options={[{ label: "Blurred Scene", value: "blurred_scene" }, { label: "Solid Color", value: "solid_color" }, { label: "Gradient", value: "gradient" }, { label: "AI Generated", value: "ai_generated" }]} onSave={(v) => onUpdateSection("thumbnail", { ...style.thumbnail, backgroundTreatment: v })} />
          </div>
        </StyleSectionCard>

        {/* Section 6: Music & Sound */}
        <StyleSectionCard title="Music & Sound" description="Background music mood and sound effects">
          <div className="space-y-0">
            <StyleField label="Music Mood" value={viewMode === "shorts" && style.shortsOverride.musicApproach ? style.shortsOverride.musicApproach : style.musicSound.defaultMusicMood} onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, musicApproach: v }) : onUpdateSection("musicSound", { ...style.musicSound, defaultMusicMood: v })} />
            <StyleField label="Sound Effects" value={style.musicSound.soundEffectStyle} type="select" options={[{ label: "Realistic", value: "realistic" }, { label: "Dramatic", value: "dramatic" }, { label: "Subtle", value: "subtle" }, { label: "Cartoon", value: "cartoon" }]} onSave={(v) => onUpdateSection("musicSound", { ...style.musicSound, soundEffectStyle: v })} />
            <StyleField label="Music Volume (dB vs voice)" value={style.musicSound.musicVolumeRelativeToVoice} type="number" onSave={(v) => onUpdateSection("musicSound", { ...style.musicSound, musicVolumeRelativeToVoice: v })} />
          </div>
        </StyleSectionCard>

        {/* Section 7: Captions */}
        <StyleSectionCard title="Captions" description="Caption style, font, and animation">
          <div className="space-y-0">
            <StyleField label="Caption Style" value={viewMode === "shorts" && style.shortsOverride.captionStyle ? style.shortsOverride.captionStyle : style.captions.captionStyle} type="select" options={[{ label: "Animated Word-by-Word", value: "animated_word" }, { label: "Sentence Blocks", value: "sentence_blocks" }, { label: "Karaoke Highlight", value: "karaoke_highlight" }]} onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, captionStyle: v }) : onUpdateSection("captions", { ...style.captions, captionStyle: v })} />
            <StyleField label="Font Size" value={style.captions.fontSize} type="number" onSave={(v) => onUpdateSection("captions", { ...style.captions, fontSize: v })} />
            <StyleField label="Position" value={viewMode === "shorts" && style.shortsOverride.captionPosition ? style.shortsOverride.captionPosition : style.captions.position} type="select" options={[{ label: "Bottom Center", value: "bottom_center" }, { label: "Top", value: "top" }, { label: "Custom", value: "custom" }]} onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, captionPosition: v }) : onUpdateSection("captions", { ...style.captions, position: v })} />
            <StyleField label="Emphasis" value={style.captions.emphasisStyle} type="select" options={[{ label: "Color Change", value: "color_change" }, { label: "Scale Up", value: "scale_up" }, { label: "Glow", value: "glow" }, { label: "Underline", value: "underline" }]} onSave={(v) => onUpdateSection("captions", { ...style.captions, emphasisStyle: v })} />
          </div>
        </StyleSectionCard>

        {/* Section 8: Intro/Outro */}
        <StyleSectionCard title="Intro / Outro" description="Opening and closing sequences">
          <div className="space-y-0">
            <StyleField label="Intro Duration (seconds)" value={style.introOutro.introDurationTarget} type="number" onSave={(v) => onUpdateSection("introOutro", { ...style.introOutro, introDurationTarget: v })} />
            <StyleField label="Outro Duration (seconds)" value={style.introOutro.outroDurationTarget} type="number" onSave={(v) => onUpdateSection("introOutro", { ...style.introOutro, outroDurationTarget: v })} />
            <StyleField label="End Screen Layout" value={style.introOutro.endScreenLayoutPreference} onSave={(v) => onUpdateSection("introOutro", { ...style.introOutro, endScreenLayoutPreference: v })} />
            {viewMode === "shorts" && (
              <p className="text-xs text-zinc-400 py-2 italic">Shorts typically don&apos;t use intro/outro sequences.</p>
            )}
          </div>
        </StyleSectionCard>

        {/* Section 9: Structure & Pacing */}
        <StyleSectionCard
          title="Structure & Pacing"
          description="Video length, scene count, transitions"
          scoreLabel={longFormScore ? `Pacing: ${longFormScore.pacing}` : undefined}
          scoreColor={longFormScore ? scoreColor(longFormScore.pacing) : undefined}
        >
          <div className="space-y-0">
            <StyleField label={viewMode === "shorts" ? "Target Length (seconds)" : "Target Length (minutes)"} value={viewMode === "shorts" ? (style.shortsOverride.targetLengthSeconds ?? style.structurePacing.shortsTargetLengthSeconds) : style.structurePacing.targetVideoLengthMinutes} type="number" onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, targetLengthSeconds: v }) : onUpdateSection("structurePacing", { ...style.structurePacing, targetVideoLengthMinutes: v })} />
            <StyleField label="Scene Count Target" value={viewMode === "shorts" ? (style.shortsOverride.sceneCountTarget ?? style.structurePacing.sceneCountTarget) : style.structurePacing.sceneCountTarget} type="number" onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, sceneCountTarget: v }) : onUpdateSection("structurePacing", { ...style.structurePacing, sceneCountTarget: v })} />
            <StyleField label="Transition Style" value={viewMode === "shorts" ? (style.shortsOverride.transitionStyle ?? style.structurePacing.transitionStyle) : style.structurePacing.transitionStyle} type="select" options={[{ label: "Cut", value: "cut" }, { label: "Crossfade", value: "crossfade" }, { label: "Wipe", value: "wipe" }, { label: "Zoom", value: "zoom" }]} onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, transitionStyle: v }) : onUpdateSection("structurePacing", { ...style.structurePacing, transitionStyle: v })} />
            <StyleField label="Transition Duration (seconds)" value={viewMode === "shorts" ? (style.shortsOverride.transitionDurationSeconds ?? style.structurePacing.transitionDurationSeconds) : style.structurePacing.transitionDurationSeconds} type="number" onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, transitionDurationSeconds: v }) : onUpdateSection("structurePacing", { ...style.structurePacing, transitionDurationSeconds: v })} />
          </div>
        </StyleSectionCard>

        {/* Section 10: SEO Patterns */}
        <StyleSectionCard
          title="SEO Patterns"
          description="Title patterns, descriptions, tags"
          scoreLabel={longFormScore ? `SEO: ${longFormScore.seo}` : undefined}
          scoreColor={longFormScore ? scoreColor(longFormScore.seo) : undefined}
        >
          <div className="space-y-0">
            <StyleField label="Title Pattern" value={viewMode === "shorts" && style.shortsOverride.seoTitlePattern ? style.shortsOverride.seoTitlePattern : style.seoPatterns.titlePattern} onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, seoTitlePattern: v }) : onUpdateSection("seoPatterns", { ...style.seoPatterns, titlePattern: v })} />
            <StyleField label="Title Length Target" value={style.seoPatterns.titleLengthTarget} type="number" onSave={(v) => onUpdateSection("seoPatterns", { ...style.seoPatterns, titleLengthTarget: v })} />
            <StyleField label="Description Structure" value={viewMode === "shorts" && style.shortsOverride.seoDescriptionStructure ? style.shortsOverride.seoDescriptionStructure : style.seoPatterns.descriptionStructure} onSave={(v) => viewMode === "shorts" ? onUpdateSection("shortsOverride", { ...style.shortsOverride, seoDescriptionStructure: v }) : onUpdateSection("seoPatterns", { ...style.seoPatterns, descriptionStructure: v })} />
            <StyleField label="Tag Strategy" value={style.seoPatterns.tagStrategy} onSave={(v) => onUpdateSection("seoPatterns", { ...style.seoPatterns, tagStrategy: v })} />
          </div>
        </StyleSectionCard>

        {/* Section 11: Visual Anchors */}
        <StyleSectionCard title="Visual Anchors" description="Recurring visual elements for consistency across videos">
          <div className="space-y-2">
            {style.visualAnchors.anchors.length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">
                No Visual Anchors yet. These are recurring characters, logos, or elements that appear consistently across your videos.
              </p>
            ) : (
              style.visualAnchors.anchors.map((anchor) => (
                <div key={anchor.anchorId} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{anchor.name}</p>
                    <p className="text-xs text-zinc-500 capitalize">{anchor.type.replace(/_/g, " ")} &middot; {anchor.formatApplicability.replace(/_/g, " ")}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{anchor.description}</p>
                  </div>
                </div>
              ))
            )}
            <p className="text-xs text-zinc-400 mt-2">
              Visual Anchor management coming with the Images module.
            </p>
          </div>
        </StyleSectionCard>
      </div>
    </div>
  );
}
