# Publishing Module — Finalized Spec (Audited)

## What This Module Does
Takes the final rendered video and gets it onto YouTube. Handles SEO optimization (title, description, tags), thumbnail finalization, scheduling, YouTube API upload, end screens, captions, and post-publish tracking. Also handles exports for non-YouTube destinations (Google Drive, direct download).

---

## Publishing Readiness Checklist

Before the Publish button is enabled, ALL must be true:
- [ ] Final rendered video exists in S3
- [ ] At least 1 thumbnail selected
- [ ] Title written (AI-generated or manual)
- [ ] Description written (with auto-chapters if applicable)
- [ ] Tags generated
- [ ] Category selected
- [ ] "Made for Kids" designation set
- [ ] Comment settings confirmed
- [ ] Video language set
- [ ] Captions ready for upload
- [ ] YouTube channel connected (if not DRAFT channel)
- [ ] YouTube policy compliance check passed
- [ ] User has confirmed the final preview

---

## Step 1: SEO Generation (Title, Description, Tags)

### AI generates all SEO content using GPT-4o:
- Reads the finalized script, niche data, Channel Style patterns, and trending keywords
- Generates 3-5 title options ranked by click potential
- Generates a full description with proper structure
- Generates 15-30 tags (mix of broad + specific + long-tail)
- User can edit any of it — AI suggestions are a starting point

### Title rules (from viral research):
- Under 60 characters (YouTube truncates longer)
- Curiosity gap or strong hook
- Keywords front-loaded
- No clickbait that would violate YouTube policy

### Description structure:
- Line 1-2: Hook/summary (shows in search results — most important)
- Auto-chapters/timestamps (see below)
- Body content with keywords woven in naturally
- Hashtags (3-5, YouTube allows up to 15 but more looks spammy)
- Standard channel footer (subscribe CTA, social links — saved at Channel level, auto-appended)

### Auto-Chapters:
- YouTube requires specific format: timestamps starting from `0:00`, minimum 3 chapters, minimum 10 seconds each
- AI groups related scenes into logical chapters using the script's `template_section` tags (HOOK, RISING_ACTION, CLIMAX, RESOLUTION, etc.) — NOT 1:1 scene-to-chapter
- Typical result: 4-7 chapters for a 10-minute video
- **Intro offset:** If there's an intro template (e.g., 5 seconds), all timestamps shift accordingly. First chapter = `0:00 Introduction` (covers intro), second chapter starts at the intro's end time.
- Format in description:
  ```
  0:00 Introduction
  0:05 The Hiking Trip
  2:15 The Night Everything Changed
  5:42 What They Found
  8:10 The Investigation
  ```
