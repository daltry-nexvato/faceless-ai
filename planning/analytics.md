# Analytics Module — Finalized Spec

## What This Module Does

Analytics takes the YouTube data that Channel Builder pulls and turns it into actionable dashboards, insights, and recommendations. It's where raw numbers become strategy.

**Responsibilities:**
- Channel-level analytics dashboards (inside the channel workspace)
- Per-video performance breakdowns
- AI-powered performance insights (separate from Channel Builder's topic suggestions)
- Cross-channel overview on the global Overview dashboard
- Comment sentiment analysis
- Niche comparison using publicly available metrics
- Performance trends and growth tracking
- Feeding performance data to other modules (Style evolution, publishing optimization)
- Analytics export (CSV + PDF)

**What it does NOT do:** Pull data from YouTube (Channel Builder's sync handles that), generate AI topic suggestions (Channel Builder's dashboard handles that), or track competitor channels in detail (Research Board handles that). Analytics reads the data other modules collect and presents it meaningfully.

**Requires:** CONNECTED channel with YouTube data. DRAFT channels see an empty state.

---

## Channel Analytics Dashboard

Located in the channel workspace sidebar under "Analytics." This is the primary analytics experience.

### Overview Tab

**Time Range Selector:** Last 7 days / 28 days / 90 days / 12 months / Lifetime / Custom range. Default: 28 days. Persists per session.

**Key Metrics Cards (top row):**

| Metric | Display | Source |
|---|---|---|
| Subscribers | Current count + net change in period + trend arrow | YouTube API |
| Views | Total in period + daily average + trend | YouTube API |
| Watch Time (hours) | Total in period + per-video average + trend | YouTube Analytics API |
| CTR (Click-Through Rate) | Average in period + trend | YouTube Analytics API |
| Average View Duration | In period + as % of video length + trend | YouTube Analytics API |

Each card shows: current value, change vs. previous period (e.g., "+12% vs previous 28 days"), and a sparkline mini-chart.

**Revenue card:** Hidden by default. Only shown if the user has opted into revenue analytics (see Revenue Data section below). Not all channels are monetized — don't show $0 misleadingly.

**Views Over Time Chart:**
- Line chart showing daily views across the selected period
- Overlay option: subscriber growth on same chart (dual Y-axis)
- Hover on any day: tooltip with exact numbers
- Click on a day: filters the video list below to videos published that day

**Top Performing Videos (in period):**
- Top 5 videos by views, sortable by: views, watch time, CTR, retention
- Each shows: thumbnail, title, publish date, views, CTR, avg view duration, retention %
- "View all" link goes to the Videos tab

**Audience Demographics:**
- Age/gender breakdown (bar chart)
- Top countries (horizontal bars)
- Device breakdown (desktop/mobile/tablet/TV — pie chart)
- Traffic sources (YouTube search, suggested, browse, external, direct — bar chart)

---

### Videos Tab

**Complete video performance list:**
- All published videos from this channel, sortable by any metric
- Default sort: newest first
- Columns: thumbnail, title, publish date, views, likes, comments, CTR, avg view duration, retention %
- Filter by: date range, format (Long-Form / Shorts), performance tier (top 25% / average / bottom 25%)
- Search by title

**Per-Video Detail (click to expand or dedicated page):**
- Full metrics: views, unique viewers, likes, dislikes, comments, shares, subscribers gained, subscribers lost
- Retention curve: audience retention graph showing exactly where viewers drop off (data from YouTube Analytics API `elapsedVideoTimeRatio` dimension)
- Traffic sources for this specific video
- Impressions and CTR over time (first 48 hours, first week, lifetime)
- End screen performance (if end screens were used): clicks, click rate per element
- Cards performance (if cards were used)
- "Created with [Platform Name]" badge if the video was published through our platform (linked to the project record)

---

### Shorts Tab

Separate analytics view for Shorts content. YouTube handles Shorts metrics differently from long-form.

**Available Shorts Metrics:**

| Metric | Available? | Notes |
|---|---|---|
| Views | Yes | Counts differently — scroll-past counts as a view |
| Likes | Yes | Same as long-form |
| Comments | Yes | Same as long-form |
| Shares | Yes | Important for Shorts virality |
| Average watch percentage | Yes | Key Shorts metric — did they watch to the end? |
| Impressions | Yes | From Shorts shelf, not search/browse |
| Reach (Shorts feed) | Yes | How many times shown in the Shorts feed |
| Audience retention curve | No | Not available for Shorts via API |
| CTR | Limited | Available but less meaningful for Shorts |
| Traffic sources | Partial | Different categories (Shorts feed, search, channel page) |
| Demographics | Yes | Same as long-form |
| Revenue | Yes (if monetized) | Shorts ad revenue share |

**Shorts Tab Layout:**

**Key metrics cards:**
- Total Shorts views (in period)
- Average watch percentage (most important Shorts metric)
- Total shares
- Shorts published in period

**Performance list:**
- All Shorts sorted by views (default)
- Columns: thumbnail, title, publish date, views, avg watch %, likes, comments, shares
- No retention curve column (not available for Shorts)

**Shorts vs. Long-Form comparison card:**
- "Your Shorts average X views, your long-form averages Y views"
- "Shorts get Z% more shares but W% fewer comments"
- Simple side-by-side summary

**AI Insights for Shorts:** Analyzed separately from long-form in the weekly insights job with Shorts-specific observations.

---

### AI Insights Tab

AI-generated performance observations about the channel. Generated by a dedicated weekly background job (separate from Channel Builder's topic suggestions).

**Insight Categories:**
- **What's Working:** "Videos with question-style titles get 2.3x more views than statement titles"
- **What's Not Working:** "Your CTR has dropped 15% in the last 30 days — your recent thumbnails may be less attention-grabbing"
- **Content Gaps:** "You haven't posted about [topic] in 3 months, but it's trending in your niche"
- **Timing Insights:** "Your audience is most active on Tuesdays and Thursdays between 2-6 PM"
- **Growth Analysis:** "At your current growth rate, you'll hit 10K subscribers in approximately 4 months"
- **Retention Patterns:** "Viewers drop off most at the 2-minute mark — consider stronger hooks or shorter intros"

**Private metric benchmarks:** When referencing metrics we don't have competitor data for (CTR, retention, watch time), insights are framed as general guidance, not measured comparisons:
- **Good:** "Based on general YouTube patterns, True Crime channels typically see 35-45% retention. Your 42% is in a healthy range."
- **Never:** Presenting benchmark numbers in comparison tables or stat cards as if we measured them from this specific niche.

**Generation:** Weekly background job using GPT-4o analyzing the channel's own YouTube analytics data. Stored in DynamoDB. The page reads from cache — never calls GPT-4o on page load.

**Manual Refresh:** "Refresh insights" button — 20 credits, independent 1-hour cooldown per channel. Does NOT share cooldown with Channel Builder's suggestion refresh (they're different features on different pages).

---

### Comments Tab

**Comment Feed:**
- Latest comments across all videos, newest first
- Each shows: commenter name, comment text, video title, timestamp, like count
- Filter: All / Positive / Negative / Questions / Spam
- Search comments by keyword

**Sentiment Analysis:**
- Overall sentiment score: Positive / Neutral / Negative percentage breakdown
- Sentiment over time chart (is the audience getting happier/angrier?)
- Word cloud of most common words in comments
- "Common complaints" summary (AI-generated): "Multiple viewers mention audio quality issues"
- "Common praise" summary: "Viewers frequently praise your research depth"

**How Sentiment Works:**

*On initial channel connection:*
- Analyze most recent **500 comments** (not full history — diminishing value for old comments)
- Batched into groups of 50 for GPT-4o classification (10 API calls)
- Cost: ~$0.10-0.30 total, absorbed as platform operating cost
- Older comments beyond the 500: not sentiment-classified, still visible in the Comments tab

*On every comment sync (every 12 hours):*
- Analyze only **NEW comments** since the last sync
- Each comment gets a classification: positive / neutral / negative / question / spam
- Classification stored in DynamoDB alongside the comment record (never re-analyzed)
- Aggregate sentiment percentages recomputed from stored classifications (simple count query, no AI)

*Ongoing cost:*
- Average channel: 10-50 new comments per 12-hour window
- One GPT-4o call per sync: ~$0.01-0.03
- At 1,000 users: ~$20-60/month — negligible, absorbed as platform operating cost

---

## Cross-Channel Analytics (Global Overview Dashboard)

Cross-channel analytics lives on the **existing global Overview page** (defined in ui-flow.md). There is no separate cross-channel analytics page — the Overview IS the cross-channel view.

### Overview Page Structure

**Time Range Selector** at top — affects all stats and trends below.

**Top section: Aggregate stats cards**
- Total subscribers across all connected channels + net change in period
- Total views in period across all channels + trend
- Total videos published in period
- Top performing video across all channels (with channel name + link)

**Middle section: Channel cards**
- One card per CONNECTED channel: avatar, name, subs, views in period, growth trend
- Color-coded trend indicators: green (growing), yellow (flat), red (declining)
- Click to enter channel workspace
- DRAFT channels shown separately below with "Connect YouTube" prompt
- "+ Add Channel" card always visible

**Bottom section: Activity + Insights**
- Recent activity feed (publishes, milestones, alerts across all channels)
- Cross-channel AI insights: "Your True Crime channel is outperforming your Finance channel by 3x on views — consider allocating more content there"
- Upcoming content calendar widget (from projects-wizard.md — global "Upcoming" view)

---

## Niche Comparison

Compares the channel's performance against its niche using **publicly available metrics only**. Private metrics (CTR, retention, watch time) are only available for the user's own channel — YouTube doesn't expose them for competitors.

### What We Can Compare (Public Data)

| Metric | Your Channel | Niche Average | How We Get Niche Average |
|---|---|---|---|
| Avg views per video | 5,200 | 8,400 | Public data from reference channels in Research Board |
| Subscriber growth rate | +120/month | +250/month | Snapshot subscriber counts from periodic Research Board sync |
| Upload frequency | 2/week | 3/week | Public data (video publish dates) |
| Engagement rate (likes+comments / views) | 4.2% | 3.8% | Public data |
| Avg video length | 11 min | 14 min | Public data (video durations) |

### What We Can NOT Compare (Private Data)
CTR, retention %, watch time, traffic sources, demographics — these are shown on the user's own analytics page but never in comparison tables (we can't get them for competitors).

