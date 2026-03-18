# Standalone Generator — Finalized Spec

A dedicated creative tool accessible from the main sidebar that lets users generate individual assets on demand — images, video clips, voiceovers, music, and thumbnails — without creating a project. Great for experimentation, brand asset creation, or building up a media library before starting a video.

---

## Why It Exists

- **Experimentation:** Test AI image styles, voice options, or music before committing to a project
- **Brand assets:** Create logos, channel art, Visual Anchor concepts, or intro music outside any specific video
- **Quick generation:** Sometimes you just need one image or one voiceover clip without the overhead of a full project
- **Pre-production:** Build up a library of assets before starting the wizard

---

## UI Layout

Single page with a tab for each generator type. Each tab has:
1. **Input panel** (left side) — configuration and prompts
2. **Preview panel** (right side) — shows the generated result
3. **History strip** (bottom) — last 20 generations in this session for quick comparison

**Channel dropdown** at the top of the page (optional):
- Default: "No Channel" — assets land in Global Media Library with `channelId: null`
- If a channel is selected: assets get that channelId, appear in the channel's media view, and style defaults from that channel pre-fill settings (e.g., available Visual Anchors, thumbnail style suggestions)
- Still no projectId — standalone assets are never part of a project until explicitly referenced via the Media Library

---

## Image Generator Tab

### Inputs:
| Field | Description | Required? |
|---|---|---|
| Prompt | Text description of the image | Yes |
| Negative prompt | What to avoid in the image | No |
| Model tier | Draft / Standard / Premium (maps to FLUX schnell / dev / pro) | Yes (default: Standard) |
| Aspect ratio | 1:1, 16:9, 9:16, 4:3, 3:4 | Yes (default: 16:9) |
| Style reference | Optional — select an existing Style from the user's styles to guide the generation | No |
| Visual Anchor | Optional — select a Visual Anchor to include in the image | No |

### Output:
- Generated image displayed in preview panel
- Actions: Save to Library, Download, Regenerate (same settings), Edit Prompt & Regenerate
- Metadata auto-saved: prompt, negative prompt, model used, aspect ratio, style reference if used

### Credits:
Same as project image generation — varies by model tier (Draft cheapest, Premium most expensive).

### NSFW Moderation:
Same pipeline as project generation (from images.md):
- Below safe threshold: passes immediately
- Borderline (60-85% confidence): flagged for admin moderation queue
- Above auto-block threshold: blocked, user sees "Content policy violation," credits refunded

---

## Video Clip Generator Tab

### Inputs:
| Field | Description | Required? |
|---|---|---|
| Mode | Text-to-video OR Image-to-video | Yes |
| Prompt | Text description of the video clip | Yes |
| Source image | Upload or select from library (image-to-video mode only) | If image-to-video |
| Duration | 3s, 5s, 10s | Yes (default: 5s) |
| Aspect ratio | 16:9, 9:16, 1:1 | Yes (default: 16:9) |

### Output:
- Generated video clip with playback controls in preview panel
- Actions: Save to Library, Download, Regenerate, Edit Prompt & Regenerate

### Credits:
Same as project video clip generation.

### NSFW Moderation:
Video clips go through the same moderation pipeline as images, using frame sampling:
- **Sampling rate:** First frame, last frame, plus one frame per second of duration (e.g., 5-second clip = 7 frames, 3-second clip = 5 frames, 10-second clip = 12 frames)
- Below safe threshold: passes
- Borderline (60-85%): flagged for admin moderation queue
- Above auto-block threshold: blocked, user sees "Content policy violation," credits refunded

---

## Voiceover Generator Tab

### Inputs:
| Field | Description | Required? |
|---|---|---|
| Text | The script/text to speak | Yes |
| Voice | Select from ElevenLabs voice library or user's cloned voices | Yes |
| Model | ElevenLabs model selection (Turbo v2.5, Multilingual v2, etc.) | Yes (default: platform default) |
| Speed | Playback speed adjustment (0.7x — 1.3x) | No (default: 1.0x) |
| Stability | Voice consistency slider (0-100) | No (default: 50) |
| Similarity boost | How closely to match the selected voice (0-100) | No (default: 75) |
| Post-process audio | Toggle — applies noise reduction, normalization, compression, EQ | Yes (default: ON) |

### Voice Selection:
Uses the exact same voice list and availability logic as the project wizard voiceover step:
- All ElevenLabs library voices
- User's cloned voices (respecting tier clone slot limits)
- Clones in "processing" or "re-training" state show greyed out with status label ("Training in progress — not available yet")
- Clones that failed training don't appear in the list

### Pronunciation Dictionary:
The user's pronunciation dictionary (account-level, from Settings) is automatically loaded and applied to every standalone voiceover generation. No extra toggle needed — if a dictionary exists, it's used. If none exists, generation proceeds without one. Same behavior as project voiceovers.

### Post-Processing:
When "Post-process audio" is ON (default), generated audio runs through the same pipeline as project voiceovers: noise reduction, normalization, compression, EQ. When OFF, user gets raw ElevenLabs output — useful for quickly testing voices without waiting for processing. This ensures standalone and project voiceovers sound identical by default.