- User can edit chapter names and timestamps before publishing
- Toggle to disable chapters entirely if preferred
- **Not generated for Shorts** (chapters don't apply)

### Tags:
- Mix of: exact topic match, broader niche tags, long-tail variations, trending related terms
- AI pulls from niche research data if available (Niche Finder integration)

### Shorts SEO (different from long-form):
- Title: shorter, punchier, under 40 characters recommended
- Description: minimal — 1-2 sentences + hashtags (hashtags matter more for Shorts discoverability)
- Tags: fewer, broader (Shorts algorithm works differently from search)
- No chapters
- `#Shorts` hashtag auto-added to description (not strictly required anymore, but doesn't hurt)

### Credit cost: 0 credits — rolled into script generation. No extra cost for SEO generation.

---

## Step 2: Thumbnail Finalization

- Preliminary thumbnails were generated during the Visuals step (images.md)
- Now the final title is known, so:
  - System refines thumbnail text overlay with the actual title/hook text
  - User picks from 3-5 thumbnail variations
  - Can A/B test up to 3 thumbnails (YouTube's Test and Compare feature)
- Final thumbnail exported as JPG/PNG, max 2MB (YouTube's limit)
- Thumbnail uploaded alongside the video via YouTube API

### Thumbnail Preview at Different Sizes:
- Before publishing, preview section shows the selected thumbnail in 4 YouTube contexts:
  - **Homepage card** (large, ~360x202px)
  - **Suggested sidebar** (small, ~168x94px)
  - **Search result** (medium, ~246x138px)
  - **Mobile feed** (full width, ~360x202px)
- Shown on both light and dark backgrounds (YouTube has dark mode)
- If text is likely unreadable at sidebar size: subtle warning "Your thumbnail text may be hard to read at smaller sizes"

### Channel Verification Check:
- Unverified YouTube channels CANNOT upload custom thumbnails
- When channel is first connected, system checks verification status via API
- If unverified: warning "Your channel isn't verified — custom thumbnails won't work and videos are limited to 15 minutes. Here's how to verify:" with link to YouTube's verification page
- System uses YouTube's auto-selected thumbnail as fallback for unverified channels

---

## Step 3: YouTube Policy Compliance Check

- GPT-4o reviews all text content in one API call:
  - Script text scanned for hate speech, harassment, misleading claims
  - Title checked for clickbait violations
  - Description checked for spam patterns
  - Thumbnail text checked for misleading claims
- Returns: PASS, WARNING (allows publish with acknowledgment), or FAIL (blocks until fixed)
- Cost: ~$0.01-0.03 per check

---

## Step 4: Video Settings

### Category Selection:
- AI auto-suggests category based on niche (e.g., true crime → Entertainment, how-to → Education)
- Saved as a channel default — once set, auto-applied to all projects in that channel
- User can override per video from a dropdown (~15 YouTube categories)

### "Made for Kids" / COPPA Designation:
- Default: "Not Made for Kids" (correct for 95%+ of faceless channels)
- AI scans script content and flags if it detects content directed at children
- If flagged: warning explaining consequences — "Made for Kids videos have comments disabled, no notifications, and limited ad revenue"
- User makes the final call
- Saved as a channel default but overridable per video
- Set via YouTube API `selfDeclaredMadeForKids` field on upload

### Comment Settings:
- Options: Allow all, Hold potentially inappropriate for review, Hold all for review, Disable comments
- Default saved at channel level (most faceless channels use "Hold potentially inappropriate")
- Overridable per video

### Video Language:
- Default from channel settings
- Overridable per video
- Sets both video language and default audio language in YouTube API
- Matters for international discoverability

### Paid Promotion Disclosure:
- Toggle: "This video contains paid promotion or sponsorship"
- Sets `paidProductPlacementDetails` via YouTube API
- Default: OFF

### Privacy Setting:
- Public, Unlisted, or Private
- Default: Public
- Unlisted useful for review workflow — publish unlisted, share link with a friend/client, then switch to Public when ready

### Monetization Note:
- YouTube API does NOT support setting mid-roll ad placement or ad preferences
- After publishing, if the channel is monetized: "Manage ad placements in YouTube Studio" message with direct link
- This is a YouTube limitation, not ours

---

## Step 5: Caption Upload

### Auto-Upload Captions to YouTube:
- We generate perfect captions from TTS word-level timestamps — zero transcription errors
- Captions auto-uploaded as closed captions via YouTube Captions API alongside the video
- Language tag matches the video language setting
- **Massive SEO benefit:** YouTube indexes caption text for search. Our captions are more accurate than YouTube's auto-generated ones.
- Caption file format: SRT (YouTube's preferred format)
- User can toggle caption upload on/off (default: ON)

### For Shorts:
- Captions still uploaded but YouTube handles Shorts captions differently (burned into video on mobile). Our uploaded captions serve as the accessible/searchable version.

---

## Step 6: Publishing Options

### Publish Now:
- Immediately uploads to YouTube via YouTube Data API v3
- Video file streamed from S3 → YouTube (resumable upload for reliability)
- Thumbnail uploaded separately via API
- Captions uploaded via Captions API
- All metadata set: title, description, tags, category, language, privacy, Made for Kids, comment settings, paid promotion
- End screens and cards added after upload completes (see Step 7)

### Schedule for Later:
- User picks date and time from a calendar picker
- AI recommends optimal posting times based on:
  - Niche data (when similar channels post)
  - Channel analytics (when existing audience is most active)
  - General YouTube best practices
- Scheduled publish stored in DynamoDB
- Lambda cron job triggers the upload at the scheduled time
- If the video isn't rendered yet at schedule time: auto-triggers render, then uploads when complete

### Save as Draft (YouTube):
- Uploads to YouTube as a private/draft video
- User can finalize publishing directly on YouTube later

### Playlist Assignment:
- "Add to Playlist" dropdown showing all playlists on the connected YouTube channel
- Can select multiple playlists
- "Create New Playlist" option (name + description + privacy)
- AI auto-suggests the best playlist based on topic match
- If no playlists exist: AI suggests creating one based on niche
- Playlists fetched and cached from YouTube API when channel is connected

---

## Step 7: YouTube End Screens & Cards

### End Screens (last 5-20 seconds):
- Added via YouTube API after video upload completes
- Options: subscribe button, suggested video, playlist link, channel link
- System auto-suggests layout based on outro duration
- User picks which elements to include
- Positioned in end screen safe zones (marked in Editing module)
- **Requirement:** Video must be at least 25 seconds long for end screens
- **Not available for Shorts**

### Info Cards (mid-video):
- Optional cards that pop up during the video (top-right corner)
- Types: video/playlist link, channel link, poll
- User can add cards at specific timestamps
- AI suggests card placements at natural break points between scenes
- **Not available for Shorts**

---

## Step 8: Post-Publish Tracking

Once the video is live on YouTube:
- **Status check:** Confirm upload succeeded → YouTube processing → video live
- **Processing note:** YouTube takes 5-60 minutes to process after upload. Status shown: "Uploaded successfully. YouTube is processing your video."
- **Initial metrics pull (first 48 hours):** Views, watch time, CTR, impressions — pulled via YouTube Analytics API
- **Project status:** Updated to PUBLISHED in the state machine
- **Notification:** User gets notification (bell + optional email): "Your video is live! [link]"
- **Analytics handoff:** Publishing triggers the first analytics sync. Ongoing daily tracking handled by the Analytics module.

---

## Shorts-Specific Publishing Flow

When the video is 9:16 aspect ratio AND under 60 seconds, the publishing flow adjusts:

### How Shorts Get Created (Two Paths):
1. **Derived Short:** From the Scripts module's Short-Form Variant (shortened version of a long-form script). Opens as a separate project in the editor with 9:16 settings.
2. **Standalone Short:** User creates a new project and picks "Short" as the format from the start. Duration target 15-60 seconds, vertical format, entire wizard optimized for short-form.

### What Changes for Shorts:
- SEO: shorter title, minimal description, hashtags-focused (see Step 1)
- Thumbnail: YouTube auto-selects a frame by default; custom thumbnail upload supported but less important for Shorts
- No end screens or info cards
- No auto-chapters in description
- No mid-roll monetization settings
- Publishing flow is streamlined — fewer settings to configure

### Content Calendar:
- Shorts shown with a distinct visual marker — smaller card, vertical thumbnail, "SHORT" badge
- Long-form shown as standard cards with horizontal thumbnail
- Filter options: All, Long-Form Only, Shorts Only
- Separate visual treatment in week/month view

---

## Video Metadata Updates After Publishing

### "Edit Published Video" Flow:
- Available on any PUBLISHED project
- Can update without re-uploading: title, description, tags, thumbnail, category, playlist assignment, comment settings, end screens, cards, captions
- Changes pushed to YouTube via API immediately
- Cannot replace the actual video file via API — if user re-renders, they need to re-upload as a new video
- Change history logged: "Title changed from X to Y on [date]"
- **Note:** Updating metadata does NOT reset YouTube algorithm performance. Algorithm tracks from initial publish.

---

## Publishing from DRAFT Channels

If the channel has no YouTube connection:
- Publish button replaced with "Export Video"
- Export options: Download MP4, Save to Google Drive, Copy shareable link (S3/CloudFront)
- Message: "Connect a YouTube channel to publish directly."
- Quick-connect button that opens YouTube OAuth flow
- Project state goes to RENDER_COMPLETE instead of PUBLISHED

---

## First-Publish Onboarding

First time a user hits the Publish step on any channel:
- Guided overlay walks them through:
  - Step 1: "Connect your YouTube account" — explains permissions needed ("We need access to upload videos and manage your channel's content")
  - Step 2: Google OAuth flow
  - Step 3: Channel verification check (custom thumbnails, video length limits)
  - Step 4: Brief tour of publishing settings
- **OAuth error recovery:**
  - "Permission denied" → user declined scopes, explain which are required
  - "Wrong account" → channel not found, suggest switching Google accounts
  - "Token expired" → re-authenticate prompt
- After first successful publish: onboarding doesn't show again for that channel

---

## YouTube API Integration Details

### Authentication:
- YouTube OAuth connections live at Account level
- User connects Google account once → OAuth token stored securely (AWS Secrets Manager)
- Token refresh handled automatically
- If token expires/revokes: prompt to re-authenticate

### Required OAuth Scopes:
- `youtube.upload` — upload videos
- `youtube` — manage videos, playlists, end screens, cards
- `youtube.readonly` — read channel data, analytics
- Scopes requested during first OAuth flow with clear explanations

### Upload Process:
- Uses YouTube Data API v3 resumable uploads
- Chunked upload (handles large files, survives network interruptions)
- Progress tracked via WebSocket
- If upload fails mid-way: resumes from last successful chunk
- Retry up to 3 times with exponential backoff

### Channel Verification Detection:
- On first connection, check channel's verification status
- Unverified channels: warn about 15-minute limit and no custom thumbnails
- Track verification status and re-check periodically

### Video Length Limits:
- Unverified channels: max 15 minutes, max 2GB file size
- Verified channels: max 12 hours, max 256GB
- System checks before upload and warns if video exceeds limits

### API Quota Management:
- YouTube API daily quota: 10,000 units/day default
- Video upload costs ~1,600 units (~6 uploads per day per key)
- **Multi-key rotation** for increased throughput
- Prioritize publishing operations over analytics reads
- Queue non-urgent operations during low-quota periods
- Admin alert when daily quota exceeds 80%

### Publish Rate Limits by Tier:
- Starter: 2 publishes per day
- Creator: 5 publishes per day
- Pro: 15 publishes per day
- Agency: 50 publishes per day

---

## Content Calendar Integration

- Calendar shows: scheduled publishes, in-progress projects, published videos
- Shorts vs long-form visually distinct (vertical badge, different card size)
- Drag-and-drop to reschedule
- Color coded: draft (grey), scheduled (blue), published (green), failed (red)
- Week and month views
- Per-channel and all-channels views
- Filter: All, Long-Form, Shorts

---

## Google Drive Export

- "Save to Google Drive" option alongside YouTube publish
- Exports: final video MP4, thumbnail(s), caption SRT file, script PDF
- Saved to folder structure: `Faceless AI / [Channel Name] / [Project Name] /`
- Requires Google Drive OAuth (separate scope but same Google account flow)
- Useful for backup, sharing with editors, or repurposing content

---

## Error Handling

- **Upload fails:** Auto-retry (resumable, up to 3 attempts). If all fail: notify user with specific error.
- **YouTube returns auth error:** Prompt user to re-authenticate Google account
- **YouTube returns policy violation:** Show specific violation text, suggest fixes, link to guidelines
- **Quota exceeded:** Queue the upload, process when quota resets (midnight Pacific). Notify user of delay.
- **Scheduled publish missed:** Auto-retry within 1 hour. If still failing, notify user and keep in READY_TO_PUBLISH state.
- **Video stuck processing:** Normal — show status with estimated time. Alert user if processing exceeds 2 hours.
- **Caption upload fails:** Non-critical — video still publishes. Retry caption upload in background. Notify user if captions couldn't be added.
- **End screen setup fails:** Non-critical — video still publishes. User can add end screens manually via YouTube Studio.
- **Channel verification prevents custom thumbnail:** Fall back to YouTube auto-selected frame. Warn user.
- **Video exceeds length limit (unverified):** Block upload. Show clear message: "Your channel has a 15-minute limit. Verify your channel to upload longer videos."

---

## Credit Costs

| Operation | Credits | Notes |
|---|---|---|
| Publishing/upload | 0 | Included in tier |
| SEO generation | 0 | Rolled into script generation |
| Policy compliance check | 0 | Safety feature, always free |
| End screen/card setup | 0 | YouTube API call |
| Caption upload | 0 | Included — high SEO value |
| Metadata updates | 0 | YouTube API call |

---

## Dependencies

- **Editing module** — final rendered video in S3, thumbnail images, caption SRT files
- **Scripts module** — scene structure + template_section tags for auto-chapters, niche data for SEO
- **Voiceover module** — total duration for video metadata, caption data
- **Style System** — channel footer template for descriptions, branding defaults, default category/language/comment settings
- **YouTube Data API v3** — upload, metadata, end screens, cards, captions, playlists
- **YouTube Analytics API** — post-publish initial metrics
- **Google Drive API** — optional export
- **Platform Systems** — publishing readiness checklist, state machine (READY_TO_PUBLISH → PUBLISHING → PUBLISHED), job queue for scheduled publishes
- **Niche Finder** — trending keywords and niche data for SEO optimization
- **GPT-4o** — SEO content generation, policy compliance check, chapter grouping

---

## Edge Cases

- **Multiple YouTube channels on same Google account:** User picks which channel during OAuth connection. Each channel is a separate connection.
- **YouTube API changes:** Model-based approach to YouTube metadata means we can adapt — admin updates API integration without changing user-facing features.
- **Video re-rendered after publish:** Old published video stays on YouTube. New render creates a new upload opportunity. User decides: upload as new video or keep the old one.
- **Bulk scheduling:** User can schedule multiple videos from the content calendar. Each follows the same publishing flow individually.
- **Channel deleted on YouTube:** System detects via API check, marks channel as disconnected, notifies user.

---

## Features NOT in v1 Launch (Future)

- YouTube Premieres (scheduled live-style launch with countdown and chat)
- Multi-platform publishing (TikTok, Instagram Reels — post Short-Form Variants)
- Social media auto-sharing (post YouTube link to connected social accounts)
- Post-publish SEO refinement (AI suggests title/tag changes based on 48-hour performance)
- Cross-promotion suggestions (link to other published videos in description)
- Community post creation via YouTube API