### Where Niche Averages Come From
- **Reference channels** saved in the Research Board — analyzed and synced periodically
- **Niche Finder search results** — aggregate public data from channels in the same niche, cached per niche in DynamoDB
- Refreshed monthly

### AI Niche Position Summary
- "Your channel is in the **top 30%** of True Crime channels for viewer engagement, but **bottom 40%** for upload frequency. The biggest opportunity is publishing more consistently."
- Generated monthly alongside niche health alerts
- Part of the Analytics weekly insights job

---

## Revenue Data — Opt-In with Incremental OAuth Scope

Revenue analytics requires a separate YouTube OAuth scope (`yt-analytics-monetary.readonly`). This is NOT requested during initial OAuth to avoid adding friction to the consent screen.

### How It Works
1. Channel connects normally (standard YouTube scopes — no monetary)
2. If the channel is detected as monetized (YouTube API returns monetization status): show a prompt on the Analytics page: "This channel is monetized. Enable revenue analytics?"
3. User clicks "Enable Revenue Analytics" → triggers a supplemental OAuth flow requesting the monetary scope in addition to existing scopes
4. Google shows only the new permission (existing permissions already granted)
5. Revenue card appears on the Analytics Overview from that point forward
6. Revenue data synced daily alongside other analytics

### If Not Enabled
No revenue data shown anywhere. No impact on any other feature. Revenue card simply doesn't appear.

