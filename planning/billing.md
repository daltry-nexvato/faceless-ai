# Billing Module — Finalized Spec

## Pricing Philosophy
- Position as **mid-range premium** — more features than cheap tools ($29-49), way better value than TubeGen ($149-499)
- Credit-based system (shared pool, not per-category)
- We have MORE features than any competitor — justify the higher price vs budget tools
- Still dramatically undercut TubeGen on price-per-credit

---

## Pricing Tiers

| | **Starter** | **Creator** | **Pro** | **Agency** |
|---|---|---|---|---|
| **Price** | **$59/mo** | **$99/mo** | **$199/mo** | **$399/mo** |
| **Annual** | $49/mo ($588/yr) | $79/mo ($948/yr) | $169/mo ($2,028/yr) | $339/mo ($4,068/yr) |
| **Credits** | 50K | 125K | 300K | 750K |
| **Videos (~)** | ~46 | ~116 | ~280 | ~700 |
| **Channels** | 2 | 5 | 15 | Unlimited |
| **Styles** | 3 | 10 | 25 | Unlimited |
| **Voice Clones** | 1 | 5 | 15 | 30 |
| **Seats** | 1 | 1 | 3 | 10 |
| **Concurrent Projects** | 2 | 5 | 10 | 25 |
| **Niche Finder** | Yes | Yes | Yes | Yes |
| **AI Image Animation** | No | Yes | Yes | Yes |
| **Priority Rendering** | No | No | Yes | Yes |
| **Social Competitor Tracker** | No | Coming Soon | Coming Soon | Coming Soon |
| **API Access** | No | No | No | Yes |
| **Support** | Email | Email + Chat | Priority | Dedicated |

---

## Credit System

### How Credits Work
- All operations share one credit pool per month
- Credits reset monthly (no rollover in v1 — consider rollover as future perk)
- User sees remaining credits in the UI at all times
- Warning at 80% usage, hard stop at 100% with upgrade prompt
- Admin can grant bonus credits or adjust tier limits

### Credit Costs Per Operation

| Operation | Credits | Notes |
|---|---|---|
| **Script generation** | 10 credits per 100 words | ~150 credits for 10-min script (1,500 words) |
| **Voiceover generation** | 40 credits per minute | ~400 credits for 10-min voiceover |
| **Image generation (Draft)** | 5 credits | FLUX Schnell / FLUX.2 Dev Turbo |
| **Image generation (Standard)** | 15 credits | FLUX.2 Dev / Kontext Dev |
| **Image generation (Premium)** | 30 credits | FLUX.2 Pro / Pro Ultra |
| **Thumbnail generation** | 20 credits | Recraft V3/V4 + text overlay |
| **Image upscaling** | 5 credits | ESRGAN / AuraSR |
| **Inpainting/outpainting** | 15 credits | FLUX |
| **Background removal** | 5 credits | Bria RMBG |
| **Sound effect generation** | 10 credits | ElevenLabs SFX |
| **Music generation** | 50 credits per minute | ElevenLabs Music / Mubert |
| **AI video clip (Draft)** | 15 credits per second (e.g., 75 for 5s) | fal.ai video models — cheaper for iteration |
| **AI video clip (Standard/Premium)** | 30 credits per second (e.g., 150 for 5s) | fal.ai video models — highest quality |
| **Parallax depth map** | 5 credits per image | Marigold/Midas via fal.ai (Creator+ only) |
| **Voice design (create new)** | 50 credits | ElevenLabs Voice Design |
| **Research Board: Quick Analysis** | 50 credits | Save + analyze reference channel (10 thumbnails, 3 transcripts) |
| **Research Board: Deep Analysis** | 150 credits | Full 30 thumbnails, 10 transcripts, top/bottom 5, gaps |
| **Research Board: Cross-Comparison** | 30 credits | Comparative analysis across 3+ reference channels |
| **Research Board: Video Analysis** | 30 credits | Per saved video — transcript, thumbnail, hook breakdown |
| **Research Board: Manual Refresh** | 50 credits | Re-runs Quick Analysis with latest data |
| **Channel Builder: Deep History Analysis** | 100 credits | Optional deep analysis for channels with 50+ videos (caps at 200 thumbnails) |
| **Channel Builder: Dashboard Suggestion Refresh** | 20 credits | Manual refresh of AI topic/optimization suggestions |
| **Style: Generation (from references)** | 75 credits | GPT-4o analysis, blending, conflict detection, scoring |
| **Style: Regeneration** | 75 credits | Fresh generation from current references |
| **Style: Full AI Preview** | 15 credits | One AI-generated thumbnail + title + caption sample |
| **Style: Detection (connect-first)** | 0 credits | Absorbed in Channel Builder's free onboarding |
| **Style: Editing** | 0 credits | Always free |
| **Style: Template selection** | 0 credits | Always free |
| **Project: Batch topic outline** | 10 credits per outline | GPT-4o generates topic + scene structure (2-10 at a time) |
| **Project: Short-Form Variant** | 10 credits | GPT-4o analyzes long-form script, recommends Shorts excerpts |
| **Niche Finder search** | 5 credits | YouTube API + GPT-4o analysis |
| **Topic research** | 10 credits | GPT-4o deep research |
| **Script from outlier** | 20 credits | YouTube transcript + GPT-4o analysis |
| **NSFW check** | 0 credits | Always free (safety) |
| **Stock image search** | 0 credits | Always free (Pexels/Pixabay) |
| **User upload** | 0 credits | Always free |
| **External prompts** | 0 credits | Always free |

