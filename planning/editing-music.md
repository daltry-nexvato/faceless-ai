# Editing / Music Module — Finalized Spec (Audited)

## What This Module Does
Takes all the pieces from previous steps — script, voiceover, images, video clips — and assembles them into a finished video ready for export/publish. This is the final assembly line. The editor is an "approval and adjustment" tool, not a full NLE like Premiere Pro. The AI does the heavy lifting. The user reviews and tweaks.

---

## Inputs (from previous modules)
- **Voiceover audio** — per-scene WAV/MP3 files with word-level timestamps
- **Still images** — approved images per visual slot
- **AI video clips** — approved clips from Video Generation module, audio stripped
- **Stock video clips** — from Pexels/Pixabay (handled by Images module)
- **Scene timing data** — exact duration per scene from voiceover (voice-first architecture)
- **Caption data** — word-level timestamps + emphasis markers + speaker IDs (if multi-voice)
- **Style settings** — fonts, colors, transition preferences, LUT presets from Channel Style
- **Script** — narrator text, energy markers, scene directions, visual_sequence timestamps, music_mood, music_energy, sound_effects per scene

---

## Editor UI Layout

### Visual Timeline Interface
- **Top section:** Large video preview player with playback controls
- **Bottom section:** Horizontal timeline with multiple lanes:
  - **Visual track:** Image/clip thumbnails laid out by duration, scene dividers visible
  - **Voiceover track:** Audio waveform showing speech patterns
  - **Music track:** Music waveform with ducking automation visible
  - **Sound effects track:** One-shot markers and ambient ranges
  - **Caption track:** Caption text markers synced to words
- **Timeline controls:**
  - Scrub/seek through timeline by clicking or dragging
  - Click any scene to jump to it
  - Zoom in/out for fine vs broad view
  - Scene dividers clearly marked and labeled

---

## What Gets Assembled

### 1. Timeline Construction
- Each scene becomes a segment on the timeline
- Scene duration = voiceover duration (voice-first architecture)
- **Visual slot sequencing:** The script defines a `visual_sequence` array per scene with timestamps (e.g., "0:00-0:15 aerial mountains, 0:15-0:30 archival map"). These timestamps are the source of truth for how long each image/clip shows within a scene.
- If no timestamps exist (user skipped scene directions): system falls back to even distribution (scene duration / number of visual slots)
- User can drag visual slot boundaries on the timeline to adjust manually
- Still images get Ken Burns effects (pan, zoom, slow drift) to create motion
- Video clips play at their natural duration, remaining time filled with images

### 2. Ken Burns Effects (Two Modes)
- **Standard Ken Burns:** Simple 2D pan/zoom/drift. Default for all images. No extra processing. User adjusts direction and speed per image.
- **Parallax Ken Burns (Premium):** Uses depth estimation (Marigold/Midas from fal.ai) to create a 3D parallax effect — foreground moves faster than background. Much more cinematic.
  - Costs 5 extra credits per image (depth map generation)
  - Available on Creator+ tiers only
  - User toggles between Standard and Parallax per image
  - System shows a "parallax suitability" indicator based on depth map quality (some images work better than others)

### 3. Transitions Between Scenes
- Options: cut, crossfade, fade to black, slide, zoom
- **Adjustable duration:** 0.1s to 2.0s slider per transition (default 0.5s)
- Configurable per transition or globally ("Apply to all transitions")
- Transition style default comes from Channel Style (user can override per scene)
- AI suggests transitions based on scene mood (e.g., dramatic reveal = fade to black, fast-paced = quick cut) and duration based on pacing (fast scenes = 0.2-0.3s, dramatic moments = 1.0-1.5s)