### Output:
- Audio playback with waveform visualization
- Shows duration and estimated word count
- Actions: Save to Library, Download, Regenerate, Edit Text & Regenerate

### Credits:
Same per-character rate as project voiceovers.

---

## Music Generator Tab

### Inputs:
| Field | Description | Required? |
|---|---|---|
| Description | Text description of desired music (mood, genre, tempo, instruments) | Yes |
| Duration | 15s, 30s, 60s, 90s, 120s | Yes (default: 60s) |
| Instrumental only | Toggle — no vocals | Yes (default: ON) |

### Fallback Behavior:
1. Try ElevenLabs Music first
2. If ElevenLabs fails (timeout, error, rate limit), automatically retry once
3. If second attempt fails, fall back to Mubert
4. If Mubert also fails, show error: "Music generation is temporarily unavailable. Credits have not been charged. Please try again later."
5. User sees a subtle label in the output panel indicating which service generated the music

Credits only charged on successful generation — failures at any stage don't consume credits.

### Output:
- Audio playback with waveform visualization
- Shows duration, BPM estimate
- Actions: Save to Library, Download, Regenerate, Edit Description & Regenerate

### Credits:
Same as project music generation.

---

## Thumbnail Generator Tab

### Inputs:
| Field | Description | Required? |
|---|---|---|
| Background prompt | Text description for the AI-generated background | Yes |
| Title text | Main text overlay on the thumbnail | Yes |
| Subtitle text | Optional secondary text | No |
| Text preset | One of 8 text style presets (see below) — customizable after selection | Yes (default: Bold Classic) |
| Model tier | Draft / Standard / Premium for the background | Yes (default: Standard) |
| Channel | Optional — associate with a channel to pull style defaults | No |

### Text Presets:

| Preset | Font Style | Color | Effects | Position |
|---|---|---|---|---|
| Bold Classic | Heavy sans-serif | White | Black outline + drop shadow | Center |
| Dark Mode | Heavy sans-serif | White | Dark semi-transparent background bar | Bottom third |
| Vibrant | Heavy sans-serif | Yellow | Red outline + drop shadow | Center |
| Minimal | Light sans-serif | White | Subtle drop shadow only | Lower left |
| News Style | Heavy serif | White | Red background bar | Bottom |
| Gradient Pop | Heavy sans-serif | White-to-yellow gradient | Black outline | Center |
| Listicle | Heavy sans-serif | White with colored number highlight | Black outline + shadow | Top or center |
| All Caps Impact | Impact-style | White | Heavy black outline | Center, large |

- Users pick a preset, then can customize individual properties (font, color, outline, shadow, position)
- Presets are a starting point, not a constraint
- If a channel is selected and its Style profile has a thumbnail section, the UI suggests a preset that matches

### Output:
- Thumbnail preview at multiple sizes (full 1280x720, YouTube search result size, YouTube suggested size)
- Actions: Save to Library, Download, Regenerate, Edit & Regenerate

### Credits:
Same as project thumbnail generation.

---

## Credit Handling

### Estimation:
Before generating, the UI shows: "This will use approximately X credits." Same estimation logic as the project wizard credit estimator. User sees their remaining credit balance alongside.

### Refund on Failure:
Universal rule: **credits are only charged on successful generation.**

How it works:
- Credits are deducted at generation start (same as projects)
- If generation succeeds: charge stands
- If generation fails (API error, timeout, malformed output, NSFW block): a **refund transaction** is added to the credit ledger — a positive credit entry with `type: refund` and a reference to the failed transaction ID
- User sees: "Generation failed — credits have been refunded" with a retry button
- Failed generations are NOT saved to the Media Library
- The credit ledger records both the original deduction and the refund for admin cost tracking

This is the same refund mechanism used by the spend cap timeout in admin.md — consistent pattern across the platform.

---

## Generation History

Each generator tab keeps a session history strip at the bottom:
- Shows the last 20 generations from the current session (thumbnails for images/video, waveform icons for audio)
- Click any to re-view it in the preview panel
- Each entry shows: timestamp, prompt snippet, credits used
- History clears on page reload — session-only, not persisted (the saved assets themselves are in the Media Library)
- Only successfully generated and saved assets persist in the Media Library

---

## Relationship to Project Wizard

The Standalone Generator and the project wizard are completely separate workflows:
- **Standalone Generator:** freeform, one asset at a time, no project context
- **Project Wizard:** structured, multi-step, tied to a channel and project
- Assets from the Standalone Generator can be used in projects via "Copy to Project" in the Media Library
- No way to "convert" a standalone session into a project — but assets carry over through the library

---

## DynamoDB

No new tables needed. Standalone Generator outputs are just MediaAssets records with `projectId: null`. The existing MediaAssets table handles everything. Credit transactions go through the existing credit ledger (including refund transactions for failures).

---

## What's NOT in v1

- **Batch generation** — one at a time only
- **Prompt templates / presets** — no saved prompt library (users can copy prompts from generation history)
- **Inpainting / image editing** — just generation, no editing tools
- **Upscaling** — no resolution enhancement tool
- **Style transfer** — can reference a Style for guidance, but no dedicated style transfer mode
- **Sharing** — can't share standalone generations with other users or publicly
