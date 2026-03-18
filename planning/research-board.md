# Research Board Module — Finalized Spec (Audited)

## What This Module Does
A workspace within each channel where users save and deeply analyze competitor/reference YouTube channels. Think of it as a "mood board" for YouTube strategy. You find channels through the Niche Finder, save the best ones to your Research Board, and AI analyzes them to inform your channel's Style and content strategy. Also includes saved individual videos for reference and ongoing monitoring of reference channels for new high-performing content.

---

## Where It Lives
- Inside each Channel Workspace (sidebar item)
- Also accessible from Niche Finder — "Save to Research Board" button on any channel or video
- Each channel has its own Research Board (reference channels for a true crime channel are different from a finance channel)

---

## Clear Distinction: Niche Finder vs Research Board

- **Niche Finder = Discovery.** Broad search. Scan dozens of channels quickly. Surface-level metrics. Find opportunities and niches. The wide net.
- **Research Board = Deep Analysis.** Your curated set. Save specific channels and videos. Get full AI report cards, cross-comparisons, and ongoing monitoring. The magnifying glass.
- Niche Finder shows basic stats for many channels. Research Board goes deep on a few.
- Niche Finder never generates full report cards. Research Board never does broad niche scanning.
- The "Save to Research Board" button in Niche Finder is the bridge between the two.

---

## Two Sections: Saved Channels + Saved Videos

### Saved Channels (1-5 per board)
Reference YouTube channels you want to study and draw patterns from. These directly feed into Style generation.

### Saved Videos (up to 10-25 per board)
Individual standout videos you want to reference — viral breakouts, great hooks, interesting approaches. These are reference material only and don't feed into Style generation.

---

## Saved Channels — Detail

### Grid View (default):
- 1-5 saved reference channel cards in a grid
- Each card shows: channel name, avatar, subscriber count (with sparkline growth trend), total videos, average views, upload frequency, niche tag
- Buttons: "Report Card", "Deep Analysis", "Refresh", "Remove"
- Empty slots show "+ Add Reference Channel" with link to Niche Finder

### How Reference Channels Get Here:

**Path 1: From Niche Finder**
- User runs a niche search, browses results
- Finds a channel → clicks "Save to Research Board"
- Picks which channel's Research Board to save it to

**Path 2: Direct Add**
- On the Research Board, click "+ Add Reference Channel"
- Paste a YouTube channel URL or search by name
- System pulls channel data via YouTube API

**Path 3: AI Suggestion**
- After saving 3+ reference channels, AI suggests 2-3 additional channels
- "Based on your saved channels, also look at these"
- Pulls from Niche Finder data — channels in similar niches with strong performance
- User can save or dismiss suggestions
- Cost: 5 credits

---

## Tiered Analysis System

### Quick Analysis (automatic on save) — 50 credits
Runs immediately when a reference channel is saved:
- Channel stats and metadata (subscribers, total views, video count, creation date)
- Last 10 thumbnails analyzed via GPT-4o Vision (colors, text, composition, style patterns)
- 3 top-performing video transcripts pulled and analyzed (hook style, pacing, CTA placement)
- Title and description pattern analysis (word count, power words, question vs statement)
- Tag analysis: top 10 most-used tags, most common tag categories
- Upload schedule detection (posting days, times, frequency, consistency score)
- Subscriber growth rate (from available data)

**Produces the Report Card:**
- **Strengths:** What this channel does well
- **Weaknesses:** Where they fall short
- **What to Copy:** Specific patterns worth borrowing
- **What to Avoid:** Things that don't work or are risky
- **Red Flags:** Warnings (declining views, high dislike ratio, potential policy issues)
- **Upload Schedule:** "Posts Tuesdays and Thursdays, 2-4pm EST, 2.3 videos/week"
- **Top Tags:** Most common tags and tag categories

### Deep Analysis (user-triggered) — 150 credits
Everything from Quick Analysis, PLUS:
- Full 30 thumbnails analyzed via GPT-4o Vision
- 10 video transcripts pulled and analyzed
- Hook extraction and pacing breakdown per video
- Content gap detection across ALL saved reference channels
- **Top 5 vs Bottom 5 breakdown:** Best and worst performing videos side by side with AI analysis of what they have in common / what went wrong
- Full tag strategy: which tags correlate with higher views, unique tags to adopt, tag overlap between references
- Performance correlation: which style elements (title format, thumbnail style, video length, posting time) correlate with higher views
- Script structure analysis: average section lengths, narrative arc patterns, CTA timing

### Cross-Comparison (3+ channels saved) — 30 credits
- Side-by-side comparison table: video length, posting frequency, thumbnail style, hook style, title patterns, audience overlap
- AI narrative: patterns, differences, and opportunities
- **Your opportunity:** AI identifies the sweet spot — what to blend, where to differentiate
- Feeds directly into Style System for channel Style generation

---

## Transcript Access Strategy