### 4. Caption/Subtitle Overlay
- Word-by-word animated captions (the trending style for faceless videos)
- Powered by word-level timestamps from ElevenLabs TTS
- Caption styles: word-by-word highlight, sentence blocks, karaoke-style, none
- Font, size, color, position, background — all from Channel Style
- Emphasis words get different color/size (from script energy markers)
- **Multi-voice differentiation:** When Text-to-Dialogue is used (multiple speakers), caption data includes a `speaker_id` per word segment. Each speaker gets a configurable caption color (default: Speaker 1 = white, Speaker 2 = yellow, Speaker 3 = cyan). Optional speaker label appears briefly on first switch ("Narrator:", "Expert:", etc.). User can customize colors and labels per speaker.
- **Shorts/vertical format:** Larger captions, centered on screen, bigger font for mobile viewing

### 5. Color Grading / Visual Consistency
- Images from different sources (AI, stock, upload) have different color temperatures
- During rendering, FFmpeg applies a lightweight color grading pass:
  - **Auto color matching:** Normalize brightness/contrast across all images to a consistent baseline
  - **Style LUT:** Apply a color lookup table from the Channel Style (cinematic, warm, cool, high contrast, dark moody, vintage)
  - 5-6 preset LUTs in v1, admin can add more later
- Per-scene override: user can toggle color grading off for individual scenes or adjust intensity slider
- The script's `color_tone` per scene informs the grading — subtle pass, not heavy-handed filters
- Goal: make stock photos and AI images feel like they belong in the same video

