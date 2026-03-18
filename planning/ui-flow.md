# UI Flow / System Workflow

## Navigation Structure

### Global Level (always accessible)
Left sidebar when NOT inside a channel:
- **Overview** — Dashboard with all-channel stats, filterable by channel
- **Channels** — List of all channels with detailed cards
- **Media Library** — Global uploaded/generated assets (any channel can use)
- **Generate** — Standalone image/video/voiceover/music/thumbnail generator
- **Niche Finder** — Research tool (independent of any channel)
- **Settings** — Account settings, billing, platform connections
- **Notifications** — Bell icon in top bar (global)

### Channel Level (inside a channel workspace)
Left sidebar when inside a channel:
- **Dashboard** — Channel overview, quick stats, AI insights
- **Projects** — All videos for this channel
- **Niche Finder** — Scoped to this channel's niche
- **Research Board** — Saved reference channels
- **Style** — View/edit the channel's style profile
- **Analytics** — Full channel report (if YouTube connected)
- **Schedule** — Content calendar, upcoming publishes
- **Publishing** — Publishing settings, social connections
- **Settings** — Channel-specific settings

**Channel Switcher** — Dropdown in top bar to jump between channels
**Back to Dashboard** — Arrow to return to global view

---

## Screen-by-Screen Flow

### Pre-Login
- Landing page (marketing site)
- Sign up / Log in (Cognito — email+password, Google OAuth, Apple)

### First-Time Onboarding
1. "Welcome. Let's set up your first channel."
2. Two paths as big cards:
   - "I have a YouTube channel" → OAuth → Pull data → AI detects niche+style → Confirm
   - "I'm planning a new channel" → DRAFT channel → Niche Finder → Research Board → Style Builder

### Dashboard (Home)
- Filter: All Channels or specific channel
- Stats cards: Total subs, total videos, views today, subs today
- Channel cards: avatar, name, status (CONNECTED/DRAFT), subs, projects, trend indicator
- "+ Add Channel" card always visible
- Recent Activity feed (all channels)
- AI Insights (cross-channel)
- Notifications

### Channels Page
- Detailed view of all channels
- Per channel: avatar, name, subs, video count, niche, platform connections, weekly stats
- AI recommendation per channel
- "Enter" button to go into channel workspace

### Add Channel Flow
1. "+ Add Channel" clicked
2. Two paths: "Connect YouTube Channel" OR "Plan First (connect later)"
3. **Connect first path:**
   - OAuth flow → Google account → Select YouTube channel
   - Pull all data (name, avatar, videos, analytics, comments)
   - AI analyzes existing content → detects niche + generates Style
   - User confirms or overrides → CONNECTED channel created
4. **Plan first path:**
   - DRAFT channel created with placeholder name
   - Guided into Niche Finder → Research Board → Channel Builder → Style
   - Can create projects but cannot publish
   - "Connect YouTube" prompt when ready to publish

### Channel Workspace — Dashboard
- Channel name + avatar + status badge
- Quick stats (subs, views, CTR, retention)
- Recent projects with status
- AI suggestions (topic ideas, style tweaks, niche alerts)
- "Connect YouTube" button if DRAFT

### Channel Workspace — Projects
- List of all projects with status indicators
- Status flow: TOPIC → SCRIPT → VOICE → VISUALS → EDIT → PUBLISH
- "+ New Project" button
- AI topic suggestions

### Channel Workspace — Project Wizard
Pipeline steps (each is a screen):
1. **Topic** — AI suggests topics from niche trends, content gaps, outliers. User can type own.
2. **Template** — Pick a script template (educational, listicle, documentary, short-form, etc.)
3. **Script** — AI generates using template structure + Style + retention rules. Scene-by-scene editing.
4. **Voiceover** — ElevenLabs generates voice from script. Preview, regenerate scenes, pick voice.
5. **Visuals** — Per scene: AI generates images/video via fal.ai OR user uploads OR stock from Pexels/Pixabay. Style drives visual direction.
6. **Editing** — Assembled preview. Captions, music, transitions, intro/outro. Adjust timing, styles.
7. **Publishing** — Title, description, tags (AI-generated), thumbnail (AI-generated), schedule or publish. Pick YouTube channel + social accounts.

Each step shows:
- Progress bar at top
- AI notes on how Style influenced this step
- Navigate back to any step
- "Regenerate" on every AI element
- Quality check warnings inline

### Channel Workspace — Niche Finder (Scoped)
- Same as global Niche Finder but filtered to this channel's niche
- "Create Video From This" on outliers (pre-fills new project)
- Ongoing niche monitoring and alerts

### Channel Workspace — Research Board
- Grid of saved reference channels (1-5)
- Each card: AI report card (strengths, weaknesses, what to copy, avoid)
- Cross-comparison view when 3+ saved
- "Add Reference" to save new channels from Niche Finder

### Channel Workspace — Style
- Full style profile with all fields editable
- Version history (see past styles, revert)
- AI suggestions based on analytics
- Preview: "Here's how your next video would look with this style"

### Channel Workspace — Analytics
- Full channel report (YouTube connected only)
- Views, watch time, CTR, retention, traffic sources, demographics
- Comment sentiment analysis
- Per-video performance breakdown
- AI insights: "Videos with question titles get 3x more views"
- Comparison to niche averages

### Channel Workspace — Schedule
- Calendar view of upcoming publishes
- Drag-and-drop scheduling
- AI-recommended posting times based on niche data

### Channel Workspace — Publishing
- YouTube connection management
- Social media connections (Instagram, TikTok, X, Facebook) — assigned from account-level pool
- Default publishing settings

### Global Media Library
- All generated and uploaded media across all channels
- Filterable by type (image, video, voiceover, music, thumbnail)
- Filterable by channel or "unassigned"
- Search by name, date, tags
- Upload button for user's own media
- Each item shows: preview, source (generated/uploaded/stock), which projects use it

### Standalone Generator
- Not tied to any project or channel
- Generate: images, videos, voiceovers, music, thumbnails
- Saves to Global Media Library
- Creative sandbox for experimentation

### Account Settings
- Profile (name, email, password)
- YouTube connections (OAuth management)
- Social media connections (OAuth management)
- Google Drive connection
- Billing / subscription (Stripe)
- Notification preferences

### Notifications (3 Layers)
1. **Global bell** (top bar): Cross-channel alerts, milestones, account alerts
2. **Channel dashboard cards**: AI insights, content suggestions, style recommendations
3. **Inline project alerts**: Quality checks, style compliance, SEO warnings

---

## Key UX Decisions
- Channel switcher in top bar (like Slack workspace switcher)
- Dashboard filters between all channels and individual
- DRAFT channels show persistent "Connect YouTube" prompt
- AI suggestions appear everywhere but are never mandatory
- Every AI-generated element has "Regenerate" and manual edit options
- Progress saved automatically — user can leave and return to any project step
