# Images Module — Finalized Spec (Audited)

## Core Concept
All still image generation, sourcing, editing, and management within the project wizard. Every scene in the script has visual slots — this module fills them. White-labeled as "AI Image Engine" (fal.ai under the hood). Includes an auto-fill pipeline that reads the script and fills all visual slots automatically — user reviews and swaps rather than manually filling each one.

---

## The 4 Visual Sources (defined in Scripts, executed here)

### 1. Generate with AI (fal.ai, white-labeled)
- User clicks "Generate" on any visual slot
- System sends the `fal_image_prompt` from the script to fal.ai
- Returns an image in seconds
- User can: regenerate, edit prompt, try different model, upscale
- Style context baked into every prompt (color palette, mood, aesthetic from Channel Style)
- **Visual Anchors** maintain character/object consistency across scenes (see below)

### 2. Stock Library (Pexels + Pixabay)
- Search directly within the scene editor
- System pre-fills search using `stock_search_query` from the script
- Browse results, preview, pick
- Pexels attribution auto-added ("Photos provided by Pexels")
- Filter by: orientation, size, color
- **Also includes video clips** — Pexels API returns video b-roll footage too
- Results cached to reduce API calls (24-72 hour TTL)
- Downloaded assets stored in S3 (Pixabay requires this — no hotlinking)

### 3. Upload Your Own
- Drag-and-drop or file picker
- Supports: jpg, png, webp, gif, mp4, mov
- Auto-saved to Media Library
- Can be cropped/resized to fit scene requirements
- Runs through NSFW detection before display
- **Watermark detection warning:** system alerts if uploaded image appears to contain a watermark — "Please ensure you have the rights to use this image"

### 4. External Prompts (for users with their own AI tools)
- System provides optimized prompts for: Midjourney, DALL-E, Stable Diffusion, generic
- All prompts include Channel Style context (colors, mood, aesthetic)
- User generates externally, uploads the result
- Upload slot appears alongside the prompts

---

## Auto-Fill Pipeline (Script-to-Visual Matching)

Instead of manually filling each visual slot one by one, the system can auto-fill all scenes:

### How it works:
1. User clicks "Auto-Fill All Visuals" (available after script approval, but best results after voiceover approval when scene durations are known)
2. System reads every scene's `fal_image_prompt` and `stock_search_query`
3. For each visual slot:
   - **Still images:** AI generation fires off using the prompt (Draft tier model for speed). Can run anytime after script approval — images work at any duration.
   - **Stock video clips:** Search runs using query, BUT if voiceover is approved, clips are filtered to match scene duration (±2 seconds). If voiceover not yet done, clips flagged as "duration TBD."
   - **AI video clips:** Wait until voiceover approval to know exact duration needed per scene.
   - System picks the best match based on: Style compatibility, scene description match, visual consistency with other scenes
4. User sees all slots filled with AI-recommended visuals
5. User reviews scene by scene — swap, regenerate, pick stock instead, or upload their own
6. Can re-run auto-fill on individual scenes

### Why this matters:
- Competitors (InVideo, Pictory, Fliki) all do this — it's table stakes
- A 10-scene video with 2-3 visuals per scene = 20-30 slots to fill manually. Auto-fill makes this instant.
- Users still have full control — auto-fill is a starting point, not a final answer

---

## AI Image Generation (fal.ai) — Detail

### Model Tier System
Instead of hardcoding specific models (they change constantly), we define tiers that the admin can configure:

| Tier | Purpose | Default Model | Cost | When Used |
|---|---|---|---|---|
| **Draft** | Fast previews, iterations | FLUX Schnell or FLUX.2 Dev Turbo | ~$0.003-0.008 | Auto-fill, quick previews |
| **Standard** | Production quality | FLUX.2 Dev or FLUX Kontext Dev | ~$0.008-0.026 | Final scene images |
| **Premium** | Highest quality | FLUX.2 Pro or FLUX 1.1 Pro Ultra | ~$0.06-0.073 | Hero shots, key scenes |
| **Text-on-Image** | Thumbnails, text overlays | Recraft V3/V4 or Ideogram V3 | ~$0.04-0.05 | Thumbnails, title cards |

