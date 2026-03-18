# Channel Builder Module — Finalized Spec

## What This Module Does

The Channel Builder handles creating, configuring, and managing channels — the "home base" where a channel comes to life before any videos get made.

**Responsibilities:**
- Creating new channels (all paths: plan-first, connect-first, from Niche Finder)
- Configuring channel settings (name, niche, defaults)
- Managing the YouTube connection for a channel
- Assigning social media accounts to a channel
- The channel workspace dashboard (home screen inside a channel)
- Channel lifecycle (archive, delete, duplicate)
- First-time user onboarding
- Existing channel analysis (connect-first path)

**What it does NOT do:** Style generation (Style System), project creation (Projects/Wizard), deep reference analysis (Research Board). Channel Builder sets up the container — other modules fill it.

---

## Channel Creation — Three Paths

### Path 1: "Plan First" (DRAFT Channel)
1. User clicks "+ Add Channel"
2. Picks "Plan First (connect later)"
3. Enters a working name (e.g., "My True Crime Channel") — can change later
4. Optionally picks a niche from Niche Finder results or types one manually
5. DRAFT channel created — user lands in the channel workspace
6. Guided prompt: "Start by finding reference channels in the Niche Finder, then save them to your Research Board"
7. After 1+ reference channels saved: "Ready to generate your channel Style?" prompt appears
8. Style generated (Style System handles this)
9. Channel is now ready for projects — but can't publish until YouTube is connected
10. Persistent "Connect YouTube to publish" banner in workspace until connected

### Path 2: "Connect First" (CONNECTED Channel)
1. User clicks "+ Add Channel"
2. Picks "Connect YouTube Channel"
3. OAuth flow with Google, user selects which YouTube channel
4. System pulls: channel name, avatar, banner, subscriber count, video count, video data
5. AI analyzes existing content using sampling strategy (see Existing Channel Analysis below)
6. AI auto-detects niche: "This looks like a True Crime channel. Is that right?" — user confirms or changes
7. AI auto-generates Style from existing content patterns
8. User reviews Style: "Here's what we detected. Keep it or customize?"
9. CONNECTED channel created — full functionality from day one
10. Historical analytics immediately available

### Path 3: From Niche Finder ("Create Channel From This")
1. User is browsing Niche Finder results (global, not inside a channel)
2. Finds a promising niche, clicks "Create Channel From This"
3. DRAFT channel created with niche pre-filled
4. Reference channels from the Niche Finder search auto-saved to the new channel's Research Board
5. Guided into Style generation
6. Shortcut path — skips the "what niche?" question since they already answered it

---

## Channel Status Model

### Connection Statuses (one of)

| Status | Meaning |
|---|---|
| **DRAFT** | No YouTube connected. Planning mode. Can create projects (if Style exists), can't publish. |
| **CONNECTED** | YouTube linked and healthy. Full functionality. |
| **DISCONNECTED** | Was connected, now broken. OAuth revoked, token expired, or user manually disconnected. Historical data preserved. Can't publish or sync. |
| **SUSPENDED** | Admin suspended the channel (policy violation, abuse). All operations frozen. User sees "Contact support." |

### Lifecycle Flags (independent booleans)

These are separate from connection status. A CONNECTED channel can be Archived. A DRAFT channel can be Pending Delete. They are NOT mutually exclusive with the connection status.

- **`isArchived`** — Channel hidden from dashboard, operations frozen, restorable
- **`isPendingDelete`** — 30-day countdown running, channel frozen

A channel's full state is the combination: e.g., "CONNECTED + Archived" or "DRAFT + Pending Delete."

### Valid State Transitions (Connection Status)

| From | To | Trigger |
|---|---|---|
| DRAFT | CONNECTED | User completes YouTube OAuth |
| CONNECTED | DISCONNECTED | Token revoked, manual disconnect, or admin revokes |
| DISCONNECTED | CONNECTED | User re-authorizes YouTube OAuth |
| DRAFT | SUSPENDED | Admin action |
| CONNECTED | SUSPENDED | Admin action |
| DISCONNECTED | SUSPENDED | Admin action |
| SUSPENDED | Previous state | Admin unsuspends (reverts to state before suspension) |

