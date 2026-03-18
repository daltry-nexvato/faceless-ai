# Architecture Decisions

## Tech Stack
- **Frontend:** Next.js (App Router) on AWS Amplify
- **Backend:** AWS Lambda (API endpoints) + ECS Fargate (video processing)
- **Auth:** AWS Cognito (multi-user SaaS, OAuth support)
- **Database:** DynamoDB (on-demand mode, GSIs for common queries)
- **Storage:** AWS S3 + CloudFront CDN
- **Image/Video AI:** fal.ai unified API (FLUX schnell $0.003/image, Sora 2, Veo 3, Kling 3, etc.)
- **Text AI:** OpenAI GPT-4o (scripts, analysis, titles, descriptions)
- **Voice AI:** ElevenLabs TTS
- **Music AI:** ElevenLabs Music (primary) + Mubert API (backup)
- **Video Processing:** FFmpeg + WhisperX on ECS Fargate
- **Face Detection:** MediaPipe (on server, free)
- **Stock Assets:** Pexels API (free, images+video) + Pixabay (supplemental, includes music/SFX) → Storyblocks API at scale (~$2K/month)
- **Billing:** Stripe — hybrid subscription + usage-based credits
- **CI/CD:** GitHub (dev workflow, push code)

## White-Label AI Strategy (IMPORTANT)
ALL AI is presented as our own engine. Users never see OpenAI, ElevenLabs, or fal.ai branding.
- NO "Bring Your Own API Key" — removed entirely
- All API costs baked into subscription pricing
- Platform manages all API keys via Admin Dashboard
- Admin sets usage limits per subscription tier
- The platform IS the AI as far as users are concerned
- Only exceptions: YouTube branding (required by their TOS) and Pexels attribution (required for free tier)

## Two Account Types
### Admin Account (Platform Owner)
- Manages all API keys (OpenAI, ElevenLabs, fal.ai, Pexels, Mubert, Stripe)
- Sets usage limits per subscription tier
- Views all user accounts and usage metrics
- Monitors API costs and usage across all services
- Platform-wide settings (default models, rate limits, feature flags)
- User management (search, view, suspend, upgrade)
- Revenue dashboard (Stripe)
- Model configuration (which fal.ai model by default, etc.)

### User Account (End Users)
- Creates channels, projects, generates content
- Sees only their own data
- Never sees API keys, service names, or backend details
- Subject to tier-based usage limits
- Manages their own YouTube/social media/Google Drive connections

## External Integrations
- **YouTube Data API v3** — Read channel info, analytics, comments, playlists, video data
- **YouTube Upload API** — Upload videos, manage metadata, thumbnails, playlists
- **Social Media APIs** — Instagram, TikTok, X/Twitter, Facebook (posting + scheduling) — **NOT in v1** (APIs are paid/restricted/hostile; deferred to v2 when revenue justifies cost and maintenance)
- **Google Drive API** — Export/backup final videos, thumbnails, scripts to user's Drive
- **Pexels API** — Free stock video + images (attribution required)
- **Pixabay API** — Free stock video + images + music + SFX (supplemental)
- **fal.ai API** — Image generation (FLUX, etc.), video generation (Sora 2, Veo 3, Kling 3)
- **OpenAI API** — GPT-4o for scripts, analysis, SEO, titles, descriptions, style generation
- **ElevenLabs API** — TTS voiceovers + music generation
- **Mubert API** — AI background music generation (backup to ElevenLabs)
- **Stripe API** — Subscriptions, usage billing, invoicing

## Phase 2 Integrations (Built but not connected at launch)

### Social Competitor Tracker — "Coming Soon" Feature
- **Purpose:** Track public Instagram + TikTok accounts, pull post metrics, calculate Nx Viral Multiplier, identify trending sounds/formats
- **Data Provider:** ScrapeCreators (primary, pay-as-you-go) or EnsembleData (growth phase)
- **Architecture:** Full UI, data pipeline, caching layer, and DynamoDB tables built at launch. Data provider API key NOT connected until revenue justifies it.
- **Abstraction layer:** "SocialDataProvider" interface — system talks to this, not directly to ScrapeCreators. Swap providers by changing one config.
- **Admin toggle:** Feature flag in Admin Dashboard. Flip on/off. Paste API key when ready.
- **User experience at launch:** Feature visible in UI with "Coming Soon" badge. Optional waitlist/notify button.
- **When activated:** Admin pastes API key → data starts flowing immediately → no code changes needed
- **Estimated cost when active:** ~$3-8/user/month at scale (shared data pool — same accounts tracked by multiple users only pulled once, cached in DynamoDB, refreshed daily)
- **Data cached per niche, not per user** — same cost optimization as GPT-4o caching

