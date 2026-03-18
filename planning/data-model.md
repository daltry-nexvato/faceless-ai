# Core Data Model & Hierarchy

## The Hierarchy (FINALIZED — v3)

```
Account (Cognito login)
  ├── YouTube Connections (OAuth links — can have multiple)
  │     ├── Read: channel info, analytics, comments, playlists, video data
  │     ├── Write: upload videos, manage metadata, manage thumbnails
  │     └── Synced: real-time data, historical data, comments for sentiment
  │
  ├── Research Boards (saved reference channels during research)
  │
  └── Channels (user can have many)
        ├── Status: DRAFT (no YouTube linked) or CONNECTED (YouTube linked)
        ├── YouTube Link: connected to a real YouTube channel (optional until publish)
        ├── Niche (from Niche Finder)
        ├── Reference Channels (1-5, saved from Research Board)
        ├── Style (BLENDED from references OR detected from existing content)
        │     ├── Voice: AI voice ID, tone, pacing
        │     ├── Visual Format: stock footage / animation / slideshow
        │     ├── Color Palette + Typography
        │     ├── Thumbnail Template: approach, colors, text style
        │     ├── Intro/Outro Structure
        │     ├── Music Mood + Caption Style
        │     ├── Video Length Target
        │     ├── Pacing/Rhythm
        │     ├── Script Tone + Hook Pattern
        │     └── Version History (evolves over time based on analytics)
        ├── Channel Report (full analytics dashboard per channel)
        └── Projects (individual videos — ALL inherit Style automatically)
```

## Key Clarifications
- Channel = 1:1 mirror of a real YouTube channel, enriched with our tools
- BUT channels can start as DRAFT (no YouTube connected yet) for planning
- Users MUST create YouTube channels themselves on YouTube (no API for this)
- YouTube connection happens at Account level, then linked to specific Channel
- One Account can have unlimited Channels
- Style is BLENDED from 1-5 reference channels (new channels) OR detected from existing content (established channels)
- Style is auto-generated but USER-EDITABLE after generation
- Style has VERSION HISTORY — evolves based on analytics over time
- Style affects EVERYTHING in every project under that Channel
- Niche defines WHAT you talk about, Style defines HOW you present it
- Same niche can have totally different styles (many-to-many)

## Channel States
- **DRAFT** — User is planning. Has niche, references, style. No YouTube connected. Can create projects but cannot publish.
- **CONNECTED** — YouTube channel linked via OAuth. Full functionality including publish. Real-time data sync active.

## YouTube OAuth Permissions
- Read channel info (name, avatar, banner, subscriber count)
- Read analytics (views, watch time, CTR, retention, traffic sources, demographics)
- Read comments (for sentiment analysis)
- Read playlists (for content organization)
- Read video data (all historical video performance)
- Upload videos
- Manage video metadata (titles, descriptions, tags)
- Manage thumbnails
- Manage playlists

## YouTube Data Sync Strategy
- Channel info: real-time sync, always current
- Subscriber count: real-time
- Video performance: pull historical data on connect, then real-time updates
- Comments: pull on connect, then real-time new comments
- Analytics: pull historical, then daily refresh
- Full channel report: generated from all synced data

## Flow: New Channel (Planning First)
1. User clicks "+ Add Channel"
2. Two paths: "Connect YouTube Channel" OR "Plan First (connect later)"
3. If planning first → DRAFT channel created
4. User researches niche via Niche Finder
5. User saves 1-5 reference channels to Research Board
6. Channel Builder: AI analyzes references, user picks patterns, blended Style generated
7. User can create projects and build videos
8. When ready to publish → "Connect YouTube" prompt
9. OAuth flow → channel becomes CONNECTED → publish enabled

## Flow: New Channel (Connect First)
1. User clicks "+ Add Channel" → "Connect YouTube Channel"
2. OAuth flow → Google account → select which YouTube channel
3. We pull in all channel data (name, avatar, videos, analytics, comments)
4. AI analyzes existing content → auto-detects niche and generates Style
5. User confirms or overrides niche and style
6. Channel is CONNECTED from the start → full functionality

## Flow: Existing Channel With Content
1. Connect via OAuth (same as above)
2. AI deep-analyzes all existing videos (thumbnails, titles, scripts, performance)
3. Generates a Style based on what the channel already does
4. Shows: "Here's the style we detected. Keep it or customize?"
5. User tweaks if wanted
6. Full historical analytics immediately available
7. Channel report generated with insights and recommendations

## Flow: Outlier → Project (within existing Channel)
- User spots an outlier video in their niche
- Clicks "Create Video From This"
- Pre-fills a new project with that video's topic/angle
- Style stays consistent with the Channel's style (NOT overridden)

## AI Integration Throughout
- Reference channel analysis: automated (thumbnails, transcripts, patterns)
- Existing channel detection: AI detects niche + generates style from user's own content
- Style generation: AI-recommended blend with conflict flagging
- Per-project: Style silently drives all AI prompts (scripts, images, thumbnails, SEO)
- Post-publish: Analytics suggest Style evolution over time
- Research Board: AI produces channel report cards, cross-comparisons, red flags
- Channel Reports: full AI-powered analytics dashboards per channel