### Revenue Metrics (when enabled)
- Estimated revenue in period
- Revenue per video (in the Videos tab, extra column)
- Revenue trend chart
- RPM (revenue per thousand views)

---

## Data Feeding to Other Modules

Analytics provides data that other modules consume:

### Style Evolution (→ Style System)
- After 5+ published videos with analytics data: Analytics flags performance patterns
- "Videos with bright thumbnails get 40% higher CTR" → Style System proposes thumbnail color adjustment
- "Shorter intros (under 15 seconds) retain 25% more viewers" → Style System proposes intro structure change
- Monthly check requires 3+ new videos since last check
- Confidence levels: Low (5-9 videos), Medium (10-19), High (20+)
- Analytics provides the DATA, Style System decides what to SUGGEST

### Publishing Optimization (→ Publishing)
- Best posting times: calculated from historical view velocity data
- "Schedule for Tuesday at 3 PM — your audience is most active then"
- Passed to the Publishing step as a recommended schedule time

### Research Board Context (→ Research Board)
- When analyzing reference channels, Analytics provides the user's own public metrics for comparison
- "This reference channel gets 3x your views but has similar engagement — their advantage is upload frequency"

### Channel Builder Dashboard (→ Channel Builder)
- Performance data feeds the weekly topic suggestions: "Videos about [topic] consistently outperform — consider making more"
- Underperforming patterns feed optimization suggestions

---

## Two Separate Weekly AI Jobs

Analytics and Channel Builder each have their own weekly background job per channel:

### Job 1: Channel Builder Dashboard Suggestions
- **Generates:** Topic suggestions, style optimization tips, niche health alerts, research board monitoring alerts
- **Focus:** "What should you make next?"
- **Output:** Stored in DynamoDB, rendered on the channel dashboard
- **Manual refresh:** 20 credits, 1-hour cooldown (independent from Job 2)