### Typical Video Credit Cost

**Standard 10-minute video (still images, no AI video clips):**
| Step | Credits |
|---|---|
| Script (1,500 words) | 150 |
| Voiceover (10 min) | 400 |
| Images (25 standard tier) | 375 |
| Thumbnail (3 variations) | 60 |
| Sound effects (5) | 50 |
| Music (10 min) | 500 |
| NSFW checks | 0 |
| **Total** | **~1,070 credits** |

**Premium 10-minute video (with AI video clips):**
| Step | Credits |
|---|---|
| Script (1,500 words) | 150 |
| Voiceover (10 min) | 400 |
| Images (15 premium) + video clips (5 x 5-sec) | 1,200 |
| Thumbnail (3 variations) | 60 |
| Sound effects (8) | 80 |
| Music (10 min) | 500 |
| NSFW checks | 0 |
| **Total** | **~2,390 credits** |

### Videos Per Tier (standard quality, no AI video clips)

| Tier | Credits | ~Videos/month | ~Videos/week |
|---|---|---|---|
| Starter (50K) | 50,000 | ~46 | ~11 |
| Creator (125K) | 125,000 | ~116 | ~29 |
| Pro (300K) | 300,000 | ~280 | ~70 |
| Agency (750K) | 750,000 | ~700 | ~175 |

---

## Comparison vs TubeGen AI (Our Main Competitor)

| | **TubeGen Starter** | **Our Starter** | **Difference** |
|---|---|---|---|
| Price | $149/mo | $59/mo | **We're 60% cheaper** |
| Credits | 33K | 50K | **We give 52% more** |
| Videos (~) | ~30 | ~46 | **We give 53% more** |
| Channels | ? | 2 | — |
| Styles | 2 | 3 | More |
| Voice Clones | 0 | 1 | We include one |
| Niche Finder | Yes | Yes | Same |
| AI Animation | No | No | Same |

| | **TubeGen Pro** | **Our Creator** | **Difference** |
|---|---|---|---|
| Price | $499/mo | $99/mo | **We're 80% cheaper** |
| Credits | 140K | 125K | Similar |
| Videos (~) | ~130 | ~116 | Similar |
| Seats | 2 | 1 | They have more |
| Voice Clones | 3 | 5 | **We give more** |
| AI Animation | Yes | Yes | Same |

**Bottom line:** We deliver similar or better value at 60-80% lower prices than TubeGen.

---

## Our Cost Per Tier (What It Costs Us to Deliver)