Admin can swap which specific model backs each tier as new models launch. Users just see "Draft / Standard / Premium" — never model names.

### Available Models on fal.ai (as of 2026)
- **FLUX.2 family:** Dev, Dev Turbo, Pro, Flex (new generation, better + cheaper)
- **FLUX.1 family:** Schnell, Dev, Pro, Pro Ultra
- **FLUX Kontext:** Dev, Max (purpose-built for character consistency)
- **Recraft:** V3, V4, V4 Pro (best for text rendering, also SVG/vector)
- **Google Imagen 4:** Standard, Fast, Ultra (excellent text rendering)
- **Ideogram V3:** Best-in-class typography
- **Stable Diffusion XL:** Solid all-rounder
- **600+ total models** — we curate, admin configures

### Generation Features

**Core generation:**
- Text-to-image (standard prompt → image)
- Image-to-image (upload reference → variation matching style)
- Batch generation (multiple variations of same prompt — pick the best)

**Editing capabilities:**
- **Inpainting:** Edit specific parts of an image ("remove the person in the background")
- **Outpainting:** Extend image beyond borders (critical for aspect ratio conversion — square stock → 16:9 for video)
- **Background removal:** Isolate subjects for compositing onto custom backgrounds
- **Upscaling:** Enhance low-res images (stock or uploaded) to 1080p+ using ESRGAN/AuraSR

**Advanced:**
- **Style transfer:** Apply Channel Style's visual aesthetic to any image via IP-Adapter
- **ControlNet:** Edge maps, depth maps, pose guidance for precise control
- **Depth estimation:** Generate depth maps for parallax/Ken Burns effects in video (Marigold/Midas models)

**Aspect ratios:**
- 16:9 (YouTube default) — 1920x1080
- 9:16 (Shorts/TikTok/Reels) — 1080x1920
- 1:1 (Instagram, social posts) — 1080x1080
- Custom dimensions supported
- **Multi-format generation:** Generate same scene for YouTube + Shorts + Instagram in one click

**Prompt enhancement:**
- User sees simplified prompt field ("Snowy mountain at sunset")
- System enhances behind the scenes with: Channel Style parameters, quality keywords, aspect ratio, negative prompts
- Advanced users toggle "Show full prompt" to see and edit the enhanced version

---

## Visual Anchor System (Character/Object Consistency)

**The problem:** Scene 1 shows a "mysterious dark forest." Scene 5 needs that same forest. Without consistency, every scene looks like a different video.

**The solution: FLUX Kontext + Visual Anchors**

### How it works:
1. **First scene:** Generate the "hero" image with the desired look
2. **Save as Visual Anchor:** Mark any generated image as a Visual Anchor (stored in the project)
3. **Subsequent scenes:** System uses FLUX Kontext with the anchor image as reference + the new scene's prompt
4. FLUX Kontext preserves visual identity (same characters, objects, style) while generating new compositions
5. **Multiple anchors per project:** Different anchors for different recurring elements (e.g., one for the forest, one for the main character silhouette, one for the mood/lighting)

### Visual Anchor types:
- **Character anchor:** A recurring character/figure that appears across scenes
- **Environment anchor:** A recurring location that appears from different angles
- **Style anchor:** The overall visual style/mood/color palette applied to everything
- **Object anchor:** A recurring prop or element

### Fallback for non-AI images:
- If user uploads an image or picks from stock, that can also be set as an anchor
- IP-Adapter extracts the style and applies it to AI-generated scenes
- Less precise than Kontext but still maintains visual coherence

---

## Thumbnail Generation

### Hybrid Approach: AI Background + Programmatic Text
Thumbnails need perfect text — no typos, exact brand fonts. AI still makes occasional text errors. So:

1. **AI generates the background image** — composition, mood, colors, imagery (using Text-on-Image tier model like Recraft V3/V4)
2. **System overlays text programmatically** — using Sharp (Node.js image library) with exact fonts, colors, sizes, and positioning from the Channel Style
3. Result: stunning AI backgrounds + guaranteed-accurate text every time

### Thumbnail workflow:
- AI suggests 3-5 thumbnail concepts based on: video topic, hook, niche best practices, viral thumbnail patterns
- Each concept generates 2-3 background variations
- User picks background, edits text, adjusts layout
- Text overlay: AI generates clickbait-optimized text from the title
- Separate text editor: change words, font size, color, position, shadow/outline

### Thumbnail rules (from viral research):
- High contrast colors
- Large readable text (max 4 words)
- Clean composition — not cluttered
- Curiosity gap visuals (for faceless channels: bold text + striking imagery, before/after, contrast-heavy)
- Multiple saved for A/B testing (YouTube's Test and Compare supports 3 thumbnails per video)

---

## NSFW Content Moderation

**Mandatory pipeline step for all images on the platform.**

### How it works:
1. Every AI-generated image passes through fal.ai NSFW detection endpoint
2. Every stock image from Pexels/Pixabay passes through detection (their safesearch isn't perfect)
3. Every user-uploaded image passes through detection
4. **Threshold:** Block images scoring above 0.7 NSFW probability
5. Blocked images: user sees "This image was flagged. Please try a different prompt or image."
6. Admin dashboard: configurable threshold, moderation queue for edge cases

### Cost: ~$0.001 per image check (negligible)

---

## In-Platform Image Editing

Basic editing so users don't have to leave the platform:

### Tools (all powered by Sharp on server-side):
- **Crop** — Free crop, or snap to aspect ratio (16:9, 9:16, 1:1)
- **Resize** — Scale up/down
- **Rotate/Flip** — 90° rotation, horizontal/vertical flip
- **Brightness/Contrast/Saturation** — Sliders
- **Filter presets** — "Cinematic," "Vintage," "High Contrast," "Dark Moody," "Warm Golden" — apply LUT-style color grading
- **Text overlay** — Add text with custom fonts, colors, sizes (same engine as thumbnail text)
- **Background removal** — Via fal.ai's Bria RMBG endpoint, one click

### Not included (too complex for v1):
- Layer-based editing (that's Photoshop)
- Drawing/painting tools
- Advanced compositing

---

## Image Format & Compression Pipeline

### Storage optimization (saves ~30% on S3 costs):

| Stage | Format | Quality | Use Case |
|---|---|---|---|
| S3 storage | WebP | 85% quality | Primary storage, 30% smaller than JPEG |
| Editor thumbnails | WebP | 60% quality | Fast loading in the UI |
| Video input (FFmpeg) | PNG | Lossless | Highest quality for rendering |
| YouTube thumbnails | JPG/PNG | 90% quality | YouTube upload (max 2MB) |
| Web previews (CDN) | WebP + AVIF | 80% quality | CloudFront delivery |

All conversions handled by Sharp (Node.js) — processes 1,000+ images per minute.

---

## Stock Asset Caching

### Search result caching:
- Same Pexels/Pixabay search query returns cached results for 24-72 hours
- Stored in DynamoDB: query → results metadata
- Reduces API calls significantly (Pixabay limit: 100/minute)

### Downloaded asset caching:
- Downloaded stock images/videos stored in S3 with metadata
- Pixabay requires this (no hotlinking allowed)
- Pexels images can be cached for performance
- TTL: 30 days for unused assets, permanent for assets used in projects

### Rate limit management:
- Pexels: 200 requests/hour (unlimited with proper attribution)
- Pixabay: 100 requests/60 seconds
- Queue system prevents hitting limits during batch operations

---

## Async Queue Architecture

### For batch image generation (all scenes at once):
1. User triggers "Auto-Fill All Visuals" or "Generate All"
2. System queues all image generation requests via fal.ai Queue API
3. Each request fires asynchronously with webhook callback
4. As each image completes, it appears in the scene editor in real-time
5. Progress bar shows: "12 of 20 images generated"
6. User can start reviewing completed images while others still generate

### Concurrency limits:
- fal.ai default: 2-10 concurrent tasks
- With $1,000+ credits: 40 concurrent tasks
- Our queue system manages burst scenarios automatically

---

## Media Library Integration

- Every generated, selected, or uploaded image saved to Media Library
- Tagged with: project, channel, scene, source type, prompt used, model used, generation seed
- Searchable and reusable across projects
- "Use in another project" button
- Bulk operations: delete, move, tag
- Visual Anchors stored here for reuse across projects

---

## Cost Estimates (fal.ai)

### Per-Image Costs:
| Operation | Model Tier | Cost |
|---|---|---|
| Image generation (draft) | FLUX Schnell / FLUX.2 Dev Turbo | ~$0.003-0.008 |
| Image generation (standard) | FLUX.2 Dev / Kontext Dev | ~$0.008-0.026 |
| Image generation (premium) | FLUX.2 Pro / Pro Ultra | ~$0.06-0.073 |
| Thumbnail background | Recraft V3/V4 | ~$0.04 |
| Upscaling | ESRGAN / AuraSR | ~$0.005-0.02 |
| Inpainting | FLUX | ~$0.03-0.05 |
| Background removal | Bria RMBG 2.0 | ~$0.005 |
| NSFW detection | fal-ai/imageutils/nsfw | ~$0.001 |
| Outpainting | fal-ai/outpaint | ~$0.02-0.04 |
| Depth estimation | Marigold/Midas | ~$0.005-0.01 |

### Per-Video Estimate (10 scenes, 2-3 visuals each):

| Scenario | Cost |
|---|---|
| Budget (draft + stock mix) | ~$0.10-0.20 |
| Standard (standard tier + some stock) | ~$0.25-0.55 |
| Premium (all premium + effects) | ~$1.00-2.00 |
| Thumbnails (3 variations) | ~$0.12-0.15 |
| NSFW checks (all images) | ~$0.01-0.03 |
| **Typical total per video** | **~$0.40-0.75** |

### Per-User Monthly Estimate:
- Casual (4 videos/month): ~$1.50-3.00
- Active (12 videos/month): ~$5-9.00
- Power (30 videos/month): ~$12-23.00

---

## Dependencies
- **Upstream:** Scripts module (fal_image_prompt, stock_search_query, external_prompts, visual_relationship, visual consistency metadata per scene), Channel Style (color palette, mood, aesthetic, default model tier, faceless setting)
- **Downstream:** Video Generation (static images may get animated/parallax), Editing module (final images per scene + consistency metadata for color grading, transitions, Ken Burns effects), Publishing (thumbnail images)
- **Media Library:** All images stored and catalogued here
- **Standalone Generator:** Same image generation engine available outside the project wizard
- **Voiceovers module:** Voice-first architecture means voiceover duration sets scene duration, images sized to fill that duration

---

## Edge Cases
- **fal.ai downtime:** Queue and retry. No TTS-style fallback needed — images can wait. Notify user of delay.
- **Stock search returns no results:** AI auto-generates an image using the stock_search_query as a prompt. User notified: "No stock images found — AI generated an alternative."
- **User uploads NSFW content:** Blocked by moderation pipeline. Clear error message. Repeat offenses could trigger account review.
- **Visual Anchor scene looks wrong:** User can regenerate with different Kontext settings or switch to a different anchor image.
- **Very long videos (30-60 scenes):** Queue handles it. Progress bar per scene. Allow reviewing completed scenes while others generate.
- **Mixed aspect ratios in one project:** System warns if scenes have inconsistent aspect ratios. Offers to crop/outpaint to match.

---

## Features NOT in v1 Launch (Future)
- AI "image director" that watches the full video and suggests visual improvements
- Real-time collaborative editing (multiple users editing visuals simultaneously)
- Video clip generation from static images (animated/parallax — partially in Video Generation module)
- AI-powered image search across the entire internet (beyond Pexels/Pixabay)
- Custom LoRA training for channel-specific visual styles