### How we get competitor transcripts:
- Use YouTube's publicly available timedtext/subtitle endpoint for auto-generated captions
- Same approach used by VidIQ, TubeBuddy, and every major YouTube analytics tool
- Auto-generated captions available on the vast majority of English-language videos
- Implementation: Python Lambda function requests timedtext XML, parses to plain text

### Fallback when captions aren't available:
- Some videos have captions disabled by the creator, or are in languages without auto-captions
- Skip transcript analysis for those videos
- Analyze from title + description + tags + thumbnail only
- Report card notes: "Transcript unavailable for 3 of 10 videos — analysis based on available data"

### Fallback when most videos lack captions:
- Report card marks transcript analysis as "Limited"
- Relies more heavily on thumbnail + title + metadata analysis
- Still produces useful insights, just less detailed on script structure

---

## Small/New Channel Handling

- **Fewer than 10 videos:** Analyze ALL available videos. Report card notes: "This channel has X videos. Analysis based on limited data."
- **1-2 videos:** Allow save with strong caveat: "Very limited data — report card will be mostly speculative."
- **0 videos:** Block save: "This channel has no videos to analyze yet."
- **Credit cost reduced proportionally** for Deep Analysis on small channels (fewer transcripts/thumbnails = less GPT-4o cost)

---

## User Notes

- Each reference channel card has an expandable "My Notes" text field
- Each saved video has the same
- Plain text with basic formatting (bold, bullet points)
- Notes saved to DynamoDB alongside the reference data
- Visible in expanded card view and in cross-comparison export
- Useful for tracking personal observations during competitive research

---

## Saved Videos — Detail

### What it is:
Individual videos saved for reference — viral breakouts, great hooks, interesting approaches.

### How videos get here:
- "Save Video for Reference" button in Niche Finder (on any outlier or search result)
- Paste a YouTube video URL directly on the Research Board
- From a weekly monitoring alert (see Live Monitoring below): "Analyze This Video"

### Each saved video gets an AI breakdown (30 credits):
- **Hook analysis (first 30 seconds):** Type of hook, length, effectiveness rating
- **Script structure:** Section pacing, narrative arc, CTA placement
- **Thumbnail breakdown:** Colors, text, composition, what makes it click-worthy (GPT-4o Vision)
- **Title analysis:** Keywords, curiosity gap, length, format
- **Performance context:** Nx Viral Multiplier vs channel average
- **"Why It Worked" summary:** AI explains what drove the performance
- **Tags used:** What tags this specific video uses

### Limits:
| Tier | Saved Videos per Board |
|---|---|
| Starter | 10 |
| Creator+ | 25 |

### Saved videos don't feed into Style generation — they're reference material only.

---

## Live Monitoring — Weekly New Video Scan

