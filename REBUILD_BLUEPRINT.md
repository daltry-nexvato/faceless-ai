# FACELESS AI — COMPLETE REBUILD BLUEPRINT

> **Generated from 28 finalized module specs. This is the single source of truth for building the platform.**
> **Date:** March 18, 2026

---

# TABLE OF CONTENTS

1. [What This Platform Is](#1-what-this-platform-is)
2. [Tech Stack](#2-tech-stack)
3. [Data Model](#3-data-model)
4. [Build Order](#4-build-order)
5. [Auth (Cognito)](#5-auth-cognito)
6. [Channel Builder](#6-channel-builder)
7. [Style System](#7-style-system)
8. [Niche Finder](#8-niche-finder)
9. [Research Board](#9-research-board)
10. [Scripts](#10-scripts)
11. [Voiceovers](#11-voiceovers)
12. [Images](#12-images)
13. [Video Generation](#13-video-generation)
14. [Editing / Music](#14-editing--music)
15. [Publishing](#15-publishing)
16. [Projects / Wizard](#16-projects--wizard)
17. [Analytics](#17-analytics)
18. [Billing (Stripe)](#18-billing-stripe)
19. [Settings](#19-settings)
20. [Admin Dashboard](#20-admin-dashboard)
21. [Global Media Library](#21-global-media-library)
22. [Standalone Generator](#22-standalone-generator)
23. [Notifications System](#23-notifications-system)
24. [Platform Systems (Cross-Cutting)](#24-platform-systems-cross-cutting)
25. [AI Integration Strategy](#25-ai-integration-strategy)
26. [UI Flow / Navigation](#26-ui-flow--navigation)
27. [Viral Templates / Retention Science](#27-viral-templates--retention-science)
28. [DynamoDB Table Index](#28-dynamodb-table-index)
29. [External API Index](#29-external-api-index)
30. [Credit Cost Reference](#30-credit-cost-reference)
31. [Session Discipline / Build Rules](#31-session-discipline--build-rules)

---

# 1. WHAT THIS PLATFORM IS

Faceless AI is a multi-user SaaS for creating faceless YouTube videos end-to-end. Users research niches, build channel strategies, generate scripts, voiceovers, visuals, and music via AI, assemble videos in a timeline editor, and publish directly to YouTube — all from one platform.

**Core Philosophy:**
- ALL AI is white-labeled — users never see OpenAI, ElevenLabs, or fal.ai branding
- Everything ships complete at launch — no phased tiers or "coming soon" features (except Social Competitor Tracker)
- The platform IS the AI as far as users are concerned
- AI acts as a "YouTube strategy consultant" throughout every step
- Desktop-first (wizard/editor desktop-only, dashboards responsive)

**Two Account Types:**
- **Admin (Platform Owner):** Manages all API keys, sees all users, monitors costs, full consumer access with no credit limits or tier gates. Uses the same UI as paying users.
- **User (End User):** Creates channels, projects, generates content. Subject to tier-based limits. Never sees API keys or service names.

---

# 2. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) on AWS Amplify |
| Backend API | AWS Lambda (API endpoints) + Next.js Route Handlers (BFF) |
| Heavy Processing | ECS Fargate (FFmpeg video rendering, WhisperX) |
| Auth | AWS Cognito (custom UI, BFF token pattern) |
| Database | DynamoDB (on-demand mode, GSIs) |
| Storage | AWS S3 + CloudFront CDN |
| Image/Video AI | fal.ai (FLUX models, Kling, Sora 2, Veo 3) |
| Text AI | OpenAI GPT-4o (scripts, analysis, SEO) |
| Voice AI | ElevenLabs TTS + Sound Effects |
| Music AI | ElevenLabs Music (primary) + Mubert (backup) |
| Video Processing | FFmpeg on ECS Fargate |
| Face Detection | MediaPipe (server-side, Niche Finder only) |
| Stock Assets | Pexels (primary, free) + Pixabay (supplemental) |
| Billing | Stripe (subscriptions + credits) |
| Secrets | AWS Secrets Manager (all API keys) |
| CI/CD | GitHub + AWS Amplify |

**Cost at 1,000 users (month 12):** ~$37,000-63,000/month
**Average revenue per user:** ~$118/month
**Gross margin:** ~47-69%

### S3 Storage Strategy
- S3 Standard (0-30 days): active content
- S3 Standard-IA (30-90 days): published content
- Glacier Instant Retrieval (90-365 days): old content
- Delete intermediate files after 30 days (all regenerable via AI)
- Keep final rendered videos + thumbnails long-term
- CloudFront CDN eliminates S3 egress fees
- Per-user storage cost: ~$0.50-0.70/month
- S3 paths use project/file UUIDs, NOT account IDs (for future account merges)

---

# 3. DATA MODEL

```
Account (Cognito login)
  ├── YouTube Connections (OAuth — read + write scopes)
  ├── Google Drive Connection (OAuth)
  ├── Research Boards (per channel)
  └── Channels (user can have many)
        ├── Status: DRAFT / CONNECTED / DISCONNECTED / SUSPENDED
        ├── Lifecycle Flags: isArchived, isPendingDelete
        ├── Niche (from Niche Finder)
        ├── Reference Channels (1-5, from Research Board)
        ├── Style Profile (11 sections + Shorts Override + Visual Anchors)
        │     └── Version History (evolves over time)
        ├── Analytics Dashboard (YouTube data)
        └── Projects (individual videos)
              ├── Pinned Style Snapshot (copy at creation time)
              ├── Script (narrator + scene, scene-by-scene)
              ├── Voiceover (per-scene audio + timestamps)
              ├── Visuals (images + video clips per scene)
              ├── Timeline (editing configuration)
              ├── Rendered Video (S3)
              └── Publishing Metadata (title, description, tags, thumbnail)
```

**Key Rules:**
- Channel = 1:1 mirror of a real YouTube channel (or DRAFT for planning)
- Users MUST create YouTube channels themselves on YouTube (no API for channel creation)
- YouTube OAuth connections live at Account level, assigned to channels
- Style is BLENDED from 1-5 reference channels (not copied from one)
- Niche defines WHAT you talk about, Style defines HOW you present it (many-to-many)
- One YouTube channel = one platform account globally enforced

---

# 4. BUILD ORDER

Dependencies dictate this sequence. Each is a vertical slice (model + API + UI + tests).

| Phase | Module | Dependencies |
|---|---|---|
| 1 | Auth (Cognito + BFF) | None |
| 2 | Account + DynamoDB base tables | Auth |
| 3 | Channel CRUD + Channel Builder | Account |
| 4 | Style System | Channel Builder |
| 5 | Niche Finder (core search + scoring) | Account |
| 6 | Research Board | Niche Finder, Channel Builder |
| 7 | Channel Builder + AI Style Generation | Research Board, Style System |
| 8 | Scripts (GPT-4o) | Style System |
| 9 | Voiceovers (ElevenLabs) | Scripts |
| 10 | Images (fal.ai) | Scripts, Voiceovers |
| 11 | Video Generation (fal.ai) | Images |
| 12 | Editing / Music (FFmpeg on Fargate) | Voiceovers, Images, Video Gen |
| 13 | Publishing (YouTube OAuth) | Editing |
| 14 | Projects / Wizard (orchestration) | All content modules |
| 15 | Analytics | Channel Builder (YouTube sync) |
| 16 | Billing (Stripe) | Account |
| 17 | Settings | Auth, Billing, all modules |
| 18 | Admin Dashboard | All modules |
| 19 | Media Library | All content modules |
| 20 | Standalone Generator | Images, Video Gen, Voiceovers, Music |
| 21 | Notifications System | All modules |
| 22 | Platform Systems (cross-cutting) | Woven throughout |

---

# 5. AUTH (COGNITO)

**Full spec: auth.md**

### Core Architecture
- AWS Cognito User Pool (one pool, all users + admin)
- Custom UI (no Hosted UI) — all auth pages built in Next.js
- BFF Token Pattern: HttpOnly, Secure, SameSite=Lax cookies
- Next.js Route Handlers extract tokens server-side, forward to Lambda
- Token refresh handled server-side — users never notice
- Social sign-in: Google + Apple via Amplify Auth

### Token Strategy
- ID Token (1 hour): user identity + custom claims
- Access Token (1 hour): API authorization
- Refresh Token (30 days): silent renewal
- All stored in HttpOnly cookies (XSS-proof)
- Pre-Token-Generation Lambda injects custom claims from DynamoDB: accountId, role, tier, subscriptionStatus

### Registration
- Email + password with reCAPTCHA v3 (invisible)
- 6-digit verification code via email
- Disposable email blocklist (~3,000 domains) checked by Pre Sign-Up Lambda
- Google/Apple social sign-in creates account automatically

### Account Linking
- Auto-linking disabled (security risk)
- Verification-before-linking: sign in with existing method first, then link social provider
- Apple private relay emails handled gracefully with merge guidance

### Team Seats
- Pro (3 seats), Agency (10 seats), others (1 seat)
- Team members create NEW accounts via invitation link
- Linked to parent account via TeamMembership DynamoDB records
- Owner vs Member roles (members can't manage billing/team)
- Ownership transfer supported with dual confirmation

### Free Trial
- 7 days on Starter tier, no credit card required
- 5,000 credits, watermark on videos, full feature access
- Trial abuse: disposable email blocking + IP flagging + reCAPTCHA v3 + watermark deterrent

### Subscription Lifecycle
- `tier` field keeps last active tier, `subscriptionStatus` tracks: active / past_due / cancelled / lapsed / trial / trial_expired
- past_due: full access continues (Stripe retry window ~14 days)
- cancelled: access until end of billing period
- lapsed: view-only, data preserved 90 days
- Team members frozen (not removed) during lapse

---

# 6. CHANNEL BUILDER

**Full spec: channel-builder.md**

### Three Creation Paths
1. **Plan First (DRAFT):** Working name → Niche Finder → Research Board → Style → Projects (can't publish until YouTube connected)
2. **Connect First (CONNECTED):** YouTube OAuth → Pull data → AI detects niche + generates Style → Full functionality
3. **From Niche Finder:** "Create Channel From This" → DRAFT with niche + references pre-filled

### Connection Statuses
- DRAFT → CONNECTED (YouTube OAuth)
- CONNECTED → DISCONNECTED (token revoked/expired)
- DISCONNECTED → CONNECTED (re-authorize)
- Any → SUSPENDED (admin only)
- Lifecycle flags (independent): isArchived, isPendingDelete

### Draft-to-Connected Transition
- Style Reconciliation: side-by-side comparison (keep current / switch to detected / blend both)
- Niche mismatch detection and warning
- Existing projects automatically gain publishing capability

### Existing Channel Analysis
- **Free tier (automatic):** Channel metadata + 50 most recent videos analyzed (thumbnails via GPT-4o Vision, titles, tags, performance), Shorts vs long-form separated
- **Deep Analysis (optional, 100 credits):** 200 additional thumbnails, full historical breakdown

### YouTube Data Sync
- Active users: 6-24 hour sync cycles depending on data type
- Smart inactive tiers: idle (7-30 days) = weekly, dormant (30+ days) = monthly
- Return syncs rate-limited (max 10 concurrent) to prevent API quota spikes
- 28-day staleness safety net per YouTube ToS

### Global Uniqueness
- One YouTube channel = one platform account globally
- Enforced by checking YouTube Channel ID across all accounts in DynamoDB

### Channel Limits by Tier
- Starter: 2, Creator: 5, Pro: 15, Agency: Unlimited
- Archived and Suspended don't count toward limits

### Onboarding Progress Checklist (Cross-Module)
Account-level, tracked in DynamoDB:
1. Create your first channel
2. Research your niche
3. Save a reference channel
4. Generate your Style
5. Create your first project
6. Generate your first video
7. Publish to YouTube

---

# 7. STYLE SYSTEM

**Full spec: style-system.md**

### The Style Profile (11 Sections)
1. **Script & Tone:** tone, hook pattern, pacing, CTA style, vocabulary, humor
2. **Voice:** default voice ID, tone description, pace, energy variation, pronunciation dictionary
3. **Visual Format:** primary format, aspect ratio, image tier, visual density, Ken Burns mode
4. **Color Palette & Typography:** 3 colors (primary/secondary/accent), background mood, font family
5. **Thumbnail Template:** approach, text placement, color, background, consistency rules
6. **Music & Sound:** default mood, energy curve, SFX style, volume relationship
7. **Captions:** style (word-by-word/sentence/karaoke), font, position, emphasis style
8. **Intro/Outro:** template selection, duration targets, end screen layout
9. **Structure & Pacing:** target video length, scene count, transition style and duration
10. **SEO Patterns:** title pattern, description structure, tag strategy, hashtag usage
11. **Visual Anchors:** recurring visual elements (characters, objects, settings, logos) with reference images, descriptions, and usage rules

### Shorts Override Layer
Instead of separate Styles, a `shortsOverride` object replaces specific fields when creating Shorts projects. Fields not overridden carry through unchanged. Key overrides: aspect ratio (9:16), faster pacing, larger captions, no intro/outro, high-energy music.

### Two Generation Paths
- **From References (75 credits):** Compatibility check → blending analysis → conflict resolution → gap filling → Style Score
- **From Existing Content (free):** Detected from YouTube channel's existing videos during Channel Builder onboarding

### Style Score (1-100)
- Category breakdown: Thumbnail, Hook, Pacing, SEO scores
- Data sources: own analytics (strongest) → reference analysis → niche aggregate
- Dual-format scoring (long-form + Shorts separately)
- Advisory only — never blocks anything

### Style Pinning on Projects
- Full Style JSON snapshot copied into project at creation time
- Projects are self-contained — channel Style changes don't affect existing projects
- "Update to latest Style" button with visual consistency warning

### Style Evolution
- Triggers after 5+ published videos OR monthly (if 3+ new videos)
- Confidence levels: Low (5-9), Medium (10-19), High (20+)
- Specific field change suggestions with performance data backing

### Standalone Styles
- Not attached to any channel, for experimentation
- Create from template (free), from scratch (75 credits), or duplicate existing (free)
- Can be assigned to a channel later

### Style Limits by Tier
- Starter: 3, Creator: 10, Pro: 25, Agency: Unlimited

### 10 Niche Templates
True Crime, Educational, Finance, Tech Review, Gaming, Cooking, Travel, Health, Story/Commentary, Shorts/Viral — each fully filled with all 11 sections + Shorts Override.

---

# 8. NICHE FINDER

**Full spec: niche-finder.md**

### 33 Features (All Ship at Launch)

**Discovery:** Breakout channel database, multi-strategy crawler, multi-key API rotation, Google Trends integration, keyword difficulty scoring, related niche suggestions

**Scoring:** Niche-level breakout detection, composite scoring (6 factors), Nx Viral Multiplier (outlier video performance / channel average), "Why It Worked" analysis (GPT-4o), satisfaction-weighted scoring, saturation forecasting

**Content Intelligence:** Thumbnail pattern analysis (GPT-4o Vision), hook pattern library, content calendar intelligence, traffic source profiles, topic evolution timeline

**Channel Analysis:** Faceless channel detection (MediaPipe), competitor upload schedules, revenue estimation, time to monetization estimator, revenue stacking analysis

**AI Features:** Semantic clustering, AI recommendations with brand context, niche pivot alerts, knowledge graph content gaps, audience persona clustering

**Advanced Signals:** Reddit/social monitoring, comment sentiment mining, Shorts vs Longform split

**Integration Points:** "Create Channel From This" → Channel creation, "Create Video From This" → Project from outlier, background weekly recommendations

### Technical
- YouTube API quota: 3 keys = ~174 searches/day, 10 keys = ~600/day
- GPT-4o results cached per NICHE (not per user)
- MediaPipe runs on server (ECS Fargate/Lambda)
- DynamoDB with 3-4 GSIs + Lambda client-side filtering

---

# 9. RESEARCH BOARD

**Full spec: research-board.md**

### Two Sections Per Channel
- **Saved Channels (1-5):** Reference YouTube channels for deep analysis, feeds into Style generation
- **Saved Videos (10-25):** Individual standout videos for reference, does NOT feed into Style

### Tiered Analysis
- **Quick Analysis (50 credits, automatic on save):** Channel stats, 10 thumbnails via GPT-4o Vision, 3 top video transcripts, title/tag patterns, upload schedule
- **Deep Analysis (150 credits, user-triggered):** 30 thumbnails, 10 transcripts, top/bottom 5 breakdown, content gaps, tag correlation
- **Cross-Comparison (30 credits, 3+ channels):** Side-by-side comparison, AI opportunity analysis

### Live Monitoring
- Weekly background scan for new uploads on reference channels (free)
- Performance alerts using Nx Viral Multiplier (3x = strong, 10x = viral breakout)
- Change alerts: upload spikes, subscriber surges, potential rebrands

### Transcript Access
- YouTube's public timedtext/subtitle endpoint for auto-generated captions
- Fallback: analyze from title + description + tags + thumbnail only

### Data Refresh
- Monthly auto-refresh (free): stats only, no GPT-4o
- Manual refresh (50 credits): re-runs Quick Analysis with latest data
- Subscriber growth tracked via time-series in DynamoDB

---

# 10. SCRIPTS

**Full spec: scripts.md**

### Dual-Script System
- **Narrator Script:** Words the audience hears (with energy markers and pacing notes)
- **Scene Script:** What appears on screen (visual sequence with timestamps)
- Visual relationship per scene: MATCH / CONTRAST / SUPPLEMENT / ATMOSPHERIC

### Scene-by-Scene Chunked Generation
GPT-4o can't generate a full script in one call. The process:
1. User sets target duration → system calculates word budget (150 words/min)
2. Outline generation (1 API call): scene titles, key points, word budgets
3. Per-scene generation (1 API call each): narrator + scene script, 100-200 words per call
4. Stitch + validate: total word count check, transition polish pass
5. Scales to 60+ minutes (~60 scenes, ~60 API calls)

### Four Visual Source Options Per Scene
1. **Generate with AI** (fal.ai, white-labeled): image or video prompts included
2. **Stock Library** (Pexels/Pixabay): search queries included
3. **Upload Your Own:** drag-and-drop
4. **External Prompts:** optimized prompts for Midjourney, DALL-E, Stable Diffusion

### Script Generation Flow
Topic Selection → Topic Research (10 credits) → Template Selection → Chunked Generation → Script Review + Edit → Script Approval

### Additional Features
- A/B hook variants (2-3 alternatives scored)
- Short-Form Variant generation from long-form (10 credits)
- Batch generation (2-10 topic outlines at 10 credits each)
- YouTube video analysis ("Create Video From Outlier")
- Version history with side-by-side comparison
- Cost projection panel (credits for entire pipeline)

---

# 11. VOICEOVERS

**Full spec: voiceovers.md**

### Voice-First Architecture
Voiceover duration = video duration. Everything else sizes to match.

### ElevenLabs Integration
- TTS with Timestamps endpoint: returns audio + word-level timestamps in one call
- Per-scene voice variation (stability, speed, style exaggeration adjustable per scene)
- Energy markers from script translate to ElevenLabs controls
- SSML support limited to `<break>` and `<phoneme>` tags only

### Model Selection
- Flash v2.5: live previews (75ms latency, 40K char limit)
- Eleven v3: final renders (best quality, 3K char limit — requires chunking)
- Turbo v2.5: middle ground fallback

### Multi-Voice Support
- Text-to-Dialogue API: up to 10 voices in one audio file
- Natural turn-taking, available with timestamps
- Use cases: narrator + expert quotes, two-host format, character voices

### Pronunciation Dictionaries
- Per-channel dictionaries via ElevenLabs API
- .pls XML files managed via API
- Auto-suggest pronunciation rules for detected technical terms

### Voice Cloning
- Instant Clone: 1-3 minutes of audio, quick setup
- Professional Clone: 30 min - 3 hours, excellent quality
- Legal consent required (checkbox)
- Clone slots per tier: Starter 1, Creator 5, Pro 15, Agency 30

### Audio Post-Processing Pipeline (Per-Scene)
1. Loudness normalization (-14 LUFS, YouTube standard)
2. Dynamic range compression (2:1-3:1 ratio)
3. High-pass filter (remove sub-100Hz rumble)
4. De-essing (auto-detected, 4-8kHz)
5. Format standardization (44.1kHz/16bit)

### Caption Generation
- AI voiceovers: word-level timestamps from TTS → zero-error captions
- User uploads: Forced Alignment API (or Scribe v2 fallback)

### Fallback TTS
- ElevenLabs down → auto-retry once → OpenAI TTS fallback with user notification
- Non-urgent: queue-and-retry for up to 1 hour

### Duration Targeting
Duration control happens at the script level (word budget), not voiceover speed. Speed range is narrow (0.7-1.2x). If >10% off target, script needs expanding/trimming.

---

# 12. IMAGES

**Full spec: images.md**

### AI Image Generation (fal.ai)
- **Model Tier System:**
  - Draft: FLUX Schnell (~$0.003-0.008) — auto-fill, previews
  - Standard: FLUX Dev / Kontext Dev (~$0.008-0.026) — production
  - Premium: FLUX Pro (~$0.06-0.073) — hero shots
  - Text-on-Image: Recraft V3/V4 (~$0.04-0.05) — thumbnails
- Admin configures which model backs each tier

### Auto-Fill Pipeline
"Auto-Fill All Visuals" reads script prompts and fills all visual slots automatically. User reviews and swaps. Still images fire immediately after script approval; video clips wait for voiceover approval (need exact duration).

### Visual Anchor System (FLUX Kontext)
- Save any generated image as a Visual Anchor (recurring character/object/environment)
- Subsequent generations use Kontext with anchor as reference
- Multiple anchors per project (different for different elements)
- Fallback for non-AI images: IP-Adapter style extraction

### Thumbnail Generation (Hybrid)
- AI generates background image (Recraft V3/V4)
- System overlays text programmatically (Sharp — exact fonts, no AI text errors)
- 3-5 concepts, 2-3 variations each
- A/B test support (YouTube Test and Compare, up to 3)

### NSFW Content Moderation
- Every image (AI, stock, uploaded) passes through fal.ai NSFW detection
- Threshold: block above 0.7, borderline 0.6-0.85 flagged for admin moderation
- Cost: ~$0.001 per check

### In-Platform Editing
Crop, resize, rotate, brightness/contrast/saturation, filter presets (LUTs), text overlay, background removal (Bria RMBG). All via Sharp (Node.js).

### Advanced Features
- Inpainting, outpainting, upscaling (ESRGAN/AuraSR)
- Style transfer (IP-Adapter), ControlNet, depth estimation (Marigold/Midas)
- Multi-format generation (16:9 + 9:16 + 1:1)

---

# 13. VIDEO GENERATION

**Full spec: video-generation.md**

### What This Module Does
Generates short AI video clips (3-10 seconds) as premium visual options alongside still images. NOT the final rendered video (that's Editing).

### Key Rules
- Optional, not default. Most faceless videos use still images + Ken Burns.
- Tier gated: Creator+ only (Starter cannot access)
- Expensive: 15-30 credits per second

### Two Generation Modes
1. **Text-to-Video:** prompt only, less predictable
2. **Image-to-Video (recommended):** animates an existing still image, much more predictable

### Credit Scaling (Linear)
| Quality | 3s | 5s | 10s |
|---|---|---|---|
| Draft | 45 | 75 | 150 |
| Standard/Premium | 90 | 150 | 300 |

### Available Models (via fal.ai)
Kling 1.6, MiniMax (Hailuo), Runway Gen-3 Alpha Turbo, Luma Dream Machine, Wan 2.1 — admin-configurable

### Important Rules
- Audio stripped from all generated clips (voiceover is primary audio)
- Visual Anchor support via image-to-video (animate consistent characters)
- Cascade invalidation shows credit cost warning for video clip re-generation
- NSFW moderation: frame sampling (first + last + 1/second)

---

# 14. EDITING / MUSIC

**Full spec: editing-music.md**

### What This Is
An "approval and adjustment" timeline editor, NOT a full NLE like Premiere Pro. AI does the heavy lifting, user reviews and tweaks.

### Editor UI
- Top: large video preview player
- Bottom: horizontal timeline with tracks — visual, voiceover waveform, music, SFX, captions
- Scene dividers, scrub/seek, zoom in/out

### Timeline Assembly
- Scene duration = voiceover duration (voice-first)
- Visual slot sequencing from script timestamps (or even distribution fallback)
- Ken Burns effects: Standard (2D pan/zoom, free) or Parallax (3D depth-based, 5 credits/image, Creator+)
- Transitions: cut, crossfade, fade to black, slide, zoom — 0.1-2.0s adjustable
- Color grading: FFmpeg LUTs (cinematic, warm, cool, etc.), per-scene toggle

### Caption/Subtitle System
- Word-by-word animated captions (trending style for faceless)
- Multi-voice differentiation: per-speaker colors and labels
- Shorts: larger, centered captions

### Background Music
- ElevenLabs Music (primary) + Mubert (backup)
- Segmented generation for long videos (crossfade segments)
- Timestamp-based ducking from voiceover word timestamps
- 50 credits per minute of generated music

### Sound Effects
- One-shot (point markers) + Ambient/Loop (range markers, auto-loop)
- ElevenLabs SFX API, 10 credits each

### Intro/Outro
- 15-20 pre-built templates (rendered via FFmpeg with customized values)
- Saved at channel level, reused across projects
- YouTube end screen safe zone overlay (last 5-20 seconds)

### Rendering
- ECS Fargate + FFmpeg, output MP4 (H.264, AAC)
- Scene-level render caching: edit one scene → only that scene re-renders
- Multi-format: 16:9, 9:16, 1:1
- Priority rendering for Pro/Agency tiers
- Resolution: 1080p default, 720p, 4K (Pro+)
- Undo/redo: 50-step history, in-memory
- Auto-save every 30 seconds to DynamoDB

---

# 15. PUBLISHING

**Full spec: publishing.md**

### Publishing Readiness Checklist (13 Items)
All must be true before Publish button enables: rendered video, thumbnail, title, description, tags, category, Made for Kids, comment settings, language, captions, YouTube connected, policy check passed, final preview confirmed.

### SEO Generation (GPT-4o)
- 3-5 title options ranked by click potential
- Full description with auto-chapters (grouped from template sections, not 1:1 scenes)
- 15-30 tags (broad + specific + long-tail)
- Shorts SEO: shorter title, hashtag-focused, #Shorts auto-added

### Thumbnail Finalization
- Preview at 4 YouTube context sizes (homepage, sidebar, search, mobile)
- Light and dark backgrounds
- Channel verification check (unverified = no custom thumbnails, 15-min limit)

### YouTube API Integration
- Resumable uploads (chunked, survives interruptions, up to 3 retries)
- End screens and info cards via API after upload
- Captions uploaded as SRT (massive SEO benefit)
- Playlist assignment (existing or create new)

### Publishing Options
- Publish Now, Schedule for Later, Save as Draft (YouTube)
- AI recommends optimal posting times
- DRAFT channels: "Save as Ready" option, connect YouTube when ready

### Post-Publish
- Project status → PUBLISHED
- Performance metrics from YouTube Analytics API
- "Edit Metadata" live via API (title, description, tags, thumbnail)
- "Re-edit Video" opens wizard in edit mode (changes create new render, upload as new video only — YouTube API doesn't support file replacement)

### Publish Rate Limits by Tier
Starter: 2/day, Creator: 5/day, Pro: 15/day, Agency: 50/day

---

# 16. PROJECTS / WIZARD

**Full spec: projects-wizard.md**

### Seven-Step Wizard
1. **Topic:** AI suggestions + manual entry, format toggle (Long-Form/Shorts)
2. **Template:** Script structure selection (filtered by format)
3. **Script:** Dual-script generation + editing (format locked from here)
4. **Voiceover:** Voice selection + generation ("No Voiceover" option for text-only Shorts)
5. **Visuals:** Auto-fill pipeline, 4 sources, Visual Anchors, partial completion allowed
6. **Editing:** Timeline assembly, music, captions, transitions, preview, render
7. **Publishing:** SEO, thumbnail, settings, schedule/publish

### Five Entry Points
1. New Project (blank)
2. From Outlier (topic pre-filled, 20 credits)
3. From Batch Generation (2-10 outlines at 10 credits each)
4. Duplicate (Light = topic+settings only; Deep = everything including assets)
5. Short-Form Variant (from completed long-form, 10 credits)

### State Machine (18 States)
DRAFT → TOPIC_SELECTED → SCRIPTING → SCRIPT_APPROVED → VOICEOVER_IN_PROGRESS → VOICEOVER_APPROVED → VISUALS_IN_PROGRESS → VISUALS_APPROVED → EDITING → RENDERING → RENDER_COMPLETE → READY_TO_PUBLISH → SCHEDULED → PUBLISHING → PUBLISHED (+ RENDER_FAILED, PUBLISH_FAILED, ARCHIVED)

### Navigation Rules
- Steps must be completed in order (no skipping)
- Going back preserves downstream work, marks as "needs review"
- Cascade invalidation with credit cost warnings
- Exception: Visuals step allows partial completion

### Credit Estimator
- Pre-wizard estimate shown at project creation
- Running total during wizard (top bar)
- Pre-generation confirmation for operations >100 credits

### Auto-Archive
- 90 days untouched in early states → auto-archived
- 180 days in later states → auto-archived
- PUBLISHED/SCHEDULED: never auto-archived
- 7-day warning notification before auto-archive

### Concurrent Limits (Active Background Jobs)
Starter: 2, Creator: 5, Pro: 10, Agency: 25

---

# 17. ANALYTICS

**Full spec: analytics.md**

### Channel Analytics Dashboard (5 Tabs)

**Overview Tab:** Key metrics cards (subs, views, watch time, CTR, avg view duration), views over time chart, top 5 videos, audience demographics, traffic sources. Revenue card: opt-in only.

**Videos Tab:** All published videos sortable by any metric. Per-video detail: retention curve, traffic sources, impressions/CTR over time, end screen performance.

**Shorts Tab:** Separate metrics (watch percentage = key metric), Shorts vs long-form comparison card. Audience retention curve NOT available via API for Shorts.

**AI Insights Tab:** Weekly GPT-4o analysis — what's working, what's not, content gaps, timing insights, growth analysis, retention patterns. Manual refresh: 20 credits with 1-hour cooldown.

**Comments Tab:** Comment feed with sentiment analysis. Initial 500-comment cap on connection, incremental analysis thereafter. Sentiment: positive/neutral/negative/question/spam classification.

### Niche Comparison (PUBLIC Metrics Only)
Compare: avg views, subscriber growth rate, upload frequency, engagement rate, avg video length. NOT comparable: CTR, retention, watch time (private YouTube data). Niche averages from Research Board references + Niche Finder cached data.

### Revenue Data (Opt-In)
Supplemental OAuth scope (`yt-analytics-monetary.readonly`), NOT requested during initial OAuth. Prompted only if channel detected as monetized.

### Two Separate Weekly AI Jobs
1. Channel Builder Dashboard Suggestions ("What should you make next?")
2. Analytics Performance Insights ("How are you doing and why?")
Independent 20-credit manual refresh, independent cooldowns.

### Data Retention
- Daily granularity: 90 days
- After 90 days: weekly buckets
- After 1 year: monthly buckets
- Aggregation by scheduled Lambda job

### Cross-Channel Analytics
Lives on existing global Overview page. Aggregate stats + per-channel cards + cross-channel AI insights.

---

# 18. BILLING (STRIPE)

**Full spec: billing.md**

### Pricing Tiers

| | Starter | Creator | Pro | Agency |
|---|---|---|---|---|
| Monthly | $59 | $99 | $199 | $399 |
| Annual | $49/mo | $79/mo | $169/mo | $339/mo |
| Credits | 50K | 125K | 300K | 750K |
| Videos (~) | ~46 | ~116 | ~280 | ~700 |
| Channels | 2 | 5 | 15 | Unlimited |
| Styles | 3 | 10 | 25 | Unlimited |
| Voice Clones | 1 | 5 | 15 | 30 |
| Seats | 1 | 1 | 3 | 10 |
| AI Video Clips | No | Yes | Yes | Yes |
| Priority Rendering | No | No | Yes | Yes |
| API Access | No | No | No | Yes |

### Credit System
- Shared pool per month, no rollover in v1
- Warning at 80%, hard stop at 100%
- Buy More: 10K credits for $15 one-time
- Failed operations refund credits automatically

### Typical Video Cost
Standard 10-min video (still images): ~1,070 credits
Premium 10-min video (with AI video clips): ~2,390 credits

### Trial
7 days, no credit card, 5,000 credits, watermark on videos

### Upgrade/Downgrade
- Upgrade: immediate, prorated
- Downgrade: next billing cycle
- Cancel: access until end of period, then lapsed

### Admin Account
Full unrestricted access, no credit limits, no tier gates, no billing. `isAdmin` bypass on every credit check and tier gate.

---

# 19. SETTINGS

**Full spec: settings.md**

### 11 Sections
1. **Profile:** Name, email, picture, timezone, language
2. **Security:** Password, login methods, sign out everywhere, 2FA (coming soon)
3. **Team:** Pro/Agency only. Roster, invite, remove, transfer ownership
4. **Connections:** YouTube + Google Drive (v1 only — no social media posting)
5. **Billing:** Plan, credits, usage, payment method, invoices
6. **Notifications:** Per-category email/in-app toggles, data-driven from Notifications module
7. **Styles:** Standalone Style management
8. **Voices & Clones:** Account-level voice library, clone creation/management (50 credits per clone)
9. **Preferences:** Default quality tier, format, auto-save interval, theme, calendar start day
10. **Data & Privacy:** GDPR export + deletion
11. **API Access:** Agency only. 5 max keys, hashed, 60rpm/10K daily

### Default Priority Chain
Project override → Channel default → Global preference → System default

### Google Drive Export
- Per-project export (video + thumbnail + script + captions)
- Bulk export (10 projects max)
- Media Library export
- Auto-export toggle (on publish)
- Folder structure: `Faceless AI / [Channel Name]-[id] / [Project Name]-[id] / [type]/`

---

# 20. ADMIN DASHBOARD

**Full spec: admin.md**

### 10 Sections + 3 Special Features

1. **Platform Overview:** Active users, MRR, credit usage, API costs, margin, active jobs, error rate, pending actions
2. **User Management:** Search/filter/sort users. Actions: suspend, override tier/credits, force password reset, delete, impersonate. primaryAdmin flag prevents self-destruction.
3. **API Keys & Services:** All platform API keys stored in AWS Secrets Manager. Never displayed after initial entry. Per-service status cards.
4. **Model Configuration:** Which AI model backs each operation. Admin-configurable per-unit cost rates for cost tracking.
5. **Feature Flags:** Toggle features without deploy (socialCompetitorTracker, maintenanceMode, etc.). Stored in DynamoDB AdminConfig table.
6. **Cost Monitoring:** Piggybacks on credit ledger (estimatedCostUSD field per transaction). Per-service, per-user, and margin dashboards. Spend caps with 30-minute queue timeout + credit refund.
7. **Error Monitoring:** Error rate per service, breakdown by type, alerts (degraded/down/auth spike/rate limit).
8. **GDPR & Compliance:** Deletion request queue, data export requests, compliance dashboard.
9. **Platform Settings:** Rate limits, tier configuration (credits → next cycle, features → immediate), default content settings.
10. **Audit Log:** Immutable, append-only. Every admin action logged with before/after values. Permanent retention.

**Impersonation Mode:** BFF sets impersonation_target cookie → Lambda loads target user's data → ALL writes blocked (X-Impersonation header) → persistent "Read Only" banner.

**Content Moderation:** Lightweight queue for borderline NSFW/policy items (60-85% confidence). Approve/Reject/Escalate. Auto-expire after 7 days.

**Lockout Recovery:** Direct DynamoDB intervention to update primaryAdmin flag (ops runbook, not UI).

---

# 21. GLOBAL MEDIA LIBRARY

**Full spec: media-library.md**

### Two Levels
- **Global (account level):** All media across all channels, sidebar accessible
- **Channel (filtered view):** Same data filtered by channelId

### Asset Types
AI images, AI video clips, thumbnails, voiceovers, music, stock images/video, user uploads, final videos, captions

### Key Features
- **References not duplicates:** One S3 file, many project references. "Copy to Project" creates a reference, not a duplicate.
- **Visual Anchor integration:** `isVisualAnchor` flag, dedicated filter, auto-pull for scene generation
- **Trash tab:** 30-day restore window, separate from main library grid
- **Favorites:** Star toggle, sorts to top within current sort order
- **Thumbnail generation:** 300px WebP via Lambda S3 trigger for grid view performance
- **Stock licensing metadata:** licenseType, sourceUrl, sourceId per asset

### Deletion Protection (3 Tiers)
1. Published video asset → warning about re-render impact
2. Active project asset → warning with project name, marks scene as needing replacement
3. No project references → normal delete to trash

### Team Permissions
- Members can view/use assets in assigned channels
- Members can upload new assets
- Members can only delete assets they uploaded (uploadedBy field)

### Upload Validation
- Accepted: PNG, JPG, WebP, GIF, MP4, MOV, WebM, MP3, WAV, M4A, AAC, OGG
- Max: 500MB
- Magic bytes validation at Lambda level (prevents extension spoofing)
- Frontend MIME type restriction + Lambda verification

### Google Drive Folder Structure
```
Faceless AI/
  [Channel Name]-[id4]/
    [Project Name]-[id4]/
      images/
      video-clips/
      voiceovers/
      music/
      thumbnails/
      final/
```
Standalone assets → `Faceless AI/Standalone/[type]/`

---

# 22. STANDALONE GENERATOR

**Full spec: standalone-generator.md**

### 5 Generator Tabs
1. **Image:** Prompt, negative prompt, model tier, aspect ratio, style reference, Visual Anchor option
2. **Video Clip:** Text-to-video or image-to-video, duration (3/5/10s), aspect ratio, motion settings
3. **Voiceover:** Text input, voice selection, model, speed, stability, similarity boost. Pronunciation dictionaries auto-loaded. Post-processing toggle (default ON).
4. **Music:** Description, duration (15-120s), instrumental toggle. Fallback: ElevenLabs → retry → Mubert → error.
5. **Thumbnail:** Background prompt, title/subtitle text, 8 text style presets (customizable), model tier

### Key Features
- Optional channel association (pre-fills style defaults)
- Session history strip (last 20, not persisted)
- Credit estimator before generation
- NSFW moderation for images AND video clips (frame sampling: first + last + 1/sec)
- Credit refund on failure via refund transaction on credit ledger

### What's NOT in v1
No batch generation, no prompt presets, no inpainting/editing, no upscaling, no sharing

---

# 23. NOTIFICATIONS SYSTEM

**Full spec: notifications.md**

### Three Notification Layers

**Layer 1: Global Bell (navbar)**
- Platform-wide events: billing, account, publishing, system, long-running AI jobs, errors
- Real-time via WebSocket, polling fallback (30-second)
- Full page with infinite scroll, filterable by category
- 90-day TTL on records

**Layer 2: Channel Dashboard Cards**
- Computed from real state on page load (NOT from Notifications table)
- Card types: Projects Ready, Publishing Results, Style Update, Connection Issue, Credit Warning, Sync Status, Failed Jobs, Onboarding
- 60-second auto-refresh as WebSocket fallback
- Dismissable via `CardDismissals` DynamoDB record

**Layer 3: Inline Project Alerts**
- Transient: job progress, job complete/failed, validation warnings, cascade alerts, credit usage, publishing status, save confirmation
- Success auto-dismiss after 5 seconds, errors persist until acted on
- Regenerate from project state when page revisited

### Team Member Routing
- Notifications go to the person who triggered the action (not owner)
- Exceptions: billing/connections → owner only; publishing → both owner and member

### Notification Batching
- 3+ same type within 60 seconds → collapsed into one summary
- Batched notifications link to parent project (not specific scene)
- Email batching: 2-minute send delay to prevent burst emails

### Email Preferences
- Per-category toggles
- Quiet hours apply to real-time emails only, NOT to daily digests
- Transactional emails (password reset, payment) always send

### Admin vs Consumer Separation
- Same DynamoDB table, different SK prefix: `user#` vs `admin#`
- Consumer bell on main app, admin bell on Admin Dashboard only
- Never mixed on the same screen

### Deduplication Rules
- Credit warning: once at 20%, once at 5%, reset on replenishment
- YouTube sync: only if meaningful changes found
- Connection issues: once per break, reset on reconnection
- Failed jobs: update existing notification on re-failure

### Standalone Generator
Context-aware: inline update if on generator page, bell notification if navigated away

---

# 24. PLATFORM SYSTEMS (CROSS-CUTTING)

**Full spec: platform-systems.md**

### Project State Machine
18 states with defined transitions. Backward navigation marks downstream as "needs review." Cascade invalidation: script change → voiceover + visuals for affected scenes. Video clip invalidation shows credit cost warning.

### Credit System = Rate Limiting
- Daily burst limit: max 20% of monthly credits in one day
- Concurrent operation limit per tier
- Admin alerts at 50% daily burn
- Auto-suspension at 3x tier price daily cost

### Job Queue + Progress
- WebSocket real-time updates (polling fallback)
- User can navigate away — jobs continue server-side
- Background jobs panel (like download manager)

### Error Recovery
Per-module retry strategies. Script: retry failed scene. Voiceover: ElevenLabs → retry → OpenAI TTS. Images: retry → stock fallback. Rendering: retry from last scene. Publishing: 3 retries with exponential backoff.

### GDPR Compliance
- Data Export: ZIP within 24 hours, download link expires 7 days
- Account Deletion: 30-day grace period, then permanent wipe (DynamoDB + S3 + Cognito + Stripe + YouTube tokens)
- All data encrypted at rest, all API calls HTTPS

### YouTube Policy Compliance Check
GPT-4o reviews all text content before publish. Returns PASS / WARNING / FAIL.

### Publishing Readiness Checklist
13 items all must be true before Publish button enables.

### Handoff Contracts
- Voiceover → Visuals: scene timing data (duration, word timestamps, padding)
- Voiceover → Editing: caption data (words, timestamps, emphasis, speaker IDs)
- Scripts → Niche Finder: niche context package (hooks, gaps, persona, trends)
- SEO: scored during Scripts, generated during Publishing
- Thumbnails: preliminary during Visuals, refined during Publishing

---

# 25. AI INTEGRATION STRATEGY

**Full spec: ai-integration.md**

AI is woven into every step. The user should feel like they have a YouTube strategy consultant:

1. **Reference Channel Analysis:** GPT-4o Vision on thumbnails, script structure extraction, title patterns, performance correlation, content gap detection
2. **Style Generation:** Blended recommendations with conflict resolution and gap filling
3. **Niche Finder Intelligence:** Proactive sub-niche suggestions, risk assessment, what-if scenarios
4. **Per-Project AI:** Topic suggestions, style-driven script generation, visual direction, thumbnail generation, SEO optimization, quality check before publish
5. **Post-Publish Intelligence:** Performance analysis, style evolution suggestions, A/B insights, niche health monitoring
6. **Research Board Assistant:** Channel report cards, cross-channel comparison, red flag detection, "also look at" suggestions

**Cost per user (2 channels, 8 videos/month): ~$3-5/month in AI costs**

---

# 26. UI FLOW / NAVIGATION

**Full spec: ui-flow.md**

### Global Level (sidebar when NOT inside a channel)
Overview, Channels, Media Library, Generate (Standalone), Niche Finder, Settings, Notifications (bell in top bar)

### Channel Level (sidebar when inside a channel workspace)
Dashboard, Projects, Niche Finder (scoped), Research Board, Style, Analytics, Schedule, Publishing, Settings

### Key UX Patterns
- Channel switcher in top bar (like Slack workspaces)
- Dashboard filters between all channels and individual
- DRAFT channels show persistent "Connect YouTube" prompt
- AI suggestions everywhere but never mandatory
- Every AI element has "Regenerate" and manual edit
- Progress saved automatically

---

# 27. VIRAL TEMPLATES / RETENTION SCIENCE

**Full spec: viral-templates.md**

### 10 Script Templates
5 long-form (Educational, Listicle, Documentary, Comparison, Explainer) + 5 short-form (Quick Tip, Seamless Loop, POV, Mini-Story, Before/After)

### Hook Library
6 categories: Curiosity/Secret, Challenge/Contrarian, Value Promise, Shock/Stat, Question, Story

### Retention Rules (Baked Into Every Script)
- Pattern interrupts every 20-30 seconds
- Open loops at 25%, 50%, 75% marks
- Mini-payoffs every 60-90 seconds
- Hook must achieve 70%+ retention at 30 seconds
- AI narration monotone mitigation: vary pacing, energy markers, music beds

### Thumbnail Rules
- Max 4 words, 1 subject + 1 context + bold colors
- Rule of thirds, min 30% free space, contrast ratio 4.5:1
- 1280x720 sRGB

### Title Rules
- 55-60 characters optimal, important words first
- Two-part: intrigue + clarity
- Numbers increase CTR 20-30%

### Optimal Video Length by Niche
Education: 12-18 min, True Crime: 15-30 min, Finance: 10-20 min, Tech: 8-15 min

### Cross-Platform Trend Research
YouTube (built-in), Reddit (free API), X/Twitter ($200/month), Google Trends (alpha), Virlo ($49/month for TikTok+Shorts), Apify ($39-199/month)

---

# 28. DYNAMODB TABLE INDEX

| Table | Purpose | PK | SK |
|---|---|---|---|
| Accounts | User accounts | accountId | — |
| TeamMemberships | Team member links | userId | parentAccountId |
| Channels | Channel records | accountId | channelId |
| Styles | Style profiles + versions | channelId (or standalone ID) | version# |
| Projects | Video projects | channelId | projectId |
| MediaAssets | All media files | accountId | assetId |
| CreditLedger | Credit transactions + estimatedCostUSD | accountId | timestamp#transactionId |
| Notifications | All notifications | accountId | user#createdAt#notificationId (or admin#) |
| CardDismissals | Dashboard card dismissals | accountId#channelId | cardType |
| AdminConfig | Feature flags, settings, tier configs | configType | configKey |
| AuditLog | Admin action log | YYYYMM | timestamp#actionId |
| ContentModeration | Flagged content queue | status | timestamp#itemId |
| VideoAnalytics | Per-video current metrics | channelId | videoId |
| DailySnapshots | Daily video metrics | videoId | date |
| ChannelDailyStats | Channel-level daily aggregates | channelId | date |
| NicheCache | Cached niche analysis | nicheId | dataType |
| StockSearchCache | Cached stock search results | queryHash | — |
| OnboardingProgress | Account onboarding steps | accountId | — |
| Jobs | Background job tracking | projectId | jobId |
| ReferenceChannels | Research Board channels | channelId | refChannelId |
| SavedVideos | Research Board videos | channelId | savedVideoId |

*GSIs defined per table in individual module specs.*

---

# 29. EXTERNAL API INDEX

| Service | Key Type | What It Powers | Scaling |
|---|---|---|---|
| OpenAI | 1 org key | Scripts, SEO, analysis, policy checks | Tier 5: 10K RPM |
| ElevenLabs | 1 key (OEM) | Voiceovers, music, sound effects, cloning | Enterprise tier |
| fal.ai | 1 key | Images, video clips, NSFW detection, depth maps | 40 concurrent at $1K+ |
| Pexels | 1 key | Free stock images + video | Unlimited with attribution |
| Pixabay | 1 key | Supplemental stock | 100 req/min |
| Mubert | 1 key | Backup AI music | Enterprise pricing |
| Stripe | Secret + Publishable | Billing, subscriptions | Standard |
| YouTube | OAuth Client | User connections, data sync, upload | Quota extension needed |
| Google Drive | OAuth Client | User export/backup | Standard |
| ScrapeCreators | 1 key | Social Competitor Tracker (Phase 2) | Pay-as-you-go |

---

# 30. CREDIT COST REFERENCE

| Operation | Credits |
|---|---|
| Script generation | 10 per 100 words |
| Voiceover generation | 40 per minute |
| Image (Draft) | 5 |
| Image (Standard) | 15 |
| Image (Premium) | 30 |
| Thumbnail | 20 |
| Image upscaling | 5 |
| Inpainting/outpainting | 15 |
| Background removal | 5 |
| Sound effect | 10 |
| Music generation | 50 per minute |
| AI video clip (Draft) | 15 per second |
| AI video clip (Standard/Premium) | 30 per second |
| Parallax depth map | 5 per image |
| Voice clone creation | 50 |
| Research Board: Quick Analysis | 50 |
| Research Board: Deep Analysis | 150 |
| Research Board: Cross-Comparison | 30 |
| Research Board: Video Analysis | 30 |
| Research Board: Manual Refresh | 50 |
| Channel Builder: Deep History | 100 |
| Dashboard Suggestion Refresh | 20 |
| Analytics Insight Refresh | 20 |
| Style generation | 75 |
| Style AI preview | 15 |
| Niche Finder search | 5 |
| Topic research | 10 |
| Script from outlier | 20 |
| Batch topic outline | 10 each |
| Short-Form Variant analysis | 10 |

**Always free:** Stock search, user uploads, external prompts, NSFW checks, style editing, template selection, rendering, publishing, analytics viewing, CSV/PDF export, all settings changes, all auth operations.

---

# 31. SESSION DISCIPLINE / BUILD RULES

**Full spec: build-workflow.md**

### Session Discipline
1. /clear at start of each coding session
2. Load context: spec + current task file
3. Small batch: 1-2 components per session (5-20 files max)
4. Tests must pass before commit
5. User reviews every diff
6. Update progress tracker
7. Save and exit before context gets stale
8. If corrected twice on same issue → /clear and restart

### Project Structure
```
CLAUDE.md              — Build/test/lint commands, code style, forbidden patterns
architecture.md        — This blueprint (master spec)
tasks/
  [feature]-plan.md    — What we're building
  [feature]-context.md — Key files, decisions, dependencies
  [feature]-progress.md — Checklist of work items
```

### Key Rules
- Feature-by-feature in vertical slices (model + API + UI + tests)
- Git repo from day one, every feature gets a branch
- Tests written alongside implementation, never after
- Integration tests over unit tests (no heavy mocking)
- Pre-commit hooks block if tests fail
- Never let Claude improvise architecture — THIS SPEC is the source of truth

### Claude Code Failure Modes to Guard Against
- Context amnesia → /clear aggressively
- Hallucinating files/APIs → verify against spec
- Claiming "done" prematurely → tests must pass
- Modifying tests to pass instead of fixing code → review test diffs
- Quick hacks over proper architecture → enforce spec compliance
- Ignoring CLAUDE.md → keep it lean and critical

---

# PHASE 2: SOCIAL COMPETITOR TRACKER

**Status: "Coming Soon" — full UI + pipeline built at launch, data not connected**

- Track public Instagram + TikTok accounts
- Nx Viral Multiplier for cross-platform trend detection
- Data provider: ScrapeCreators (primary) or EnsembleData
- "SocialDataProvider" abstraction interface
- Admin feature flag toggle + API key paste → data flows immediately
- Estimated cost when active: ~$3-8/user/month (shared data pool)
- Data cached per niche, not per user

---

> **END OF BLUEPRINT**
> This document was compiled from 28 individually audited module specifications.
> Each module went through: initial spec → deep audit → fixes → self-audit of fixes → integrated save.
> For detailed specifications on any module, reference the individual spec file in the planning folder.
