# Voiceovers Module — Finalized Spec (Audited)

## Core Concept
The narrator script gets turned into spoken audio using ElevenLabs TTS. White-labeled as "AI Voice Engine" — users never see ElevenLabs branding. Duration targeting is built in from the start, driven by the script's word budget. Voice drives video timing (voice-first architecture).

---

## How It Works in the Project Wizard

### Step 1: Voice Selection
- User picks a voice for this project (channel default pre-selected)
- Options:
  - **Browse Voice Library** — Curated selection from ElevenLabs' 10,000+ voices, organized by: Male/Female, Young/Old, Warm/Authoritative/Energetic/Calm, accent, language
  - **Design a Voice** — User describes their ideal voice in plain text (e.g., "A warm, deep male voice with a slight British accent"). ElevenLabs Voice Design API generates a custom voice from the description. Quick way to get a unique voice without recording anything.
  - **Clone a Voice** — User uploads 1-3 minutes of audio. System creates a custom voice clone. Saved to channel's Style for reuse. **Legal consent required:** user must confirm they own the rights to the voice being cloned.
  - **Channel Default** — If the Channel Style already has a voice assigned, it's pre-selected automatically
- Voice preview: user hears a 10-second sample of each voice before choosing

### Step 2: Voice Settings
Actual ElevenLabs API parameters (corrected from audit):
- **Speed:** slider (0.7x to 1.2x, default 1.0) — narrow range, extremes degrade quality
- **Stability:** 0.0-1.0 (lower = more emotional/expressive, higher = more consistent). Recommended: 0.30-0.50 for storytelling, 0.60-0.85 for educational
- **Similarity Boost:** 0.0-1.0 (how closely to match original voice characteristics). Default ~0.75
- **Style Exaggeration:** 0.0-1.0 (amplifies personality/drama). Default 0.0. Increases latency when > 0.
- **Speaker Boost:** on/off (amplifies original speaker style). NOT available on v3 model.

**Per-scene voice variation:** Instead of one setting for the entire video, settings can be adjusted per scene. Hook scenes = lower stability (more energy), educational sections = higher stability (steadier), CTA = higher style exaggeration (more dramatic). This prevents the flat monotone problem that kills long-form AI voiceover and dodges YouTube's repetitive audio detection.