### How it works:
- Background job runs **weekly** for every user's reference channels
- Checks each reference channel for new uploads since last scan (YouTube API metadata — very cheap on quota)
- For each new video found, pulls performance stats after 48-72 hours (YouTube's initial performance window)
- Compares views to the channel's average using Nx Viral Multiplier

### Smart Alerts Based on Performance:
- **Nx > 3x (strong performer):** Notification: "Reference channel 'True Crime Daily' posted a new video at 3.5x their average. Tap to see why."
- **Nx > 10x (viral breakout):** Higher priority alert: "BREAKOUT: Reference channel posted a video at 12x their average. This could be a trend worth jumping on."
- **Nx < 0.5x (underperformer):** No alert — not actionable. Logged in report card data.

### What the Alert Shows:
- Video title, thumbnail, view count, Nx multiplier
- Quick AI summary of likely reasons (lightweight GPT-4o on title + thumbnail + description only)
- Two action buttons:
  - **"Analyze This Video"** — saves to Saved Videos with full deep analysis (30 credits)
  - **"Create Video From This"** — jumps to project creation with topic pre-filled

### Additional Change Alerts (from monthly data refresh):
- **Upload spike:** 2x+ their normal frequency in last 30 days
- **Upload drop:** Less than 50% normal frequency
- **Subscriber surge:** 3x+ normal monthly growth
- **Potential rebrand:** Channel name or avatar changed

### Cost:
- Weekly scan: **Free** (YouTube API metadata only, no GPT-4o)
- Quick AI summary in alert: **Free** (very lightweight, ~$0.01 per alert, we absorb it)
- Full video analysis: **30 credits** (only if user clicks "Analyze This Video")

---

## Data Refresh Strategy

### Monthly Auto-Refresh (free):
- Re-pulls channel stats only: subscriber count, video count, total views, latest upload date
- NO GPT-4o re-analysis — just a data update
- Logs stats to time-series for growth tracking
- Triggers change alerts if significant changes detected

### Manual Refresh (50 credits):
- Re-runs Quick Analysis with latest data
- Regenerates report card with fresh thumbnails and transcripts
- Updates growth trends and upload schedule

### Subscriber Growth Tracking:
- Each monthly auto-refresh logs: subscriber count, video count, total views, latest upload date
- Stored as time-series array in DynamoDB
- Research Board card shows sparkline graph: subscriber trend over time
- Report card includes growth rate: "Gaining ~2,500 subs/month" or "Plateaued at ~45K for 3 months"
- Cross-comparison view includes growth rates side by side
- No extra credit cost — data comes from the free monthly refresh

---

## Connection to Other Modules

### → Style System:
- When building a channel Style, the Style generator reads all reference channels from the Research Board
- Reference analysis (thumbnails, titles, scripts, pacing) directly informs Style recommendations
- "Blend from references" is the default Style generation mode
- Tag analysis feeds into default tag strategy for the channel

### → Niche Finder:
- Niche Finder sends channels here via "Save to Research Board"
- Research Board sends content gaps back to inform topic suggestions
- Two-way relationship — discovery feeds analysis, analysis feeds strategy

### → Scripts / Projects:
- Content gaps detected by cross-comparison become topic suggestions in the Project wizard
- Reference channel analysis informs script structure: "Your references average 12-minute videos with 10 scenes, starting with a cold open hook"
- Saved video breakdowns can be used as templates: "Structure my script like this reference video"

### → Publishing:
- Reference channel posting patterns (upload schedule analysis) inform optimal posting time recommendations
- Tag analysis feeds into SEO tag generation

### → Notifications:
- Weekly monitoring alerts delivered via the notification system (bell icon + channel dashboard cards)
- Change alerts (upload spike, subscriber surge, rebrand) also via notifications

---

## Credit Costs

| Operation | Credits | Notes |
|---|---|---|
| Save + Quick Analysis (new channel) | 50 | Automatic on save. 10 thumbnails, 3 transcripts, patterns |
| Deep Analysis (user-triggered) | 150 | Full 30 thumbnails, 10 transcripts, top/bottom 5, gaps |
| Cross-Comparison (3+ channels) | 30 | Comparative analysis across all references |
| AI-Suggested Channels | 5 | Recommendation from existing reference data |
| Saved Video Analysis | 30 | Per video. Transcript + thumbnail + title + hook breakdown |
| Manual Refresh | 50 | Re-runs Quick Analysis with latest data |
| Weekly new video scan | 0 | Free — YouTube API metadata only |
| Weekly alert AI summary | 0 | Free — lightweight, we absorb cost |
| Monthly auto-refresh (data only) | 0 | Free — stats update, no GPT-4o |

---

## Limits by Tier

| | Starter | Creator | Pro | Agency |
|---|---|---|---|---|
| Reference channels per board | 3 | 5 | 5 | 5 |
| Saved videos per board | 10 | 25 | 25 | 25 |
| Research boards (one per channel) | 2 | 5 | 15 | Unlimited |
| Weekly monitoring alerts | Yes | Yes | Yes | Yes |

---

## Error Handling

- **YouTube channel not found:** "We couldn't find that channel. Check the URL and try again."
- **Channel is private:** "This channel's data isn't publicly available."
- **Transcripts unavailable:** Analysis proceeds with available data. Report notes what's missing.
- **GPT-4o analysis fails:** Show raw data (stats, thumbnails) without AI report card. Retry button.
- **YouTube API quota:** Queue analysis and process when quota available. Notify user of delay.
- **Reference channel deleted from YouTube:** Next refresh detects it. Marked "Channel Unavailable" with last-known data preserved.
- **Reference channel pivots content:** Change alert: "This channel pivoted from true crime to comedy 2 months ago — may no longer be a relevant reference."

---

## Edge Cases

- **Same channel saved to multiple boards:** Allowed — analysis is independent per board since it serves a different channel context.
- **User saves their own channel as a reference:** Allowed — useful for self-analysis. System doesn't flag this.
- **Reference channel has no English content:** Transcript analysis may fail. Falls back to title/thumbnail/metadata analysis. Report notes language limitation.
- **All reference channels in different niches:** Cross-comparison still runs but AI notes: "These channels are in very different niches. Cross-comparison may be less useful — consider saving channels in a more focused niche."

---

## Dependencies

- **YouTube Data API** — channel metadata, video metadata, thumbnails, tags
- **YouTube timedtext endpoint** — auto-generated captions for transcript access
- **GPT-4o** — report card generation, thumbnail analysis (Vision), transcript analysis, cross-comparison
- **Niche Finder** — discovery pipeline feeds channels to Research Board
- **Style System** — Research Board analysis directly informs Style generation
- **Notification System** — weekly monitoring alerts and change alerts
- **DynamoDB** — reference data storage, time-series growth data, user notes
- **Lambda** — background jobs for weekly scans and monthly refreshes

---

## Features NOT in v1 Launch (Future)

- Export research as PDF/shareable report
- Research Board templates (pre-populated boards for popular niches)
- Automated "style drift" detection (how a reference channel's style has changed over 6+ months)
- Cross-user intelligence: "Channels saved by users in your niche" (anonymized)