### Invalid Transitions
- DRAFT to DISCONNECTED (can't disconnect what was never connected)
- SUSPENDED to anything (only admin can change SUSPENDED state)
- User cannot archive or delete a SUSPENDED channel — only admin can

### Lifecycle Flag Rules
- Any active connection status can toggle `isArchived` (except SUSPENDED)
- Any connection status can toggle `isPendingDelete` (except SUSPENDED)
- Archived channels: hidden, operations frozen, restorable at any time
- Pending Delete: 30-day countdown, channel frozen, can be restored within 30 days

### Channel Limits by Tier
- DRAFT and CONNECTED count toward tier limits
- DISCONNECTED counts toward tier limits
- SUSPENDED does NOT count (platform's fault, not user's)
- Archived does NOT count toward tier limits

| | Starter | Creator | Pro | Agency |
|---|---|---|---|---|
| Channels | 2 | 5 | 15 | Unlimited |
| Projects per channel | Unlimited | Unlimited | Unlimited | Unlimited |

When user hits limit: "You've reached your plan's limit of X channels. Upgrade to [next tier] for up to Y channels, or archive an existing channel to free up a slot."

---

## Draft-to-Connected Transition (Style Reconciliation)

When a DRAFT channel connects to a YouTube channel that already has content, a Style Reconciliation step runs:

1. AI detects the Style from the existing YouTube content (same sampling analysis as connect-first path)
2. User sees a side-by-side comparison: **"Your Current Style" vs "Detected from YouTube"**
3. Three options:
   - **Keep current** — "I built this Style for a reason, my YouTube channel is changing direction"
   - **Switch to detected** — "Match what I'm already doing on YouTube"
   - **Blend both** — AI merges the two Styles into one (same blending logic as reference channel Style generation), user reviews and tweaks the result
4. If the YouTube channel has 0 videos: skip detection, keep current Style, no reconciliation needed

### Niche Mismatch Detection
- If the connected YouTube channel appears to be in a different niche than the DRAFT channel's niche:
- Warning: "Your planned niche is True Crime, but this YouTube channel appears to be about Finance. Would you like to update your niche?"
- User picks: keep planned niche, switch to detected niche, or ignore

### Existing Projects
- All DRAFT projects automatically gain publishing capability (YouTube connection is at channel level)
- No changes to project content needed — they just unlock the "Publish" step
- Projects mid-wizard continue as-is with no interruption

### Credit Cost
- Style reconciliation analysis is **free** (one-time setup cost, same as connect-first analysis)

---

## Existing Channel Analysis (Connect-First Path)

### Tiered Sampling Strategy

**Initial Pull (free, automatic):**
- Channel metadata: always (name, avatar, banner, subs, creation date, description) — cheap
- Most recent **50 videos** analyzed in full:
  - Thumbnails through GPT-4o Vision
  - Titles, descriptions, tags analyzed
  - Performance data (views, likes, comments, retention)
- Remaining videos (if 50+): metadata + performance data only (no thumbnail vision analysis)
- Upload pattern analysis: uses full history (just timestamps, very cheap)
- **Shorts vs Long-Form separation:** Videos are categorized as Shorts (<60 seconds, vertical) or long-form. Analyzed separately. Style detection weights toward whichever format dominates the channel. If mixed, style patterns generated for both and user picks their primary focus: "This channel has both Shorts and long-form. Which format are you planning to focus on?"

**Deep History Analysis (optional, credit-based):**
- Offered if the channel has 50+ videos: "We analyzed your 50 most recent videos. Want a deep analysis of your full library? (100 credits)"
- Analyzes up to **200 additional thumbnails** through GPT-4o Vision (sampled evenly across history to capture style evolution)
- Full metadata for all remaining videos
- Comprehensive historical performance breakdown (best months, growth patterns, pivots)
- Cost: **100 credits** flat (internal cap of 200 thumbnails keeps our cost under $1.50)

### What AI Generates From the Analysis
- **Detected niche:** "Based on your content, this is a True Crime channel focused on cold cases"
- **Detected Style profile:** Voice tone, visual format, thumbnail approach, title patterns, video length, pacing
- **Content audit:** Strengths, weaknesses, what's working, what's underperforming
- **Top 5 / Bottom 5:** Best and worst performing videos with analysis of why
- **Posting consistency score:** How consistently the channel uploads
- **Growth trajectory:** Where the channel is heading based on recent trends
- **Primary format:** Long-form, Shorts, or Mixed (with recommendation)

### Channel Onboarding Report
User sees a summary page:
- Everything above in plain English
- "We detected your style — here's what we found" with Style preview
- "Keep this Style?" or "Customize it" buttons
- "We have some suggestions to improve your channel" with AI insights
- If mixed Shorts + long-form: "Which format do you want to focus on?"

### Channel Verification Detection
At connection time, immediately check via YouTube Data API:
1. **`longUploadsStatus`** — reliably tells us if videos over 15 minutes are allowed ("allowed", "disallowed", or "eligible")
2. **`madeForKids`** — channel's default Made for Kids status
3. **Channel standing** — `status.isLinked` confirms the channel is in good standing

**Display results on the connection success screen:**
- "Channel verified — no upload restrictions"
- OR "Channel not verified — some limitations:"
  - "Video length limit: 15 minutes max (verify at youtube.com/verify)"
  - Shows impact: "Videos over 15 minutes can't be published until verified"

**Custom thumbnail detection:** Not directly checkable via API. Handle gracefully at publish time — if thumbnail upload fails with a permission error: "Your YouTube channel can't upload custom thumbnails yet. Verify at youtube.com/verify."

**Stored in DynamoDB** alongside channel record. Re-checked on every daily sync. If verification status changes (user verifies their channel), notification sent.

**Impact on project creation:** If unverified and user starts a project with a 20-minute target length, inline warning: "Your YouTube channel is limited to 15-minute uploads. Verify your channel or adjust your target length."

---

## YouTube Connection Management

### Connecting
- "Connect YouTube" button in channel workspace
- OAuth flow with Google
- User selects which YouTube channel (some Google accounts have multiple)
- We request read + write scopes (analytics, upload, metadata, thumbnails, playlists, comments)
- On success: pull all channel data, run verification checks, channel status changes to CONNECTED

### Global Uniqueness Enforcement
- **One YouTube channel = one platform account (globally enforced)**
- When connecting, we check the YouTube Channel ID against ALL connected channels across ALL accounts in DynamoDB
- If already connected to another platform channel on the SAME account: "This YouTube channel is already connected to [Channel Name]. Disconnect it there first."
- If already connected to a DIFFERENT account: "This YouTube channel is already connected to another account on our platform. If you believe this is an error, contact support." (Don't reveal which account — privacy)
- Agency team scenario: team members share the same account, so they share channel access. YouTube is connected once at the account level, not per team member.

### Already Connected
- Shows: YouTube channel name, avatar, subscriber count, connection status
- "Disconnect" button (with confirmation — warns that publishing will be disabled and scheduled publishes will be cancelled)
- "Re-authorize" button (if OAuth token expires)
- "Switch YouTube Channel" (disconnect current, connect a different one)

### OAuth Token Management
- Tokens stored encrypted in DynamoDB
- Refresh token used to get new access tokens automatically
- If refresh token is revoked (user removed app access from Google): channel transitions to DISCONNECTED, user sees "YouTube disconnected — please re-authorize"
- Token health check: background job pings YouTube API weekly, alerts if token is about to expire or has been revoked

---

## YouTube Data Sync Schedule (Post-Initial Pull)

### Sync Cadence

| Data Type | Sync Frequency | Method |
|---|---|---|
| Channel name / avatar / banner | Every 24 hours | Background job |
| Subscriber count | Every 6 hours | Background job |
| New video detection | Every 6 hours | Background job (check for new videos) |
| Video performance (views, likes) | Every 24 hours | Background job, batch all videos |
| Analytics (CTR, retention, traffic) | Every 24 hours | Background job |
| Comments | Every 12 hours | Background job, newest first |
| Playlists | Every 24 hours | Background job |

### Smart Sync Tiers (Inactive User Optimization)

| User Activity | Sync Frequency |
|---|---|
| **Active** (logged in within 7 days) | Full schedule (6-24 hour cycles) |
| **Idle** (7-30 days since login) | Weekly sync only |
| **Dormant** (30+ days since login) | Monthly sync only |
| **Returned** (just logged back in) | Immediate full sync, then resume full schedule |

Return syncs go through the job queue with a rate limiter: max 10 concurrent YouTube sync jobs across all returning users to prevent API quota spikes from marketing emails driving mass logins.

### YouTube Name/Avatar Changes
- If a sync detects the YouTube channel name or avatar changed, auto-update the "YouTube name" field
- Platform display name (user's custom name) stays separate — not overwritten
- Subtle notification: "YouTube channel name updated to [new name]"

### Sync Failure Handling
- If a sync fails (API quota, network error): retry with exponential backoff (1 min, 5 min, 30 min, 6 hours)
- After 3 consecutive failures: mark channel as "Sync paused" with banner
- After 24 hours of failures: notification to user: "YouTube sync paused for [Channel Name]. Click to retry."
- If failure is due to revoked OAuth: immediately transition to DISCONNECTED status, stop all syncing

### Quota Management Priority
When YouTube API quota is limited, prioritize in this order:
1. Publish operations (uploads, metadata updates)
2. New video detection
3. Subscriber count
4. Analytics
5. Comments
6. Playlists

---

## YouTube API Terms of Service Compliance

### Data Freshness
- YouTube ToS requires cached data not be stored for more than 30 days without refreshing
- Our sync schedule refreshes everything within 24 hours for active users
- Safety net: if a channel's data hasn't been synced in 28 days, flag it and stop displaying stale data: "Data may be outdated — reconnect to refresh"

### Disclosure
- OAuth consent screen clearly states what data we access and why
- Platform Terms of Service disclose we store YouTube data for analytics and content optimization
- Channel Settings shows: "YouTube Data: We sync your channel data to provide analytics and recommendations. Data is refreshed daily."

### Data Deletion Scenarios

**Scenario A: User disconnects YouTube (channel goes DISCONNECTED)**
- Stop API access immediately (revoke access token, keep refresh token for potential reconnection)
- Keep cached YouTube data for 30 days (user might reconnect)
- After 30 days of DISCONNECTED without reconnection: delete YouTube-sourced data (analytics, comments, video performance)
- Keep platform-side data forever (projects, scripts, generated media — our data, not YouTube's)

**Scenario B: User revokes access from Google's side (myaccount.google.com)**
- Token health check detects revocation, channel transitions to DISCONNECTED
- Same 30-day retention as Scenario A

**Scenario C: User deletes the entire channel**
- 30-day grace period (channel frozen, can be restored)
- YouTube connection revoked immediately
- After 30 days: ALL data deleted (YouTube data AND platform data)

**Scenario D: User deletes their entire account (GDPR)**
- All channels enter Pending Delete
- All YouTube connections revoked immediately
- 30-day grace period, then everything wiped

### Privacy Commitments
- We do NOT share YouTube user data with third parties
- We do NOT use YouTube data for advertising targeting
- We use YouTube data solely for platform features (analytics, recommendations, publishing)
- Documented in Privacy Policy and linked in OAuth consent screen

---

## Published Video Tracking After Disconnect

When a CONNECTED channel transitions to DISCONNECTED:

### Preserved
- All project records (including which ones were published, with YouTube video IDs and URLs)
- Historical analytics snapshot (frozen at last successful sync)
- Published video list with: title, publish date, YouTube URL, last-known views/likes
- All platform-side data (scripts, styles, media, thumbnails)

### Frozen
- Analytics stop updating (no API access)
- Dashboard shows: "Analytics paused — data shown from [last sync date]"
- Published videos still link to YouTube URLs (user can click through)

### Cancelled
- All scheduled publishes cancelled immediately
- Notification per affected project: "Scheduled publish for [Project Name] was cancelled because YouTube is disconnected"
- Active upload jobs aborted if mid-upload

### On Reconnection
- **Same YouTube channel:** Resume syncing seamlessly. Published video records still match. Fresh analytics pulled immediately. No re-analysis needed.
- **Different YouTube channel:** Published video records from old channel are archived (still visible in project history as "Published to [old channel name] (disconnected)"). New channel gets fresh analysis. Platform analytics (our data about what we published) preserved. YouTube channel analytics start fresh.

---

## Channel Workspace Dashboard

### Header
- Channel avatar + name + niche tag
- Status badge: DRAFT / CONNECTED / DISCONNECTED
- YouTube subscriber count (if connected) with trend arrow
- "Connect YouTube" button (if DRAFT or DISCONNECTED)
- Channel verification status indicator (if connected)

### Quick Stats Row (CONNECTED only)
- Subscribers (with 30-day trend)
- Total views (with 30-day trend)
- Average CTR (with trend)
- Average retention (with trend)
- Videos published this month

### Active Projects Section
- Cards for in-progress projects: title, current wizard step, last edited, thumbnail preview
- "+ New Project" card (requires Style to exist — see Empty States below)
- Filter: All / In Progress / Scheduled / Published / Archived

### AI Suggestions Section
- Topic suggestions based on niche trends and content gaps
- Style optimization suggestions based on analytics (CONNECTED only)
- Research Board monitoring alerts ("Your reference channels posted 3 new videos this week")
- Niche health alerts ("Your niche's search volume grew 25% this month")
- Max 5 suggestions shown, prioritized: alerts first, then topic ideas, then optimization tips
- Each suggestion has: dismiss (hides permanently), save (bookmarks to Saved Ideas), "Create Project" (for topic suggestions)
- "Last updated: 3 days ago" label + "Refresh suggestions" button (20 credits)
- Saved Ideas accessible as a section within the Dashboard AI Suggestions area

### AI Suggestions Generation Strategy
- **Topic suggestions:** Background job, generated once per week per channel using GPT-4o
- **Style optimization:** Generated after every 5 published videos, or monthly (whichever comes first)
- **Research Board alerts:** From weekly monitoring scan (defined in Research Board module)
- **Niche health alerts:** Generated monthly using Niche Finder trend data
- **First-time trigger:** Suggestions generated when the channel has at minimum a niche set. Before that: "Set your niche to get AI-powered topic suggestions" with a link to Niche Finder.
- All suggestions stored in DynamoDB with `generatedAt` timestamp. Dashboard reads from cache, never calls GPT-4o on page load.
- Weekly background generation is platform operating cost (not charged to user). Manual refresh is 20 credits.

### Quick Actions
- New Project
- Run Niche Search
- View Research Board
- Edit Style
- View Schedule

### Empty States for DRAFT / New Channels

| Sidebar Item | DRAFT State |
|---|---|
| Dashboard | Shows, but no YouTube stats — only project status and AI suggestions |
| Projects | Shows, but "+ New Project" requires Style to exist first. If no Style: tooltip "Generate your channel Style first — it drives all your video creation." |
| Niche Finder | Fully functional |
| Research Board | Empty state: "Save reference channels from Niche Finder" |
| Style | Empty state: "Generate your Style after saving reference channels" |
| Analytics | Single card: "Connect YouTube to unlock analytics. Your channel's performance data will appear here." Calendar UI shown in preview/disabled state. |
| Schedule | Single card: "Connect YouTube to start scheduling. Plan your content calendar and automate publishing." Calendar shown in preview/disabled state. |
| Publishing | Shows — this is where you connect YouTube |
| Settings | Fully functional |

---

## Channel Settings

### Basic Info
- Channel name (display name within our platform — doesn't change YouTube channel name)
- Niche (can be updated — triggers impact assessment, see Niche Change below)
- Channel description/notes (internal, for user's reference)
- Channel icon (pulled from YouTube if connected, or user uploads for DRAFT)

### Default Project Settings
- Default video length target (e.g., "10-12 minutes")
- Default voice (from user's available voices)
- Default visual style tier (Draft / Standard / Premium)
- Default music mood
- Default caption style
- Default thumbnail approach
- Pre-filled in every new project but always overridable per project

### Publishing Defaults (CONNECTED only)
- Default YouTube category
- Default language
- Default "Made for Kids" designation
- Default comment settings (all / approval / off)
- Default visibility (public / unlisted / private)
- Default playlist assignment
- Pre-fill the publishing step but always overridable

### Social Account Assignment
- Checklist of all account-level social connections with checkboxes
- Each social account shows which other channels it's already assigned to: "Instagram @truecrime_daily (also on: My Finance Channel)"
- One social account CAN be assigned to multiple channels (cross-promotion is common)
- If a social account is disconnected at the account level: auto-unassigned from ALL channels, notification per affected channel
- Any scheduled social posts using that account are cancelled with notification
- At publish time, Publishing module pulls assigned social accounts for the channel. User can override per-project.

---

## Niche Change — Impact Assessment

When user changes niche, a full impact panel is shown before the change is applied:

**"Changing niche from True Crime to Finance will affect:"**

- **Research Board:** "You have 4 saved True Crime reference channels. They'll remain saved but may no longer be relevant." Options: Keep All / Clear All / Review Each
- **Style:** "Your current Style was built from True Crime references. Options:" Keep current Style / Generate new Style from scratch (shows credit cost from Style System) / Generate new Style from existing references if any
- **AI Suggestions:** "Topic suggestions and content gap analysis will recalibrate to Finance immediately."
- **Existing Projects:** "Your 3 in-progress projects will keep their current content. New projects will use the Finance niche context."

User must confirm the impact panel before the niche change goes through. This is NOT a simple "are you sure?" — it's an actionable decision tree.

If the user has no reference channels and no projects, just change the niche directly (no impact panel needed).

---

## Channel Lifecycle

### Archive
- Soft delete — channel hidden from dashboard, all data preserved
- Projects stop running (scheduled publishes cancelled, active renders cancelled)
- Can be restored at any time ("Unarchive")
- Archived channels don't count toward tier's channel limit
- YouTube connection maintained (not disconnected) but sync frequency reduced to monthly

### Delete
- Hard delete with confirmation ("Type DELETE to confirm")
- 30-day grace period: channel marked for deletion, frozen (like archive)
- User can restore within 30 days
- After 30 days: all DynamoDB records deleted, all S3 files deleted
- YouTube connection revoked immediately on delete (not after 30 days)
- Published YouTube videos are NOT deleted (they stay on YouTube)
- GDPR compliant: no data retained after deletion completes

### Duplicate
- Creates a copy of the channel's configuration:
  - Same niche
  - Same Style (copied, not linked — changes to the copy don't affect the original)
  - Same default settings
  - Same reference channels on Research Board
- Does NOT copy: projects, analytics, YouTube connection, social assignments
- Useful for: testing a style variation, creating a similar channel in an adjacent niche
- Counts toward tier's channel limit

---

## Channel Organization (Multi-Channel Users)

### Channels Page
- **Search bar** at top: filter by name, niche, or status
- **Sort options:** Most recent activity (default), alphabetical, subscriber count, date created
- **Filter chips:** All / DRAFT / CONNECTED / DISCONNECTED / Archived
- **Pin/favorite:** Star icon on channel cards pins them to the top. Pin icon only appears when user has 3+ channels (irrelevant visual clutter below that).

### Channel Switcher (Top Bar Dropdown)
- Shows pinned channels first, then last 5 recently accessed
- Search bar at top of dropdown for quick filtering
- If 10+ channels: scrollable list with search
- "View All Channels" link at bottom goes to full Channels page

---

## First-Time Onboarding (New User)

### Welcome Flow
1. **Welcome screen:** "Welcome to [Platform Name]. Let's set up your first channel."
2. **Two big cards:** "I have a YouTube channel" / "I'm planning a new channel"
3. Whichever path they pick creates their first channel
4. After channel creation: **contextual guided walkthrough:**
   - **DRAFT channels:** Highlights Niche Finder and Research Board as "Start here" items
   - **CONNECTED channels:** Highlights Analytics and Projects as primary items
   - All sidebar items get brief tooltip explanations

### Onboarding Progress Checklist
Cross-module feature tracked at the **Account level** in DynamoDB (not channel level — one-time onboarding):

- [ ] Create your first channel
- [ ] Research your niche
- [ ] Save a reference channel
- [ ] Generate your Style
- [ ] Create your first project
- [ ] Generate your first video
- [ ] Publish to YouTube

Each step has a `completed` boolean and `completedAt` timestamp. Each module updates its step via a shared `onboarding.completeStep(stepId)` function. Checklist renders in the channel workspace dashboard.

Once all 7 steps complete: auto-dismisses with a "You're all set!" message. User can dismiss early via "Skip guide." Re-accessible from a Help menu icon.

---

## Error Handling

- **OAuth fails:** "We couldn't connect to YouTube. This usually means the popup was blocked or you denied access. Try again?"
- **YouTube channel has 0 videos (connect-first):** "This channel has no videos yet. We can't auto-detect a style, but you can set one up manually or from reference channels."
- **YouTube channel is terminated/suspended:** "This YouTube channel appears to be unavailable. Check its status on YouTube directly."
- **Multiple Google accounts:** Google's OAuth picker handles account selection. We don't manage this.
- **Token refresh fails:** Background health check catches it. User sees: "Your YouTube connection needs to be refreshed. Click here to re-authorize."
- **Unverified channel + long video target:** Inline warning in project creation: "Your YouTube channel is limited to 15-minute uploads. Verify at youtube.com/verify or adjust your target length."
- **Custom thumbnail upload fails:** At publish time: "Your channel can't upload custom thumbnails yet. Verify at youtube.com/verify to enable this."
- **Niche change after projects exist:** Shows full impact assessment panel (see Niche Change section above)
- **Channel limit reached:** "You've reached your plan's limit of X channels. Upgrade or archive an existing channel."
- **YouTube channel already connected (same account):** "This YouTube channel is already connected to [Channel Name]. Disconnect it there first."
- **YouTube channel already connected (different account):** "This YouTube channel is already connected to another account on our platform. Contact support if you believe this is an error."

---

## Credit Costs (Channel Builder)

| Operation | Credits | Notes |
|---|---|---|
| Channel creation | Free | All paths |
| Initial channel analysis (connect-first, 50 videos) | Free | One-time setup cost we absorb |
| Style reconciliation (draft-to-connected) | Free | One-time setup cost |
| Deep History Analysis (50+ video channels) | 100 credits | Optional, user-triggered, caps at 200 thumbnails |
| Manual Dashboard Suggestion Refresh | 20 credits | Prevents spam-clicking |
| Channel verification check | Free | Automated at connection time |
| All other operations (archive, delete, duplicate, settings) | Free | Configuration, not generation |

---

## Connection to Other Modules

| Module | How Channel Builder Connects |
|---|---|
| **Niche Finder** | "Create Channel From This" sends niche + reference data to Channel Builder |
| **Research Board** | Channel Builder creates the empty Research Board; references managed there |
| **Style System** | Channel Builder triggers Style generation; Style System does the actual work |
| **Projects/Wizard** | Projects live under a channel and inherit its Style and defaults. Project creation requires Style to exist. |
| **Publishing** | Channel Builder manages the YouTube connection that Publishing uses to upload |
| **Analytics** | Channel Builder pulls initial data; Analytics module handles ongoing reporting |
| **Notifications** | Channel status changes, connection issues, AI suggestions, and sync alerts flow through notifications |
| **Billing** | Channel count is tier-gated; Channel Builder checks limits on creation. Deep Analysis and Suggestion Refresh cost credits. |
| **Platform Systems** | Onboarding checklist is a cross-module feature; Channel Builder owns the "Create channel" step, other modules own their steps. |
