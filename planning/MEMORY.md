# Faceless AI - Project Memory

## START HERE EVERY SESSION
**READ MASTER_RULES.md FIRST.** It contains all rules, the module tracker, and the workflow.

## Memory Files Index
- [MASTER_RULES.md](MASTER_RULES.md) — ALL rules, audit checkpoints, module status tracker
- [architecture.md](architecture.md) — Tech stack and cost strategy
- [data-model.md](data-model.md) — Account → Channel → Style → Project hierarchy
- [build-workflow.md](build-workflow.md) — How we build, session discipline, build order
- [niche-finder.md](niche-finder.md) — Finalized niche finder spec (33 features)
- [ai-integration.md](ai-integration.md) — AI strategy across the platform
- [ui-flow.md](ui-flow.md) — Full UI navigation, screens, and system workflow
- [viral-templates.md](viral-templates.md) — Viral script templates, retention science, trend research
- [scripts.md](scripts.md) — Finalized scripts module (dual-script, chunked generation)
- [voiceovers.md](voiceovers.md) — Finalized voiceovers module (ElevenLabs, audited)
- [images.md](images.md) — Finalized images module (fal.ai, audited)
- [video-generation.md](video-generation.md) — Finalized video generation module (fal.ai video clips)
- [editing-music.md](editing-music.md) — Finalized editing/music module (timeline editor, rendering, audio mix)
- [publishing.md](publishing.md) — Finalized publishing module (YouTube API, SEO, Shorts, scheduling)
- [research-board.md](research-board.md) — Finalized research board module (reference channels, saved videos, live monitoring)
- [billing.md](billing.md) — Pricing tiers, credit system, Stripe implementation
- [platform-systems.md](platform-systems.md) — Cross-cutting concerns (state machine, jobs, errors, GDPR)
- [channel-builder.md](channel-builder.md) — Finalized channel builder module (3 creation paths, 4 statuses, YouTube sync, onboarding)
- [style-system.md](style-system.md) — Finalized style system module (11-section profile, Shorts Override, Visual Anchors, Style Score, evolution)
- [projects-wizard.md](projects-wizard.md) — Finalized projects/wizard module (7-step wizard, 5 entry points, 18-state machine, post-publish)
- [auth.md](auth.md) — Finalized auth module (Cognito, BFF token pattern, team seats, trial, subscription lifecycle)
- [settings.md](settings.md) — Finalized settings module (11 sections, voice clones, API keys, Google Drive export, default priority chain)
- [analytics.md](analytics.md) — Finalized analytics module (channel dashboards, niche comparison public-only, sentiment analysis, two AI jobs, data retention policy, revenue opt-in)
- [admin.md](admin.md) — Finalized admin module (10 sections, impersonation mode, content moderation, cost piggyback on credit ledger, feature flags, primaryAdmin protection)
- [media-library.md](media-library.md) — Finalized media library module (global + channel views, Visual Anchor integration, reference-based sharing, trash system, Google Drive folder structure, team permissions, upload validation)
- [standalone-generator.md](standalone-generator.md) — Finalized standalone generator module (5 generator tabs, pronunciation dictionaries, post-processing toggle, music fallback, 8 thumbnail presets, NSFW frame sampling, credit refund on failure)
- [notifications.md](notifications.md) — Finalized notifications module (3 layers, team routing, batching, cards from state, admin/consumer separation, deduplication, WebSocket + polling fallback)

## Current Phase: PLANNING
We are discussing modules one by one. Do NOT write code. Do NOT write the blueprint until user says "go."