### Job 2: Analytics Performance Insights
- **Generates:** Performance patterns, timing insights, growth analysis, retention observations, content gap identification
- **Focus:** "How are you doing and why?"
- **Input:** Channel's own YouTube analytics data (CTR, retention, traffic sources, engagement trends)
- **Output:** Stored in DynamoDB, rendered on Analytics → AI Insights tab
- **Manual refresh:** 20 credits, 1-hour cooldown (independent from Job 1)

**Why separate:** Different input data, different output format, different purpose. Separating them makes each GPT-4o prompt focused and produces better results.

**Cost at 1,000 users:** 2 calls per channel per week = 2,000 calls/week. ~$0.02-0.05 per call = ~$160-400/month. Platform operating cost, not charged to users.

---

## Analytics Data Storage

### Per-Video Current Record
- One DynamoDB record per video, updated on every sync
- Contains: latest views, likes, comments, duration, publish date, title, thumbnail URL, sentiment summary
- Replaces itself on each update — always reflects most recent sync

### Daily Snapshot Table (for Trends)
- One record per video per day, created on each daily sync
- Contains: date, views, likes, comments (delta metrics needed for trend charts)
- Powers "views over time" charts and growth calculations

### Channel-Level Aggregate Records
- One record per channel per day: total views, total subs, total watch time
- Used for the Overview dashboard and cross-channel comparison
- Same retention policy as video snapshots

### Retention Policy
- **Daily granularity:** Kept for 90 days
- **After 90 days:** Aggregated to weekly buckets (one record per video per week)
- **After 1 year:** Aggregated to monthly buckets
- Aggregation handled by a scheduled Lambda job (runs weekly)

### Volume Estimate (1,000 users, month 12)
- Current video records: ~100,000 records (tiny — one per video)
- Daily snapshots: ~9,000,000 records (100K videos × 90 days)
- Each record ~500 bytes → ~4.5 GB
- DynamoDB cost: ~$1.13/month at on-demand pricing
- After aggregation: growth rate slows significantly

---

## YouTube API Data Mapping

### YouTube Data API v3 (Public Data)
- `statistics.subscriberCount` → Subscriber count
- `statistics.viewCount` → Total views (lifetime)
- `statistics.videoCount` → Total videos
- `contentDetails.duration` → Video duration
- `snippet.publishedAt` → Publish date
- `snippet.title`, `snippet.thumbnails` → Title, thumbnail

### YouTube Analytics API (Private Data — Channel Owner Only)
- `views`, `estimatedMinutesWatched` → Watch time
- `averageViewDuration` → Avg view duration
- `averageViewPercentage` → Retention %
- `likes`, `dislikes`, `shares`, `comments` → Engagement
- `subscribersGained`, `subscribersLost` → Sub changes
- `annotationClickThroughRate` → End screen/card clicks
- `insightTrafficSourceType` → Traffic sources
- `ageGroup`, `gender` → Demographics
- `country` → Geographic data
- `deviceType` → Device breakdown
- `cardClickRate`, `endScreenElementClickRate` → Cards/end screen performance

### YouTube Analytics Monetary API (Opt-In)
- `estimatedRevenue` → Revenue
- `estimatedAdRevenue` → Ad revenue specifically
- `estimatedRedPartnerRevenue` → Premium revenue
- `grossRevenue` → Gross revenue before YouTube's cut

### Analytics API Quota Note
- YouTube Analytics API is a SEPARATE quota from YouTube Data API
- Requires additional OAuth scope: `https://www.googleapis.com/auth/yt-analytics.readonly`
- This scope is requested during the YouTube OAuth flow (Channel Builder includes it in the initial scope set)
- Monetary scope (`yt-analytics-monetary.readonly`) is NOT included initially — added via supplemental OAuth only when user opts in
- Daily analytics refresh is one API call per channel — very cheap on quota

---

## First-Time Analytics Sync

When a channel is first connected, analytics data loads progressively:

### Immediately Available (within seconds)
- Video list with basic stats (views, likes, comments) — from YouTube Data API
- Subscriber count and video count
- Publishing frequency

### Available Within 1-5 Minutes (background job)
- CTR and retention data per video
- Traffic sources
- Demographics
- Watch time data
- Comment sentiment (for most recent 500 comments)

### What the User Sees During the Gap
- Analytics page shows available data immediately
- Progress banner: "We're importing your detailed analytics. Basic stats are ready now — CTR, retention, and audience data will appear in a few minutes."
- Sections still loading show skeleton placeholders (gray shimmer bars)
- When background job completes: banner updates to "All analytics loaded" and data fills in via WebSocket push (no page refresh needed)
- If user navigates away and comes back: data is there (job runs server-side)