### 6. Background Music
- **ElevenLabs Music** (primary) — AI-generated music matching mood/genre
- **Mubert** (backup) — if ElevenLabs Music doesn't fit
- Music settings per project:
  - Genre/mood (auto-suggested from script's `music_mood` per scene)
  - Volume level (default: -20dB under voiceover)
  - Fade in/out at video start/end
  - **Ducking:** Music volume automatically drops during voiceover, rises during pauses. Uses timestamp-based volume automation from voiceover timing data.
- **Duration handling for long videos:**
  - ElevenLabs Music and Mubert have generation limits (~3-5 min per call)
  - For videos longer than the limit: system generates music in segments, each matching the mood/energy of those scenes (driven by `music_mood` and `music_energy` per scene from the script)
  - Segments crossfade into each other (2-3 second overlap) for seamless transitions
  - This creates better results than one long track — music mood shifts with content
  - For shorter videos (under 5 min): single generation covers it
- User can preview, regenerate, or upload their own full-length music track
- **Cost:** 50 credits per minute of generated music

### 7. Sound Effects
- **Two types:**
  - **One-shot:** Plays once at a specific timestamp (whoosh, ding, impact). Placed as a point marker on the timeline.
  - **Ambient/Loop:** Plays continuously for a defined duration (rain, crowd, traffic). Placed as a range on the timeline — user drags start/end points. Auto-loops if source clip is shorter than the defined range.
- Source: ElevenLabs SFX API (script defines sound_effects per scene)
- User can add/remove/reposition sound effects on the timeline
- Volume adjustable per effect
- Ambient effects duck slightly under voiceover (-10dB, less aggressive than music's -20dB)

### 8. Intro/Outro
- **Templates:** 15-20 pre-built templates at launch, categorized by style (minimal, bold, cinematic, playful, professional)
- Each template is a short segment (intro: 3-5 seconds, outro: 5-10 seconds) with customizable elements:
  - Channel name (auto-filled from Channel settings)
  - Logo placeholder (if user has uploaded a logo)
  - Tagline text (editable)
  - Colors (pulled from Channel Style palette, user can override)
  - Background animation style (particle, gradient, geometric, etc.)
- Templates rendered via FFmpeg with customized values — not pre-recorded video files
- User can also upload a fully custom intro/outro clip (MP4/MOV) and skip templates
- Intro/outro saved at Channel level — reused across all projects, editable anytime
- Optional — can be toggled on/off per project

### 9. YouTube End Screen Safe Zone
- During the outro section (last 5-20 seconds), the editor shows a semi-transparent overlay grid marking YouTube's end screen zones (subscribe buttons, video suggestions appear in bottom-right, bottom-left, center-right)
- System warns if critical visual content overlaps with end screen zones
- The Publishing module handles actually adding end screen elements via YouTube API — the editor just keeps the space clear
- User can toggle the safe zone overlay on/off

---

## Audio Final Mix (This Module Owns It)

Per the voiceover audit: voiceover module handles per-scene audio cleanup (normalization, compression, high-pass, de-essing, format standardization). This module handles the final mix:

- Layer voiceover on primary audio track
- Layer background music on secondary track with timestamp-based ducking
- Layer sound effects on tertiary track (one-shots + ambient loops)
- **Stock video clip audio:** Stripped by default, same as AI clips. Toggle per clip: "Use original audio" — if enabled, treated as ambient sound effect layer (volume adjustable, ducks under voiceover). Default OFF.
- Normalize final mix to -14 LUFS (YouTube standard)
- Apply final compression for consistent volume
- All processing via FFmpeg (runs on ECS Fargate during render)

---

## User Controls in the Editor

### What users CAN adjust:
- Reorder visual slots within a scene (drag on timeline)
- Drag visual slot boundaries to change duration per image/clip
- Swap visuals (replace image/clip in any slot)
- Toggle Ken Burns mode: Standard or Parallax per image
- Adjust Ken Burns direction and speed per image
- Change transition type and duration between scenes
- Change caption style, positioning, and per-speaker colors
- Adjust music volume and ducking intensity
- Add/remove/reposition sound effects (one-shot and ambient)
- Toggle color grading on/off per scene, adjust intensity
- Toggle intro/outro on/off
- Toggle end screen safe zone overlay
- Preview any individual scene or the full video
- **Undo/Redo** (Ctrl+Z / Ctrl+Y) — 50-step undo history, in-memory during editing session
- **"Reset to AI Default"** button — restores the original AI-assembled edit before any manual tweaks

### What users CANNOT do (v1):
- Frame-by-frame editing (not a full NLE like Premiere Pro)
- Split/trim individual clips manually
- Add custom text overlays beyond captions (future feature)
- Multi-track audio editing (we handle the mix automatically)
- Layer-based compositing

### Editor State Persistence:
- Auto-saves to DynamoDB every 30 seconds
- User can close browser — all edits preserved
- Return to project → editor state fully restored

---

## Preview System

- **Scene preview:** Quick preview of a single scene with all effects applied (captions, Ken Burns, color grading, audio). ~2-5 seconds to generate.
- **Full preview:** Low-resolution (480p) preview of the entire video. Includes all audio (voiceover + music + SFX), captions, transitions. Faster render than final. Watermarked for trial users.
- **Final render:** Full-resolution render for export/publish (see Rendering section below).

---

## Rendering

### Pipeline:
- Runs on **ECS Fargate** (serverless containers)
- FFmpeg handles all video encoding
- Output: MP4 (H.264, AAC audio)
- Resolution options: 1080p (default), 720p, 4K (Pro+ only)

### Scene-Level Render Caching:
- Each scene is rendered independently and cached as a segment in S3
- When user changes one scene, only that scene re-renders — the rest pulled from cache
- Cache invalidated when: visual slots change, captions change, transitions change (only adjacent scenes), or audio mix changes for that scene
- For a 10-minute video with 10 scenes: editing one scene = ~1-2 minutes re-render instead of 10-15 minutes
- "Render All" button available if user wants a full fresh render

### Background Job:
- Rendering is a background job — user can navigate away
- Progress tracked via WebSocket (from platform-systems.md job queue)
- Per-scene progress visible: "Rendering scene 4 of 10..."
- **Priority rendering:** Pro and Agency tiers get priority in the render queue

### Multi-Format Rendering (Shorts / Vertical):
- Same rendering pipeline, different configuration
- When a Short-Form Variant exists (from Scripts module), editor opens it as a separate project with:
  - 9:16 aspect ratio
  - Images auto-cropped/outpainted to vertical (focal point detection via Sharp)
  - Larger captions, centered on screen (Shorts style)
  - No intro/outro (too long for Shorts)
  - Music trimmed to match short duration
- Export format selection: YouTube (16:9), Shorts/TikTok/Reels (9:16), Instagram (1:1)
- For 9:16 and 1:1: system auto-handles visual cropping using focal point detection so important content stays centered

---

## Export Options

- **Download MP4** — direct download from S3 via CloudFront
- **Publish to YouTube** — hands off to Publishing module
- **Save to Google Drive** — export to user's connected Drive
- **Download audio only** — just the final mixed audio (MP3) — useful for podcast repurposing
- **Download captions** — SRT/VTT subtitle file
- **Export individual scenes** — download specific scenes as separate clips for social media repurposing (future v1.1 — low priority)

---

## Error Handling

- **Render fails:** Auto-retry once from the failed scene (scene-level caching means we don't restart from scratch)
- **Retry fails:** Notify user with "Try Again" button
- **Missing visual slot:** Block render, highlight the empty slot in red on the timeline
- **Missing voiceover:** Block render, highlight the scene
- **Music generation fails:** Offer options — render without music (user's choice, not automatic), retry music generation, or upload own track
- **Very long videos (30-60 min):** Scene-level render caching handles this — render time proportional to changed scenes, not total length

---

## Credit Costs

| Operation | Credits | Notes |
|---|---|---|
| Music generation | 50 credits/minute | ElevenLabs Music / Mubert |
| Sound effects | 10 credits each | ElevenLabs SFX |
| Parallax depth map | 5 credits per image | Marigold/Midas via fal.ai (Creator+ only) |
| Rendering | 0 credits | Included in tier — infrastructure cost is ours |
| Re-rendering | 0 credits | Users shouldn't be punished for tweaks |
| Color grading | 0 credits | FFmpeg LUT — no API cost |
| Preview generation | 0 credits | Lower-res render, included |

---

## Dependencies

- **Voiceover module** — audio files + timing data + caption data (including speaker IDs for multi-voice)
- **Images module** — approved still images + stock video clips
- **Video Generation module** — approved AI video clips (audio stripped)
- **Scripts module** — visual_sequence timestamps, music_mood, music_energy, sound_effects, color_tone, energy markers per scene
- **Style System** — fonts, colors, transitions, caption styling, LUT presets, default transition duration, intro/outro templates, Ken Burns defaults
- **ElevenLabs Music / Mubert** — background music generation (segmented for long videos)
- **ElevenLabs SFX** — sound effects (one-shot and ambient)
- **fal.ai** — depth estimation for Parallax Ken Burns (Marigold/Midas)
- **FFmpeg on ECS Fargate** — all rendering, color grading, audio mixing
- **S3 + CloudFront** — scene cache storage, final video storage and delivery
- **DynamoDB** — editor state auto-save, render job tracking
- **WebSocket** — real-time render progress updates

---

## Edge Cases

- **Script changes after editing:** Cascade invalidation applies — changing script invalidates voiceover and visuals, which invalidates the edit. Scene-level cache cleared for affected scenes.
- **User uploads own music but it's shorter than video:** System warns "Your music track is 3:00 but the video is 10:00. Loop the track or add more music?" Options: loop with crossfade, or leave silence after track ends.
- **Mixed aspect ratios in visual slots:** System warns if images have inconsistent aspect ratios within a scene. Offers to crop/outpaint to match project format.
- **60-minute video rendering:** Scene-level caching + ECS Fargate handles this. Render time ~30-60 minutes for a full fresh render. Progress shown per scene.
- **Browser crash during editing:** Auto-save every 30 seconds means max 30 seconds of lost work. Editor state fully restored on return.

---

## Features NOT in v1 Launch (Future)

- Export individual scenes as separate clips
- Custom text overlays beyond captions
- Advanced audio mixing UI (per-track volume curves)
- AI "editing director" that suggests cuts, pacing, and visual improvements
- Real-time collaborative editing
- Additional export formats (MOV, WebM)
- More LUT presets and custom LUT upload