## Key Decisions Log
- Everything ships complete at launch — NO phased tiers
- fal.ai for ALL image/video generation (replaces Higgsfield + DALL-E)
- MediaPipe for face detection in Niche Finder only (detecting if competitor channels are faceless)
- DynamoDB + Lambda client-side filtering for complex queries (<$1/month)
- GPT-4o results cached per NICHE not per user
- No community features
- GitHub is dev workflow only (not user-facing)
- User MUST create YouTube channels themselves — no API for that
- Style is BLENDED from 1-5 reference channels (not copied from one)
- Style is auto-generated but user-editable, with version history
- Niche ≠ Style (many-to-many: same niche can have different styles)
- YouTube OAuth connections live at Account level, chosen at publish time
- AI acts as a "YouTube strategy consultant" throughout the platform
- Channels can be DRAFT (planning, no YouTube) or CONNECTED (YouTube linked)
- Social media connections at Account level, assigned to channels
- Stock assets: Pexels (primary, free) + Pixabay (supplemental) → Storyblocks at scale
- Music: ElevenLabs Music (primary) + Mubert (backup) — Suno has NO official API
- Envato: NOT viable (no API for Elements, hostile SaaS licensing)
- NO "Bring Your Own API Key" — ALL AI white-labeled as our own engine
- Admin account manages all API keys, user accounts never see backend services
- Google Drive integration for user-side export/backup
- S3 storage with lifecycle policies: ~$0.50-0.70/user/month
- CloudFront CDN in front of S3 (free tier → $15/month Pro)
- Delete intermediate files after 30 days (regenerable via AI), keep final videos
- Global Media Library + per-channel media
- Standalone Generator tool (images, videos, voiceovers, music, thumbnails)
- Niche Finder accessible globally AND within channel workspace
- Notifications: 3 layers (global bell, channel dashboard cards, inline project alerts)
- Blueprint destination: D:\Faceless AI\REBUILD_BLUEPRINT.md
- Build workflow doc: D:\Faceless AI\BUILD_WORKFLOW.md
- Existing codebase at D:\AI Video Generator (reference only)
- Social Competitor Tracker: Phase 2 "Coming Soon" feature — full UI + pipeline built at launch, data provider API key connected when revenue justifies (~$3-8/user cost). Uses ScrapeCreators or EnsembleData for Instagram + TikTok public data. Nx Viral Multiplier concept from Cila.app.
- Nx Viral Multiplier added to Niche Finder outlier detection (post performance ÷ channel average = Nx score)
- Scripts: Dual-script system (narrator + scene), chunked scene-by-scene generation, scales to 60+ min
- Voiceovers: ElevenLabs with per-scene voice variation, pronunciation dictionaries, multi-voice support, audio post-processing pipeline, fallback to OpenAI TTS
- Images: fal.ai model tier system (Draft/Standard/Premium), Visual Anchor system for consistency, NSFW moderation, hybrid thumbnails (AI background + programmatic text), auto-fill pipeline
- Billing: Credit-based system, 4 tiers ($59/$99/$199/$399), mid-range premium positioning, 60-80% cheaper than TubeGen with more features
- Platform Systems: Project state machine (18 states), cascade invalidation, job queue with WebSocket progress, error recovery per module, GDPR compliance, YouTube policy checks, publishing readiness checklist, handoff contracts between modules
- Admin account gets full platform access with no credit limits, no tier gates, no billing — uses the same consumer UI so owner can make their own faceless YouTube videos
- Editing: Timeline-based editor (not full NLE), scene-level render caching, color grading via LUTs, multi-format rendering (16:9, 9:16, 1:1), segmented music for long videos, parallax Ken Burns (depth-based, Creator+ only), undo/redo, YouTube end screen safe zones, 15-20 intro/outro templates
- Publishing: Full YouTube API integration (upload, metadata, captions, end screens, playlists), auto-chapters from scene structure, Shorts-specific flow, SEO generation, thumbnail preview at multiple sizes, channel verification detection, Made for Kids/COPPA, post-publish metadata editing, first-publish onboarding
- Channel Builder: 3 creation paths (plan-first, connect-first, from Niche Finder), 4 connection statuses (DRAFT/CONNECTED/DISCONNECTED/SUSPENDED) + lifecycle flags (isArchived/isPendingDelete), YouTube sync schedule with smart inactive tiers, Style Reconciliation on draft-to-connected, Shorts vs long-form analysis separation, tiered sampling (50 free + 200 deep), global YouTube uniqueness enforcement, onboarding progress checklist as cross-module platform feature, YouTube API ToS compliance with 4 data deletion scenarios
- Style System: 11-section profile (Script & Tone, Voice, Visual Format, Color Palette, Thumbnail, Music, Captions, Intro/Outro, Structure, SEO, Visual Anchors), Shorts Override layer for dual-format channels, Style Score (1-100 with category breakdowns), snapshot copy for project pinning, Style evolution from analytics (min 5 videos, confidence levels), standalone Styles for experimentation, 10 niche templates, reference compatibility validation, 75 credits to generate
- Projects/Wizard: 7-step wizard (Topic→Template→Script→Voiceover→Visuals→Editing→Publishing), 5 entry points (new/outlier/batch/duplicate/Shorts variant), strict step order (no skipping), "No Voiceover" for text-only Shorts with synthetic timing, format toggle (Long-Form/Shorts) locked at Step 3, light + deep duplicate, post-publish dashboard with re-edit mode (no YouTube video replacement via API), credit estimator throughout wizard, DRAFT channel Step 7 handling, abandoned project auto-archive (90/180 days), global calendar widget on Overview, batch outlines at 10 credits each
- Auth: Cognito with custom UI (no hosted UI), BFF token pattern (HttpOnly cookies + Next.js Route Handlers), Google/Apple social sign-in, verification-before-linking (no auto-link), team seats v1 = new accounts only, subscriptionStatus field separate from tier, trial abuse prevention (disposable email blocklist + reCAPTCHA v3), subscription lapse lifecycle (past_due/cancelled/lapsed with team member freezing), S3 paths must use project/file UUIDs not account IDs, active session tracking deferred to v1.1
- Settings: 11 sections (Profile, Security, Team, Connections, Billing, Notifications, Styles, Voices & Clones, Preferences, Data & Privacy, API Access), social media posting NOT in v1 (YouTube + Google Drive only), voice clone management at account level (ElevenLabs Instant Voice Cloning), default priority chain (Project → Channel → Global → System), API key management Agency-only (owner-only, 5 max, hashed, 60rpm/10K daily), Google Drive export (per-project + bulk + auto-export toggle), notification categories data-driven from Notifications module
- Analytics: Niche comparison uses PUBLIC metrics only (views, subs, engagement, frequency — NOT CTR/retention/watch time which are private), two separate weekly AI jobs (Channel Builder suggestions + Analytics performance insights, independent 20cr refresh with independent cooldowns), comment sentiment incremental-only (new comments each sync, initial 500 cap), revenue opt-in via supplemental OAuth scope, data retention (90-day daily → weekly → monthly), cross-channel analytics lives on existing Overview page, CSV + PDF export free, Shorts tab with watch% as key metric, progressive first-time sync
- Admin: 10 sections (Platform Overview, User Management, API Keys & Services, Model Configuration, Feature Flags, Cost Monitoring, Error Monitoring, GDPR & Compliance, Platform Settings, Audit Log) + Impersonation Mode + Content Moderation + Admin Notifications. Cost tracking piggybacks on credit ledger (estimatedCostUSD field, no separate table). Admin-configurable per-unit cost rates. Tier config changes: credits at next billing cycle, features immediate. Spend cap queue with 30-minute timeout + credit refund. primaryAdmin flag prevents admin self-destruction. BFF-based impersonation with read-only enforcement via X-Impersonation header. API keys stored in Secrets Manager, never displayed after entry. Lightweight content moderation queue for borderline NSFW/policy items. Lockout recovery via direct DynamoDB intervention (ops runbook).
- Media Library: Global (account-level) + Channel (filtered view) — same underlying data. References not duplicates (one S3 file, many projects). Visual Anchor integration (isVisualAnchor flag, dedicated filter, auto-pull for scene generation). Trash tab with 30-day restore window. Favorites system (star toggle, sorts to top). Auto-generated thumbnails (300px WebP via Lambda S3 trigger). Google Drive folder structure with ID suffixes to prevent collisions. Team members can view/use assigned channel assets but only delete their own uploads. Upload validation: magic bytes check at Lambda level, accepted types (PNG/JPG/WebP/GIF/MP4/MOV/WebM/MP3/WAV/M4A/AAC/OGG), 500MB max. Stock licensing metadata (licenseType, sourceUrl, sourceId). Three-tier deletion protection with cascade invalidation.
- Standalone Generator: 5 tabs (Image, Video Clip, Voiceover, Music, Thumbnail), optional channel association, pronunciation dictionaries auto-loaded for voiceovers, post-processing toggle (default ON), music fallback (ElevenLabs → retry → Mubert → error), 8 thumbnail text presets (customizable), NSFW moderation for both images and video clips (video uses frame sampling: first + last + 1/sec), credit refund on failure via refund transaction on credit ledger (same mechanism as admin spend cap), session history strip (last 20, not persisted), no batch generation in v1
- Notifications: 3 layers (global bell, channel dashboard cards, inline project alerts). Cards computed from real state on page load (not from Notifications table). Team member routing: notifications go to triggerer, not owner (except billing/connections → owner only, publishing → both). Notification batching (3+ same type within 60s → collapsed, batched links to parent project). Email batching (2-minute send delay for real-time). Quiet hours apply to real-time emails only, not digests. Standalone Generator context-aware routing (inline if on page, bell if navigated away). Admin vs consumer separation via SK prefix (user# vs admin#). Deduplication rules for credit warnings, sync, connections, failed jobs. 60-second card auto-refresh as WebSocket fallback. 90-day TTL on notification records.