## API Scaling Confirmation (All verified)
- OpenAI: 1 org key serves all users. Tier 5 = 10K RPM / 30M TPM. No attribution.
- ElevenLabs: 1 key serves all users (OEM terms). Enterprise tier for SaaS. No attribution.
- fal.ai: 1 key serves all users. 40 concurrent tasks at $1K+. No attribution.
- YouTube: 1 project key. Must pass compliance audit for quota extension. Attribution required.
- Pexels: 1 key, unlimited requests with attribution. Free.
- Mubert: 1 key. Custom enterprise pricing. No attribution on Creator+.

## Cost at Scale — REVISED (1,000 users, month 12)

**Average user profile:** ~20 videos/month (mix of Starter through Agency tiers)
**Credit system controls costs** — users can't exceed their tier's credit cap

| Service | Monthly Cost | Per User | Notes |
|---------|-------------|----------|-------|
| ElevenLabs (voiceover + SFX) | ~$25,000-38,000 | ~$25-38 | Largest cost — voiceover is expensive |
| fal.ai (images + video clips) | ~$8,000-16,000 | ~$8-16 | Higher than original — includes video clips |
| OpenAI GPT-4o (scripts + AI) | ~$2,000-5,000 | ~$2-5 | Cached per niche, shared across users |
| Mubert (backup music) | ~$500-2,000 | ~$0.50-2 | Backup to ElevenLabs Music |
| S3 + CloudFront | ~$500-650 | ~$0.50-0.65 | Same as before |
| DynamoDB | ~$50-100 | ~$0.05-0.10 | Same as before |
| Lambda + Fargate | ~$500-1,500 | ~$0.50-1.50 | Higher — video rendering compute |
| YouTube API | $0 | $0 | Free (quota-constrained) |
| Pexels/Pixabay | $0 | $0 | Free |
| **Total** | **~$37,000-63,000** | **~$37-63** | |

**Average revenue per user (weighted across tiers): ~$118/month**
**Gross margin: ~47-69%**

## Cost Strategy
- GPT-4o caching per NICHE (not per user) — 100 users same niche = 1 call
- fal.ai pay-per-use (no subscription needed)
- S3 lifecycle policies: delete intermediate files after 30 days, archive after 90
- CloudFront CDN eliminates S3 egress fees
- YouTube API is free (quota-constrained, need audit for extension)
- Credit system naturally caps per-user costs — heavy users hit limits and upgrade
- ElevenLabs is the biggest cost driver — negotiate enterprise/OEM pricing at scale
- Most scenes should use still images with Ken Burns effects (cheap) — AI video clips are premium/expensive
- Annual plans improve cash flow and reduce churn
- See billing.md for full pricing tiers: $59-$399/month

## S3 Storage Strategy
- S3 Standard for active content (0-30 days): $0.023/GB
- S3 Standard-IA for published content (30-90 days): $0.0125/GB
- Glacier Instant Retrieval for old content (90-365 days): $0.004/GB
- Delete intermediate files after 30 days (images, audio, clips — all regenerable)
- Keep final rendered video + thumbnail long-term
- CloudFront CDN eliminates S3 egress fees
- Per-user cost: ~$0.50-0.70/month
- Google Drive integration for user-side backup/export

## S3 Cost Projections (month 12, optimized)
- 10 users: ~$6/month
- 100 users: ~$70/month
- 1,000 users: ~$500-650/month

## AWS Services
- Lambda: API endpoints, lightweight processing
- ECS Fargate: Heavy video processing (FFmpeg, WhisperX)
- S3: All file storage (videos, images, thumbnails, exports)
- CloudFront: CDN for media delivery (free tier → $15/month Pro)
- Cognito: Authentication + OAuth flows
- DynamoDB: All data storage
- Amplify: Frontend hosting + CI/CD
- Secrets Manager: Platform API keys storage