### Large Channels (500+ videos)
- Pull most recent 90 days of detailed analytics first (prioritize recent data)
- Historical data beyond 90 days: pulled over the next few daily sync cycles
- Banner: "Detailed analytics for the last 90 days are ready. Historical data is being imported and will be complete within a few days."

---

## Analytics Export

### CSV Export
- Button at the top of each tab (Overview, Videos, Shorts, Comments)
- Downloads a CSV with the currently displayed data and selected time range
- Videos tab CSV: one row per video with all metrics columns
- Comments tab CSV: one row per comment with sentiment classification
- Overview CSV: daily aggregate data for the selected period
- **Free, no credits** — it's the user's own data

### PDF Channel Report
- "Generate Report" button on the Analytics Overview
- Produces a branded PDF (our platform branding, white-labeled) with:
  - Channel summary (name, subs, total views)
  - Key metrics for the selected period with trend charts
  - Top 10 and bottom 5 videos
  - Audience demographics summary
  - AI Insights summary (latest generated insights, if available — omitted if insights haven't been generated yet)
  - Niche comparison snapshot
- Formatted for sharing with sponsors, partners, or team members
- Generated server-side (Lambda), takes ~30 seconds
- **Free, no credits**
- Also exportable to Google Drive (if connected)

No recurring/scheduled report generation in v1. Manual only.

---

## Empty States

| State | What Shows |
|---|---|
| DRAFT channel (no YouTube) | Single card: "Connect YouTube to unlock analytics. Your channel's performance data will appear here." |
| CONNECTED but 0 videos | "No videos found on this YouTube channel yet. Publish your first video to start seeing analytics." |
| CONNECTED but <5 videos | Full analytics shown, but AI Insights tab shows: "We need at least 5 published videos to generate meaningful insights. Keep publishing!" |
| CONNECTED, first sync in progress | Progressive loading with skeleton placeholders and progress banner (see First-Time Sync section) |
| DISCONNECTED | Analytics frozen at last sync. Banner: "Analytics paused — showing data from [last sync date]. Reconnect YouTube to resume." |

---

## Error Handling

| Scenario | User Sees |
|---|---|
| Analytics API quota exceeded | "Analytics data is temporarily unavailable. We'll retry shortly." Shows data from last successful sync. |
| YouTube Analytics scope not granted | "We need additional permissions to show analytics. Click here to re-authorize." |
| Sync failed for 24+ hours | Banner: "Analytics data may be outdated (last updated: [date]). We're working on refreshing it." |
| Revenue data unavailable (not monetized) | Revenue card hidden entirely |
| Revenue scope not granted (monetized channel) | Prompt: "This channel is monetized. Enable revenue analytics?" |
| Channel is DISCONNECTED | Analytics frozen. Banner with reconnect prompt. |
| PDF generation fails | "Report generation failed. Try again in a few minutes." |
| Google Drive export of report fails | "Export to Google Drive failed. Download the PDF instead." |

---

## Credit Costs (Analytics Module)

| Operation | Credits | Notes |
|---|---|---|
| Viewing analytics dashboards | Free | Core value, never gated |
| AI Performance Insights (weekly) | Free | Platform operating cost |
| Comment sentiment analysis | Free | Platform operating cost |
| Niche comparison (monthly) | Free | Platform operating cost |
| Manual insight refresh | 20 credits | Independent 1-hour cooldown per channel |
| CSV export | Free | User's own data |
| PDF channel report | Free | User's own data |
| Revenue analytics opt-in | Free | Just an OAuth scope addition |

---

## Connection to Other Modules

| Module | How Analytics Connects |
|---|---|
| **Channel Builder** | Reads YouTube data from Channel Builder's sync. Separate weekly AI job from dashboard suggestions (independent cooldowns, independent refresh). |
| **Style System** | Feeds performance patterns for Style evolution suggestions (after 5+ videos, confidence levels). |
| **Research Board** | Uses reference channel public data for niche comparison. Provides user's own metrics for cross-reference. |
| **Publishing** | Provides best posting times for schedule recommendations. |
| **Niche Finder** | Uses niche aggregate data (cached per niche) for niche comparison feature. |
| **Projects/Wizard** | Published-through-platform videos linked back to project records ("Created with [Platform Name]" badge). |
| **Notifications** | Channel milestones (subscriber goals, viral videos) trigger notifications. |
| **Settings** | Google Drive export for PDF reports. |
