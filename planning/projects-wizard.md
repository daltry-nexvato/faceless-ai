# Projects / Wizard Module — Finalized Spec

## What This Module Does

The Projects/Wizard module is the **orchestration layer** — the step-by-step flow for creating a video, project lifecycle management, and the project list experience. It doesn't re-define what each content step does (those are in Scripts, Voiceovers, Images, Video Generation, Editing/Music, Publishing modules). It defines how users move through them.

**Responsibilities:**
- The project wizard (7-step video creation flow)
- Project creation (5 entry points)
- Project list and management (Projects page inside channel workspace)
- Project-level settings and overrides
- Navigation between wizard steps (forward, backward)
- Progress tracking and auto-save
- State machine orchestration (18 states from platform-systems.md)
- Concurrent project limits by tier
- Project duplication (light and deep), archival, deletion
- Post-publish project experience
- First project guided mode
- Credit cost estimation during the wizard
- Content Calendar relationship

---

## Project Creation — Five Entry Points

### 1. New Project (blank)
- User clicks "+ New Project" from the channel's Projects page
- Lands on Step 1 (Topic) with an empty slate
- AI suggests topics based on channel's niche, content gaps, trending searches, reference channel activity
- Style is pinned (snapshot copy from channel's current Style)
- User picks format: Long-Form or Shorts (changeable until Step 3)

### 2. From Outlier ("Create Video From This")
- User finds an outlier video in Niche Finder or Research Board
- Clicks "Create Video From This"
- Project created with topic pre-filled from the outlier's subject
- AI pre-fills: suggested angle (differentiation from original), reference data (hook structure, length, key points)
- Lands on Step 1 with topic set — user confirms or adjusts
- Cost: 20 credits (transcript pull + GPT-4o analysis)

### 3. From Batch Generation
- User clicks "Batch Generate Topics" on the Projects page (next to "+ New Project")
- Picks how many outlines (2-10), optionally provides a theme/focus area
- AI generates that many topic **outlines** (topic + template + scene structure with brief descriptions)
- Each outline becomes a separate project in TOPIC_SELECTED state
- User reviews the batch, opens the ones they like, archives the rest
- Cost: 10 credits per outline
- User then opens each project individually and triggers full script generation in Step 3

### 4. Duplicate Existing Project
Two options:

**Light Duplicate:**
- Copies: topic, template, project settings, Style snapshot, format
- Does NOT copy: script, voiceover, visuals, editing, publishing metadata
- Result: TOPIC_SELECTED state — regenerate everything fresh
- Use case: "Same format, different topic"
- Cost: Free

**Deep Duplicate:**
- Copies: EVERYTHING — full script, voiceover references, visual selections, timeline configuration, music choices, caption settings, publishing metadata template
- S3 assets are **referenced** (not copied) — same files, new project record. Storage only increases when user regenerates specific content.
- Result: EDITING state with render marked as "stale — needs re-render after changes"
- Published metadata copied but marked as draft (prevents accidentally publishing with same title)
- Only available for projects at SCRIPT_APPROVED or later
- Use case: "Weekly series episode — same structure, change specific content per scene"
- Cost: Free (credits only consumed when user regenerates content)

### 5. Short-Form Variant
- From a completed or in-progress long-form project, user clicks "Create Shorts Version"
- AI analyzes the long-form script, ranks 3-5 potential Short excerpts by predicted engagement
- Each excerpt shows: which scenes, estimated duration, why it would work
- User picks one or lets AI choose top recommendation
- New Shorts project created with selected segment restructured into a Shorts script template
- Style snapshot includes Shorts Override applied
- Cost: 10 credits (GPT-4o analysis of existing content, no external data fetch)

---

## The Wizard — Seven Steps

Each step is a full-screen view with a progress bar at the top showing all 7 steps.

### Step 1: Topic
- AI topic suggestions (from niche trends, content gaps, reference activity, seasonal relevance)
- Manual entry: user types their own topic
- Topic research button: deep-dive into potential (10 credits — search volume, competition, angles)
- SEO potential score: quick searchability indicator
- Format toggle: Long-Form / Shorts (changeable here — see Format Rules below)
- "From Outlier" data shown here if project came from that path
- On confirm: project state → TOPIC_SELECTED

### Step 2: Template
- Pick a script structure template (educational, listicle, documentary, story, how-to, comparison, reaction, short-form, etc.)
- Templates filtered by format (long-form templates vs Shorts templates)
- Each template shows: structure preview, typical length, example outline
- AI recommends based on topic + Style
- Format toggle still available (changeable here)
- Template selection is free (no credits)
- On confirm: state stays TOPIC_SELECTED (template is part of topic setup)

### Step 3: Script
- Full script generation and editing (defined in scripts.md)
- Dual-script: Narrator Script + Scene Script
- Scene-by-scene editor
- Chunked generation for long videos
- **Format locked from this point forward** (format toggle disappears)
- On approve: project state → SCRIPT_APPROVED

### Step 4: Voiceover
- Voice selection and generation (defined in voiceovers.md)
- Per-scene generation with preview
- Multi-voice support per Style
- Pronunciation dictionary applied
- **"No Voiceover" option** for text-only formats (common for Shorts):
  - System generates synthetic timing data from script's `estimated_duration` per scene
  - Editing timeline has no voiceover waveform — just visual track, music, captions, SFX
  - Captions rendered from narrator script text, timed by estimated duration (text overlays without voice audio)
  - State still transitions to VOICEOVER_APPROVED
- On approve: project state → VOICEOVER_APPROVED

### Step 5: Visuals
- Image and video clip generation/selection (defined in images.md and video-generation.md)
- Auto-fill pipeline available
- 4 visual sources: AI generate, stock, upload, external prompts
- Visual Anchors from Style applied automatically
- Thumbnail generation (preliminary — refined in Step 7)
- **Partial completion allowed:** user can leave some slots empty and move to Step 6. Editor shows placeholders for unfilled slots. User can fill them from editing view or come back.
- On approve: project state → VISUALS_APPROVED

### Step 6: Editing
- Timeline assembly (defined in editing-music.md)
- Music generation, captions, transitions, intro/outro, SFX
- Color grading, Ken Burns settings
- Full preview playback
- On approve and render trigger: project state → RENDERING → RENDER_COMPLETE

### Step 7: Publishing
- Title, description, tags, thumbnail finalization (defined in publishing.md)
- SEO generation, auto-chapters, caption upload
- YouTube category, Made for Kids, comments, language
- Schedule or publish immediately
- Readiness checklist (13 items from platform-systems.md)
- On publish: project state → PUBLISHING → PUBLISHED

---

## Wizard Navigation Rules

### Forward
- Each step has "Continue" or "Approve & Continue" button
- Can only advance when current step's requirements are met
- Step 7 has publish/schedule buttons instead of "Continue"

### Backward
- User can click any completed step in the progress bar to go back
- Going back does NOT delete downstream work — it's preserved
- Editing a previous step marks downstream steps as "needs review" (dirty flag)
- System shows exactly what needs regeneration: "Changing 3 scenes will require regenerating voiceover for those scenes and re-filling 8 visual slots"
- Unchanged scenes keep their existing voiceover and visuals
- Cost warning for expensive invalidation (especially AI video clips)

### Step Order
Steps must be completed in order: Topic → Template → Script → Voiceover → Visuals → Editing → Publishing

**No skipping.** Each step depends on the previous step's output (script structure drives voiceover timing, voiceover timing drives visual slot duration, visuals + voiceover drive editing timeline).

**One exception — Visuals partial completion:** Within Step 5, user can leave visual slots empty and proceed to Step 6. Editor shows placeholders. User fills them from within the editor or goes back to Step 5.

### Jump
From the Projects list, user can jump directly into any step that's been reached. If a project is at VISUALS_APPROVED, user clicks it and lands on Step 6 directly.

---

## Project Format: Long-Form vs Shorts

### Format Toggle
- Available in Steps 1 and 2 (before any content generation)
- **Locked from Step 3 onward** (script structure is format-dependent)
- Switching format in Step 1: AI topic suggestions refresh for selected format
- Switching format in Step 2: template options change to format-appropriate list. Previous template selection resets.
- Style snapshot updates: Shorts → Shorts Override applied. Long-Form → base Style used.

### Format Differences

| Aspect | Long-Form | Shorts |
|---|---|---|
| Target length | 5-60+ minutes | 15-60 seconds |
| Template options | All templates | Shorts-specific templates only |
| Script structure | Full scene-by-scene with sections | Compact: hook + body + CTA |
| Voiceover | Full narration (or "No Voiceover") | Short narration or "No Voiceover" (text-only common) |
| Visuals | Multiple scenes, varied sources | 3-10 fast-paced visuals |
| Editing | Full timeline with music + SFX | Quick cuts, trending music, bold captions |
| Publishing | Full metadata + chapters + end screens | Short title, hashtags, no chapters |
| Style applied | Base Style | Base Style + Shorts Override |

If user wants a Shorts version of a long-form project after script generation: use "Create Shorts Version" (creates a new project).

---

## State Machine — Full Transition Rules

### State Triggers

| State | Triggered When |
|---|---|
| DRAFT | Project created, no actions taken |
| TOPIC_SELECTED | User confirms topic in Step 1 (click "Continue") |
| SCRIPTING | User clicks "Generate Script" in Step 3 (background job starts) |
| SCRIPT_APPROVED | User clicks "Approve Script" in Step 3 |
| VOICEOVER_IN_PROGRESS | User clicks "Generate Voiceover" in Step 4 (job starts) |
| VOICEOVER_APPROVED | User clicks "Approve Voiceover" OR selects "No Voiceover" in Step 4 |
| VISUALS_IN_PROGRESS | User clicks "Auto-Fill Visuals" or starts generating in Step 5 |
| VISUALS_APPROVED | User clicks "Approve Visuals" in Step 5 |
| EDITING | User enters Step 6 for the first time |
| RENDERING | User clicks "Render" in Step 6 (job starts) |
| RENDER_COMPLETE | Render job finishes successfully |
| READY_TO_PUBLISH | All 13 readiness checklist items met in Step 7 |
| SCHEDULED | User sets a publish date in Step 7 |
| PUBLISHING | Upload job starts (at scheduled time or "Publish Now") |
| PUBLISHED | Upload completes successfully |
| RENDER_FAILED | Render job fails |
| PUBLISH_FAILED | Upload job fails |
| ARCHIVED | User archives the project |

### Manual Editing Path (No AI Generation)
If a user manually completes a step without triggering AI generation, the "in progress" state is skipped:

| Scenario | State Path |
|---|---|
| AI generates script | TOPIC_SELECTED → SCRIPTING → SCRIPT_APPROVED |
| User writes script manually | TOPIC_SELECTED → SCRIPT_APPROVED |
| AI generates voiceover | SCRIPT_APPROVED → VOICEOVER_IN_PROGRESS → VOICEOVER_APPROVED |
| User uploads own voiceover | SCRIPT_APPROVED → VOICEOVER_APPROVED |
| User selects "No Voiceover" | SCRIPT_APPROVED → VOICEOVER_APPROVED |
| AI auto-fills visuals | VOICEOVER_APPROVED → VISUALS_IN_PROGRESS → VISUALS_APPROVED |
| User uploads all visuals manually | VOICEOVER_APPROVED → VISUALS_APPROVED |

"In progress" states only exist when a background job is running. Manual completion skips them.

### Re-generation State Reversion
If a user goes back and re-generates, the state reverts to the "in progress" state for that step. E.g., re-generating voiceover: state reverts to VOICEOVER_IN_PROGRESS.

---

## Credit Cost Estimation

### Pre-Wizard Estimate
Shown at project creation based on format + Style settings:
- "Estimated cost for a standard 10-minute video: ~1,000-1,200 credits"
- "Estimated cost for a Shorts video: ~150-250 credits"
- Shows: "You have 45,000 credits remaining this month"

### Running Total During Wizard
Top bar element (next to credit balance):
- Accumulates as each step consumes credits
- Shows: "This project so far: 550 credits spent | ~500-700 remaining estimated"
- Updates after each generation step

### Pre-Generation Confirmation
- Operations over 100 credits show confirmation: "This will cost ~X credits. You have Y remaining. Continue?"
- Operations under 100 credits execute without confirmation
- User can disable confirmations in project settings ("Don't ask me about credit costs" toggle)
- Hard block still prevents spending more credits than available regardless of toggle

---

## Post-Publish Project Experience

### What Users Can Do With a PUBLISHED Project

| Action | Supported | Method |
|---|---|---|
| Edit YouTube metadata (title, description, tags) | Yes | Via YouTube API — changes reflected immediately |
| Swap thumbnail | Yes | Upload new thumbnail via YouTube API |
| View performance analytics | Yes | From YouTube sync data (views, CTR, retention, comments) |
| Add/edit end screens and cards | Yes | Via YouTube API |
| View wizard content (read-only) | Yes | See the script, voiceover, visuals, timeline used |
| Re-edit and re-render | Yes | Opens wizard in edit mode, creates new render version |
| Delete from YouTube | No | Link to YouTube Studio — we never delete user content |
| View in content calendar | Yes | Shows as published with date |

### Post-Publish Dashboard
Project card shows "Published" badge with publish date and YouTube link. Click to open:
- Performance metrics (views, CTR, retention, likes, comments from sync)
- "Edit Metadata" button (title, description, tags, thumbnail — live via API)
- "View in YouTube Studio" link
- "Re-edit Video" button (opens wizard in edit mode)
- Comment highlights (top comments, sentiment summary)

### Re-Edit Mode
- Opens wizard with all content populated (script, voiceover, visuals, timeline)
- User can modify any step — changes tracked as a new revision
- On re-render: new video file created
- Two options:
  - **"Upload as new video"** — uploads to YouTube as a separate video (new URL, new video ID)
  - **"Save locally only"** — keeps new render in S3 for comparison or future use
- Note: YouTube API does not support replacing a video file while keeping the same URL. To replace the file, user must use YouTube Studio directly. Platform provides a direct link.
- Credit cost: only for regenerated content (edited scenes, new voiceover for changed scenes)

---

## DRAFT Channel — Step 7 Handling

When a project on a DRAFT channel reaches Step 7 (Publishing):

- All publishing metadata fields are editable (title, description, tags, thumbnail, etc.)
- User fills everything in as preparation
- Readiness checklist shows all items except "YouTube channel connected" as unchecked
- Publish/Schedule buttons **disabled** with clear message:
  - "Connect YouTube to publish this video"
  - "Connect YouTube" button inline (goes to channel connection settings)
  - **"Save as Ready"** button — saves metadata, marks project as READY_TO_PUBLISH
- When YouTube is connected: page refreshes, publish buttons become active
- Notification on connection: "You have 3 projects ready to publish. Schedule them now?"

---

## Project List (Channel Workspace → Projects Page)

### List View
- Cards: title (or "Untitled"), thumbnail preview, current wizard step, last edited, state badge
- Sort: Last edited (default), created date, alphabetical, state
- Filter: All / In Progress / Scheduled / Published / Archived
- Search by title/topic
- "Batch Generate Topics" button (next to "+ New Project")

### State Badges (Simplified from 18 states)
- **DRAFT** (gray) — just created
- **IN PROGRESS** (blue) — TOPIC_SELECTED through VISUALS_APPROVED
- **RENDERING** (orange, animated) — render in progress
- **READY** (green) — RENDER_COMPLETE or READY_TO_PUBLISH
- **SCHEDULED** (purple) — publish date set
- **PUBLISHED** (green checkmark) — live on YouTube
- **FAILED** (red) — RENDER_FAILED or PUBLISH_FAILED
- **ARCHIVED** (muted) — hidden from default view

### Quick Actions Per Project
- Open (goes to current wizard step)
- Duplicate (Light or Deep)
- Create Shorts Version (if long-form and has script)
- Archive
- Delete (with confirmation)
- View on YouTube (if published)

### Bulk Actions
- Select multiple → Archive / Delete / Export metadata
- No bulk generation (each project goes through wizard individually)

---

## Project-Level Settings and Overrides

Each project inherits the channel's Style. Specific settings can be overridden per project:

### Overridable
- Target video length
- Voice selection (different voice for this video)
- Visual style tier (use Premium even if Style defaults to Standard)
- Music mood
- Aspect ratio

### NOT Overridable (channel-level only)
- Color palette (visual consistency across channel)
- Font/typography
- Thumbnail template approach (brand consistency)
- SEO title pattern

### Where Overrides Are Set
- "Project Settings" gear icon accessible from any wizard step
- Shows: "Channel Default: [value] | This Project: [override or 'Using channel default']"
- Stored in the project record alongside the pinned Style snapshot

---

## Content Calendar Relationship

The Content Calendar (Schedule page in channel workspace) and the Projects page are **two different views of the same data**.

### Projects Page (list view)
- Shows ALL projects regardless of schedule status
- Primary workspace for managing projects — open, duplicate, archive

### Content Calendar (Schedule page — per channel)
- Shows projects on a calendar timeline
- Scheduled projects on their scheduled date
- Published projects on their publish date
- In-progress projects as floating items in a "Not yet scheduled" sidebar
- Drag-and-drop scheduling: drag unscheduled project to a date
- AI recommended posting times shown as highlighted calendar slots
- Shorts vs long-form badges (different colors)
- Credit estimate for unfinished projects (monthly budget planning)
- Conflict detection: "You have 3 videos scheduled for Tuesday — consider spreading them out"

### Global Calendar Widget (Overview Dashboard)
- Shows upcoming scheduled publishes across ALL channels
- Each entry: project title, channel name, scheduled date, format badge
- Color-coded by channel
- "Upcoming This Week" / "Upcoming This Month" widget (not a full calendar)
- Click any entry → goes to that project in its channel workspace
- Full calendar with drag-and-drop stays per-channel only

---

## Concurrent Project Limits

| Tier | Concurrent Active Jobs |
|---|---|
| Starter | 2 |
| Creator | 5 |
| Pro | 10 |
| Agency | 25 |

"Concurrent" means projects with **active background jobs** (generating, rendering, uploading). Projects sitting idle in the wizard don't count — only projects actively consuming compute resources.

When limit hit: "You have X active jobs running. Wait for one to complete, or upgrade for more concurrent projects."

---

## Project Archival

- Hidden from default Projects list (visible with "Archived" filter)
- All data preserved (script, voiceover, visuals, rendered video)
- Can be unarchived at any time
- S3 files follow standard lifecycle (intermediate files deleted after 30 days of archival, final video kept)
- Published videos remain on YouTube regardless

### Abandoned Project Auto-Archive
- Projects untouched for **90 days** in early states (DRAFT, TOPIC_SELECTED): auto-archived
- Projects untouched for **180 days** in later states (SCRIPTING through RENDER_COMPLETE): auto-archived
- PUBLISHED and SCHEDULED projects: never auto-archived
- RENDER_FAILED and PUBLISH_FAILED untouched for 90 days: auto-archived
- 7 days before auto-archive: notification: "Your project [name] hasn't been edited in X days. We'll archive it in 7 days. You can unarchive anytime."
- S3 cleanup: generated assets for auto-archived projects follow standard lifecycle (intermediate files deleted 30 days after archival)
- DynamoDB records kept indefinitely (tiny — ~1-5KB each)

---

## Project Deletion

- Confirmation required
- **Immediate** deletion of DynamoDB records (no grace period — individual videos are less critical than channels)
- S3 files queued for background cleanup
- Published videos remain on YouTube
- Scheduled publishes cancelled with notification
- Deep duplicate references to deleted project's S3 assets: if another project references the same files, files are NOT deleted (reference counting)

---

## First Project Guided Mode

For the first project a user creates (detected by onboarding checklist):

- Each wizard step shows extra guidance tooltips:
  - Step 1: "AI is suggesting topics based on your niche. Pick one or type your own."
  - Step 2: "Pick a structure template. AI recommends one based on your topic and Style."
  - Step 3: "Your Style shapes how this script sounds — notice the [tone] and [hook pattern]."
  - Step 4: "Preview the voiceover per scene. Adjust pace or regenerate any scene."
  - Step 5: "Auto-fill reads your script and fills visual slots. Review and swap any."
  - Step 6: "This is your editing timeline. Preview the assembled video and fine-tune."
  - Step 7: "AI generated your title, description, and tags. Review and publish."
- Dismissible permanently via "I've got it, stop showing tips"
- After first project published, guided mode never appears again
- Updates onboarding checklist: "Create your first project" step

---

## Progress Tracking and Auto-Save

### Auto-Save
- Every change auto-saved to DynamoDB within 5 seconds of last edit
- No manual "save" button — always saved
- If browser crashes: user returns to exactly where they left off
- Includes: script edits, visual selections, timeline adjustments, metadata

### Progress Indicator
Each step in progress bar shows status:
- ○ Not started (gray)
- ◐ In progress (half-filled, blue)
- ● Complete (filled, green)
- ⚠ Needs review (yellow — downstream of a changed step)
- Hovering shows: last edited timestamp, completion percentage

### Background Jobs
- Long-running operations run server-side (Lambda/Fargate)
- User can navigate away — jobs continue
- Notification when complete
- Job queue indicator in top bar shows active jobs across all projects

---

## Credit Costs (Projects/Wizard Module)

| Operation | Credits | Notes |
|---|---|---|
| Project creation | 0 | Free |
| From Outlier creation | 20 | Transcript pull + GPT-4o analysis |
| Batch topic outline | 10 per outline | GPT-4o generates topic + scene structure |
| Short-Form Variant analysis | 10 | GPT-4o analyzes long-form, recommends excerpts |
| Light duplicate | 0 | Just data copy |
| Deep duplicate | 0 | S3 references, no generation |
| All content generation | Per module | Scripts, voiceovers, images, video, editing, music — see billing.md |

---

## Connection to Other Modules

| Module | How Projects/Wizard Connects |
|---|---|
| **Channel Builder** | Projects live under channels. Channel must have Style before project creation. |
| **Style System** | Style snapshot pinned at creation. Drives all AI generation. Project overrides on top. |
| **Scripts** | Step 3. Script module does generation; wizard provides UI container. |
| **Voiceovers** | Step 4. Same pattern. "No Voiceover" option generates synthetic timing. |
| **Images** | Step 5. Same pattern. Visual Anchors from Style applied. |
| **Video Generation** | Step 5 (video clips mixed with images). |
| **Editing/Music** | Step 6. |
| **Publishing** | Step 7. Also manages post-publish metadata editing. |
| **Platform Systems** | State machine (18 states), cascade invalidation, job queue, concurrent limits, content calendar. |
| **Billing** | Credits consumed per step. Concurrent limit by tier. Credit estimator throughout wizard. |
| **Notifications** | Job completion, render complete, publish complete, schedule reminders, abandoned project warnings. |
| **Niche Finder** | "Create Video From This" creates project. Topic suggestions use niche data. |
| **Research Board** | "Create Video From This" on saved videos creates project. |
| **Media Library** | Generated assets saved to channel media. User can pull from library into visual slots. |

---

## Error States

- **Render fails:** RENDER_FAILED. "Retry" button. After retry fails: "Try simplifying editing or contact support."
- **Publish fails:** PUBLISH_FAILED. Show specific YouTube error. "Retry" or "Edit and retry."
- **Credit exhaustion mid-wizard:** Operation stops at last successful point. Work saved. "You've run out of credits. Upgrade or buy more to continue."
- **Style deleted after pinning:** No impact — snapshot copy is self-contained.
- **Channel DISCONNECTED mid-publish:** Upload aborts. PUBLISH_FAILED. "YouTube connection lost. Reconnect and retry."
- **Channel is DRAFT at Step 7:** Publish disabled. "Connect YouTube" prompt + "Save as Ready" option.