### Step 3: Scene-by-Scene Generation
- System sends each scene's **narrator text** + **energy markers** + **pacing notes** to ElevenLabs
- **Uses TTS with Timestamps endpoint** — returns audio PLUS word-level timestamps in one call (critical for captions and scene sync later)
- Energy markers translate to ElevenLabs controls:
  - `SLOW` / `SLOW_START` → speed parameter reduced for that scene
  - `FAST` → speed parameter increased for that scene
  - `BUILD` → generate scene in segments with gradually increasing style exaggeration
  - `EMPHASIZE:word` → NOT possible via SSML (ElevenLabs doesn't support `<emphasis>`). Instead: add slight pause before emphasized word using `<break>` tag, and rely on natural model emphasis from punctuation (em-dashes, exclamation marks)
  - `DRAMATIC_PAUSE` → `<break time="1.5s"/>` tag (one of the few SSML tags ElevenLabs actually supports)
- Each scene returns as a separate audio clip with word-level timestamps
- Scenes generated in parallel for speed
- **Model selection per context:**
  - Flash v2.5 → live previews (75ms latency, 40,000 char limit)
  - Eleven v3 → final renders (best quality/expressiveness, 3,000 char limit — requires chunking long scenes)
  - Turbo v2.5 → fallback middle ground (40,000 char limit)

### Step 4: Scene-by-Scene Preview
- User can play each scene's voiceover individually
- Side-by-side with narrator script text (follow along)
- Word-level highlighting synced to audio playback (using timestamps from generation)
- Per-scene controls:
  - **Regenerate** this scene (same voice, re-rolls the delivery)
  - **Adjust speed** (0.7-1.2 slider)
  - **Adjust stability/style** (more energetic or calmer)
  - **Edit script and regenerate** (if words need to change — triggers warning about script approval lock)
  - **Pick different voice** for this scene only (rare, but supported)

### Step 5: Duration Verification
- System checks actual audio duration vs target duration from script
- Tolerance: within 10% is acceptable
- If off by more than 10%:
  - **Too short:** Options shown — regenerate script with more content, slow down pacing (limited to 0.7x min), or accept as-is
  - **Too long:** Options shown — trim script, speed up pacing (limited to 1.2x max), or accept as-is
- If within 5-10%: system can auto-adjust speaking speed slightly (users won't notice within the 0.7-1.2 range)
- **Important:** Because speed range is narrow (0.7-1.2), getting the word budget right at the script level is critical. Voiceover speed adjustments are fine-tuning, not major corrections.

### Step 6: Full Preview
- Play all scenes stitched together as one continuous voiceover
- Waveform visualization showing the audio
- Total duration displayed (drives the final video length)
- Gap/silence between scenes visible in waveform

### Step 7: Approval
- User marks voiceover as "Approved"
- Warning: "Changes to the script after this point will require regenerating the voiceover"
- Voiceover audio + timestamp data saved to the project and Media Library
- Proceeds to Visuals step

---

## Voice-First Architecture

**Critical design decision:** For faceless YouTube, the narration IS the content. Visuals support the narration, not the other way around.

### How it works:
1. Voiceover is generated first with exact word-level timestamps
2. Each scene's voiceover duration becomes that scene's video duration
3. Visuals are generated/selected to fill the voiceover duration
4. Transition padding (0.5-1.5 seconds) added between scenes
5. Music and sound effects are layered underneath

This means: **voiceover duration = video duration**. The script's word budget targets a duration, the voiceover hits close to it, and everything else sizes itself to match.

---

## Multi-Voice Support

### Text-to-Dialogue API (Native ElevenLabs feature)
- Supports up to **10 different voices** in a single audio file
- Natural turn-taking, pacing, and transitions between speakers
- Available with timestamps variant for caption sync
- Uses Eleven v3 model

### Use Cases:
- **Narrator + Expert Quotes** — main narrator voice, second voice for quoted material
- **Two-Host Format** — conversational back-and-forth style
- **Character Voices** — documentary-style with different voices for different people
- **Narrator + Inner Monologue** — different voice for thoughts vs narration

### How it works in the script:
- Script editor supports tagging segments with voice assignments
- Each segment tagged with a voice ID
- Single API call to Text-to-Dialogue endpoint produces cohesive audio
- No manual stitching needed — ElevenLabs handles turn-taking naturally

---

## Duration Targeting System

### How It Works End-to-End
Duration control happens at the **script level**, not the voiceover level. The flow:

1. User sets target duration when creating the project (30 sec to 60+ minutes)
2. Script module calculates word budget (duration x 150 words/min)
3. Script is generated scene-by-scene to hit that word budget
4. Voiceover reads the script — duration is naturally close to target
5. Voiceover module verifies and makes minor pacing adjustments if needed (0.7-1.2x range only)
6. If more than 10% off, script needs expanding/trimming (not voiceover speed)

### Duration Presets by Niche (AI-Recommended)
The Style system recommends durations based on niche:
- True Crime / Documentary → 12-15 min
- Educational / How-To → 8-12 min
- Listicle / Countdown → 10-15 min
- Comparison / Versus → 8-10 min
- Explainer → 5-8 min
- Short-form (any niche) → 30-90 sec
- Custom → user types any duration

These are suggestions, not locks. User always picks the final target.

### Scales to Any Duration
- 30-second short = ~75 words = 1-2 scenes = 1-2 API calls
- 10-minute video = ~1,500 words = ~10 scenes = ~10 API calls
- 60-minute video = ~9,000 words = ~60 scenes = ~60 API calls
- Same process regardless of length. No hardcoded limits.

---

## Pronunciation System

### Pronunciation Dictionaries (per niche/channel)
- ElevenLabs has a full API for managing pronunciation rules
- Each channel/niche gets its own dictionary
- Handles: technical terms, brand names, acronyms, proper nouns, foreign words
- Rules created once, applied to all projects in that channel
- Format: `.pls` XML files managed via API
- Example: "Kubernetes" → "koo-ber-NET-eez", "AWS" → "A-W-S" not "awes"

### How it works:
- When a project generates voiceover, the channel's pronunciation dictionary is attached to the TTS request
- Users can add/edit pronunciation rules from the Channel Style settings
- AI can auto-suggest pronunciation rules when it detects technical terms in scripts
- Dictionary shared across all projects in that channel

---

## Voice Clone Feature

- **Instant Clone:** User uploads 1-3 minutes of audio (max 3 min). Quick setup, good quality.
- **Professional Clone:** User uploads 30 min - 3 hours of audio. Excellent quality. Can be shared.
- Voice saved at **Channel level** (part of Style) so all projects can use it
- User can create multiple custom voices per channel
- Custom voices show up in voice picker alongside library voices
- Clone quality improves with more/cleaner audio samples
- Supported upload formats: mp3, wav, m4a
- Requirements: clean audio, no background noise, single speaker, MP3 at 128kbps minimum
- **Legal consent required:** Checkbox — "I confirm I have the legal rights to clone this voice and it is either my own voice or I have explicit permission from the voice owner." This is a legal liability requirement from ElevenLabs.

---

## Caption Generation (Built Into Voiceover Pipeline)

### For AI-Generated Voiceovers (default path):
- TTS with Timestamps endpoint returns word-level timing data alongside the audio
- System converts timestamps directly to SRT/VTT subtitle format
- **Zero transcription errors** — we already have the source text, timestamps just tell us when each word is spoken
- Caption emphasis words (from script) get styled differently (bold, color, size) in the subtitle file

### For User-Uploaded Voiceovers:
- **Forced Alignment API** — user uploads audio + we have the script text
- Returns word-level timestamps in 150+ languages
- Falls back to **Scribe v2 (speech-to-text)** if no script text is available
- Scribe v2 supports files up to 10 hours, 99 languages, speaker diarization

### Caption styles (applied in Editing module):
- Standard subtitles (bottom of screen)
- Animated word-by-word (TikTok/Shorts style)
- Highlighted keyword emphasis
- Custom fonts/colors per Channel Style

---

## Audio Post-Processing Pipeline

**Ownership split:** Voiceover module handles per-scene audio cleanup (Steps 1-5 below) immediately after TTS generation. The Editing module handles the final mix (voiceover + music + sound effects), including music ducking, cross-scene transitions, and final loudness normalization of the complete mixed output.

Per-scene processing, done server-side with FFmpeg immediately after TTS generation:

### Step 1: Loudness Normalization
- Target: **-14 LUFS** (YouTube's standard)
- YouTube will downscale videos louder than this but will NOT boost quiet videos
- True peak below -1.5 dBTP to prevent distortion after YouTube's transcoding

### Step 2: Dynamic Range Compression
- Light compression (ratio 2:1-3:1, threshold ~-20dB)
- Evens out volume variations common in AI speech generation
- Prevents jarring loud/quiet swings between scenes

### Step 3: High-Pass Filter
- Remove sub-100Hz rumble that some TTS models produce
- Clean, professional sound

### Step 4: De-essing (optional, auto-detected)
- Some AI voices produce harsh sibilants (sharp "S" sounds)
- Targeted de-esser at 4-8kHz applied only if needed
- System auto-detects and applies

### Step 5: Format Standardization
- All audio normalized to 44.1kHz/16bit before mixing
- Consistent regardless of what ElevenLabs returns

---

## Background Music Ducking

When the narrator talks, music volume automatically lowers. Two approaches available:

### Primary: Timestamp-Based Volume Automation (recommended)
- We have word-level timestamps from TTS generation
- System creates a precise volume envelope for the music track:
  - Music at full volume during pauses/silence
  - Music ducks to -20dB to -25dB below voiceover during speech
  - Smooth fade transitions (attack: 50ms before speech starts, release: 300ms after speech ends)
- **More accurate than sidechain compression** because we know exactly when speech starts/stops
- No audio artifacts

### Fallback: FFmpeg Sidechain Compression
- Uses voiceover track as sidechain input
- Threshold: -30dB, Ratio: 4:1-6:1, Attack: 10-50ms, Release: 200-500ms
- Used when timestamps aren't available (e.g., user-uploaded voiceover without alignment)

---

## Sound Effects Integration

### ElevenLabs Sound Effects API
- Generate sound effects from text descriptions
- Examples: "whoosh transition", "dramatic reveal sting", "ambient forest sounds", "keyboard typing"
- Tied to scene audio direction from Scripts module
- Each scene's `sound_effects` array generates actual audio clips

### How it works:
- Script defines sound effects per scene (e.g., "wind howling", "footsteps in snow")
- System generates these via Sound Effects API
- Mixed into final audio alongside voiceover and music
- User can preview, regenerate, or replace with uploaded sounds

---

## Fallback TTS Strategy

### What happens if ElevenLabs goes down:
1. System detects API failure (5xx response or timeout after 10 seconds)
2. Auto-retry once with ElevenLabs (transient failures)
3. If retry fails, two options based on context:
   - **Non-urgent (background render):** Queue the request and retry every 5 minutes for up to 1 hour. Notify user: "Your voiceover is delayed due to a temporary issue. We'll complete it automatically."
   - **Urgent (user actively waiting):** Fall back to **OpenAI TTS** (already in our stack). Notify user: "We used our backup voice engine. The voice may sound slightly different. You can regenerate with the primary engine when it's back online."
4. Log all fallback events for monitoring

### Fallback provider: OpenAI TTS
- Already in our ecosystem (using GPT-4o for scripts)
- 6 built-in voices, good quality
- No voice cloning support — only for standard library voices
- Cost: ~$0.015 per 1,000 characters (cheaper than ElevenLabs)

---

## How Style Drives Voiceover

The Channel Style includes voice preferences:
- Default voice ID (from library, designed, or custom clone)
- Default speed setting (0.7-1.2)
- Default stability setting (0.0-1.0)
- Default similarity boost setting (0.0-1.0)
- Default style exaggeration (0.0-1.0)
- Default tone description (warm, authoritative, conversational, dramatic, etc.)
- Per-scene variation rules (e.g., "hooks get stability 0.35, meat gets 0.65")
- Pronunciation dictionary ID

When a new project starts, these defaults are pre-loaded. User can override any setting per project or per scene.

---

## Technical Details

### ElevenLabs Models (current as of 2026)
| Model | Max Chars/Request | Latency | Languages | Best For |
|-------|-------------------|---------|-----------|----------|
| Eleven v3 | 3,000 | Higher | 70+ | Final renders — best quality and expressiveness |
| Flash v2.5 | 40,000 | ~75ms | 32 | Live previews — ultra-low latency |
| Turbo v2.5 | 40,000 | Low | 32 | Middle ground |
| Multilingual v2 | 10,000 | Medium | 29 | Best number/date normalization |

### Chunking Strategy for Eleven v3
- v3 has a 3,000 character limit (~500 words) per request
- Most scenes are 100-200 words = well within limit
- For longer scenes: split at sentence boundaries, generate in chunks, stitch seamlessly
- This aligns with our scene-by-scene architecture — rarely an issue

### SSML Support (Limited)
ElevenLabs only supports two SSML tags:
- `<break time="Xs"/>` — pauses (used for DRAMATIC_PAUSE markers)
- `<phoneme>` — custom pronunciation (IPA and CMU Arpabet, only on Flash v2 and Turbo v2)
- NO support for: `<prosody>`, `<emphasis>`, `<say-as>`, `<sub>`
- Emphasis is achieved through: punctuation (em-dashes, exclamation marks), strategic pauses before key words, and stability/style parameter variation

### Audio Output
- Preview: MP3 44.1kHz/128kbps (fast, small files)
- Final render: PCM/WAV 44.1kHz/16bit (highest quality, requires Scale+ tier)
- All audio post-processed through FFmpeg pipeline before final mix

### Storage
- Generated audio saved to S3, linked to project + Media Library
- Timestamp data stored alongside audio (JSON format)
- Pronunciation dictionaries stored per channel
- If user regenerates a scene, old version kept in S3 until project is finalized (allows undo)

---

## Cost Estimates

### Per-Video Voiceover Cost (ElevenLabs)
~$0.15-0.30 per 1,000 characters

| Video Duration | Words | Characters (~) | Cost |
|---|---|---|---|
| 30 sec | ~75 | ~400 | $0.06-0.12 |
| 3 min | ~450 | ~2,400 | $0.36-0.72 |
| 10 min | ~1,500 | ~8,000 | $1.20-2.40 |
| 15 min | ~2,250 | ~12,000 | $1.80-3.60 |
| 30 min | ~4,500 | ~24,000 | $3.60-7.20 |
| 60 min | ~9,000 | ~48,000 | $7.20-14.40 |

### Per-User Monthly Cost (ElevenLabs)
- Casual (4 videos/month, 10 min avg): ~$5-10/month
- Active (12 videos/month, 10 min avg): ~$15-30/month
- Power (30 videos/month, 10 min avg): ~$36-72/month

### Voice Clone Cost
- Included in ElevenLabs subscription at scale tier
- No additional per-clone cost at our API usage level

### Sound Effects Cost
- ElevenLabs Sound Effects API pricing TBD — estimated ~$0.01-0.05 per effect

---

## Dependencies
- **Upstream:** Scripts module (narrator text, energy markers, pacing notes, target duration, word budget per scene, sound effects list)
- **Downstream:** Editing module (voiceover audio + word-level timestamps for scene sync, captions, music ducking), Publishing (voiceover duration = final video length baseline)
- **Style System:** Provides default voice, speed, tone settings, per-scene variation rules, pronunciation dictionary
- **Media Library:** Final approved voiceover audio + timestamps stored here for reuse/export
- **Sound Effects:** Generated audio clips passed to Editing module for mixing

---

## Edge Cases
- **Script changes after voiceover approval:** System warns user, offers to regenerate affected scenes only (not the whole voiceover)
- **Voice clone quality too low:** System flags if ElevenLabs returns low quality score, recommends uploading more/cleaner audio
- **Very long videos (30-60 min):** Generation may take several minutes. Show progress bar per scene. Allow user to preview completed scenes while others still generate.
- **Multiple languages:** Eleven v3 supports 70+ languages, Multilingual v2 supports 29. Future feature — not in v1 launch, but architecture supports it.
- **ElevenLabs downtime:** Fallback to OpenAI TTS with user notification. Queue-and-retry for background renders.
- **YouTube repetitive audio detection:** Mitigated by per-scene voice variation, custom/cloned voices, and pronunciation dictionaries that make each channel sound unique.
- **User uploads own voiceover:** Forced Alignment API syncs it with script for timestamps/captions. Falls back to Scribe v2 transcription if no script text.

---

## Features NOT in v1 Launch (Future)
- Multi-language voiceover (translate script + generate in target language)
- Real-time voice preview while editing script (WebSocket streaming)
- AI voice coaching ("this section sounds flat, try lowering stability")
- Voice marketplace (users share/sell custom voices)