Based on realistic usage (users don't max out all categories):

### Starter ($59/mo) — Realistic: ~15 videos/month
| Cost Component | Monthly |
|---|---|
| Voiceover (ElevenLabs) | ~$18-27 |
| Images (fal.ai) | ~$6-11 |
| Scripts (GPT-4o) | ~$1-3 |
| Music (ElevenLabs/Mubert) | ~$3-5 |
| Infrastructure (S3, Lambda, DynamoDB) | ~$2-3 |
| **Total cost** | **~$30-49** |
| **Gross profit** | **~$10-29** |
| **Gross margin** | **~17-49%** |

### Creator ($99/mo) — Realistic: ~25 videos/month
| Cost Component | Monthly |
|---|---|
| Voiceover | ~$30-45 |
| Images | ~$10-19 |
| Scripts | ~$2-5 |
| Music | ~$5-8 |
| Infrastructure | ~$3-5 |
| **Total cost** | **~$50-82** |
| **Gross profit** | **~$17-49** |
| **Gross margin** | **~17-50%** |

### Pro ($199/mo) — Realistic: ~40 videos/month
| Cost Component | Monthly |
|---|---|
| Voiceover | ~$48-72 |
| Images | ~$16-30 |
| Scripts | ~$3-8 |
| Music | ~$8-12 |
| Video clips (some) | ~$5-15 |
| Infrastructure | ~$5-8 |
| **Total cost** | **~$85-145** |
| **Gross profit** | **~$54-114** |
| **Gross margin** | **~27-57%** |

### Agency ($399/mo) — Realistic: ~80 videos/month
| Cost Component | Monthly |
|---|---|
| Voiceover | ~$96-144 |
| Images | ~$32-60 |
| Scripts | ~$6-16 |
| Music | ~$16-24 |
| Video clips (more) | ~$10-30 |
| Infrastructure | ~$8-15 |
| **Total cost** | **~$168-289** |
| **Gross profit** | **~$110-231** |
| **Gross margin** | **~28-58%** |

### Key Margin Insight
- Heavy users compress margins to ~17-27%
- Average users give us ~40-58% margins
- The credit system naturally limits extreme usage — heavy users hit their cap and upgrade
- Annual plans improve cash flow and reduce churn

---

## Stripe Implementation

### Subscription Model
- Stripe Subscriptions for recurring billing
- Monthly and Annual billing cycles
- Annual = ~15% discount (incentivizes commitment)
- Prorated upgrades mid-cycle
- No prorated downgrades (downgrades take effect next billing cycle)

### Credit Tracking
- Credits tracked in DynamoDB (not Stripe — Stripe handles payment only)
- Credit balance decremented in real-time as operations execute
- If operation fails, credits refunded automatically
- Admin can view and adjust any user's credit balance

### Trial / Free Tier
- **7-day free trial** on Starter tier (no credit card required)
- Limited to 5,000 credits during trial (~4-5 videos)
- Watermark on generated videos during trial
- Full features unlocked — just limited credits
- Convert to paid to remove watermark and get full credits

### Upgrade/Downgrade Flow
- Upgrade: immediate, prorated charge, credits adjusted
- Downgrade: takes effect at next billing cycle
- Cancel: access until end of current billing period, then frozen (data kept 90 days)
- Reactivate: restores everything within 90 days

### Overage Handling
- No automatic overage charges (avoids surprise bills)
- When credits hit 0: operations blocked with friendly message
- "Buy more credits" option: 10K credits for $15 (one-time)
- Or upgrade tier prompt
- Admin can grant bonus credits (for support cases, promotions)

---

## Revenue Projections

### At 100 Users (Month 6)
| Tier | Users | MRR |
|---|---|---|
| Starter | 40 | $2,360 |
| Creator | 35 | $3,465 |
| Pro | 20 | $3,980 |
| Agency | 5 | $1,995 |
| **Total** | **100** | **$11,800/mo** |

Estimated costs at 100 users: ~$5,500-8,000/month
**Net margin: ~32-53%**

### At 1,000 Users (Month 12)
| Tier | Users | MRR |
|---|---|---|
| Starter | 400 | $23,600 |
| Creator | 350 | $34,650 |
| Pro | 200 | $39,800 |
| Agency | 50 | $19,950 |
| **Total** | **1,000** | **$118,000/mo** |

Estimated costs at 1,000 users: ~$55,000-80,000/month
**Net margin: ~32-53%**

---

## Admin Account — Full Access, No Paywall

The main admin account (platform owner) gets full unrestricted access:
- **All features unlocked** — every feature across all tiers, including AI video clips, voice cloning, priority rendering, API access, etc.
- **No credit limits** — unlimited generation across all modules (scripts, voiceovers, images, video clips, music, thumbnails, everything)
- **No tier gating** — treated as above-Agency for every feature check
- **No billing** — no Stripe subscription, no credit tracking, no usage caps, no overage prompts
- **Same UI as consumers** — admin sees the exact same platform interface, same workflow, same tools. No separate "admin-only editor." This also serves as live testing of the real user experience.
- **Implementation:** Every credit check and tier gate includes an `isAdmin` bypass. If `account.role === 'admin'` → skip credit deduction, skip tier check, allow operation.
- **Multiple admin accounts supported** (platform owner can designate co-admins if needed in the future, but v1 is single admin)
- Admin can still access the Admin Dashboard for user management, analytics, and system monitoring — this is separate from the consumer-facing UI

---

## Dependencies
- **Stripe API** for payment processing
- **DynamoDB** for credit tracking and usage history
- **Admin Dashboard** for tier management, credit adjustments, revenue analytics
- **All modules** report credit costs to a central "Credit Ledger" service
- **UI** shows credit balance in top bar, usage breakdown in settings

---

## Billing-Related Platform Decisions

### Watermark on Free Trial
- Small "Made with [Platform Name]" watermark on bottom-right of video
- Removed on any paid tier
- Serves as free marketing when trial users share videos

### Feature Gating by Tier
| Feature | Starter | Creator | Pro | Agency |
|---|---|---|---|---|
| AI Image Animation | No | Yes | Yes | Yes |
| Priority Rendering | No | No | Yes | Yes |
| Social Competitor Tracker | No | Coming Soon | Coming Soon | Coming Soon |
| API Access | No | No | No | Yes |
| Team Seats | 1 | 1 | 3 | 10 |
| Voice Clones | 1 | 5 | 15 | 30 |
| Channels | 2 | 5 | 15 | Unlimited |
| Styles | 3 | 10 | 25 | Unlimited |
| Concurrent Projects | 2 | 5 | 10 | 25 |

### What's Always Free (No Credits)
- Stock image/video search (Pexels/Pixabay)
- User uploads
- External prompt generation
- NSFW safety checks
- Basic analytics viewing
- Media Library browsing
- Style editing (not generation)
