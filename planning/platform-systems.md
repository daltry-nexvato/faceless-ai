# Platform Systems — Cross-Cutting Concerns

These are systems that span multiple modules. Identified during the full-platform audit.

---

## 1. Project State Machine

Every project has a formal state. Valid transitions defined below.

### States:
| State | Description |
|---|---|
| DRAFT | Project created, no work started |
| TOPIC_SELECTED | Topic chosen, ready for script |
| SCRIPTING | Script being generated/edited |
| SCRIPT_APPROVED | Script locked, ready for voiceover |
| VOICEOVER_IN_PROGRESS | Voiceover being generated |
| VOICEOVER_APPROVED | Voiceover locked, ready for visuals |
| VISUALS_IN_PROGRESS | Images/video being generated/selected |
| VISUALS_APPROVED | All visual slots filled and approved |
| EDITING | Final assembly, music, captions, transitions |
| RENDERING | Video being rendered on ECS Fargate |
| RENDER_COMPLETE | Video rendered, ready for review |
| READY_TO_PUBLISH | All checks passed, publish button enabled |
| SCHEDULED | Publish date set, waiting for schedule |
| PUBLISHING | Upload to YouTube in progress |
| PUBLISHED | Live on YouTube |
| RENDER_FAILED | Rendering failed — retry available |
| PUBLISH_FAILED | YouTube upload failed — retry available |
| ARCHIVED | User archived the project (data preserved) |

### Backward Navigation Rules:
- User can go back to any previous step from the wizard
- Going back marks all downstream steps as "needs review" (dirty flag)
- System shows exactly what will need regeneration: "Changing 3 scenes will require regenerating voiceover for those scenes and re-filling 8 visual slots"
- Unchanged scenes keep their existing voiceover and visuals
- Only changed scenes trigger downstream regeneration

### Cascade Invalidation:
| If you change... | These become invalid... |
|---|---|
| Topic | Script, voiceover, visuals, everything |
| Script (any scene) | Voiceover for that scene, visuals for that scene |
| Script (add/remove scenes) | All voiceover, all visuals |
| Voiceover settings | Voiceover for affected scenes, timing-dependent visuals |
| Visual slots | Nothing downstream (visuals are the last creative step) |
| Style | Warning only — existing projects stay pinned to their version |

### Cost Warning for Video Clips:
- When invalidation would affect scenes containing AI video clips, system shows the credit cost: "This change will invalidate 3 AI video clips. Regenerating them will cost ~450 credits."
- User can choose: regenerate all, regenerate selectively, or swap video clips for cheaper still images

---

## 2. Credit System (Rate Limiting)

The credit system (defined in billing.md) IS the rate limiting system:
- Each operation costs credits
- Users can't exceed their tier's monthly credit cap
- Credits tracked in real-time in DynamoDB
- Failed operations refund credits automatically
- UI shows remaining credits in top bar

### Abuse Prevention:
- **Daily burst limit:** No more than 20% of monthly credits in a single day (prevents someone burning all credits in one session then complaining)
- **Concurrent operation limit:** Max concurrent AI generations per tier (Starter: 2, Creator: 5, Pro: 10, Agency: 25)
- **Admin alerts:** Notify admin if any user burns >50% of credits in 24 hours
- **Automatic suspension:** If a single user's API costs exceed 3x their tier price in a day, pause their account and alert admin (likely abuse or runaway process)

---

## 3. Job Queue + Progress System

Every long-running operation creates a "job" with tracking.

### Job Types:
- Script generation (scene-by-scene, ~30 seconds to 5 minutes)
- Voiceover generation (scene-by-scene parallel, ~1-5 minutes)
- Image auto-fill (batch generation, ~1-3 minutes)
- Video clip generation (~2-10 minutes per clip)
- Video rendering (~3-15 minutes depending on length)
- YouTube upload (~1-5 minutes depending on size)

### How It Works:
1. User triggers operation → job created in DynamoDB with status PENDING
2. Job moves to IN_PROGRESS with progress percentage
3. **Real-time updates:** WebSocket connection pushes progress to UI (polling as fallback)
4. User can navigate away — job continues in background
5. When complete: notification (bell icon in UI + optional email)
6. Job stays in history for 30 days (user can review past operations)

### UI Elements:
- **Progress bar** in the wizard step being processed
- **Job queue indicator** in top bar (shows count of active jobs)
- **Background jobs panel** accessible from anywhere (like a download manager)
- Each job shows: type, progress %, estimated time remaining, cancel button

### Navigate Away Behavior:
- All jobs persist server-side (DynamoDB + Lambda/Fargate)
- User can close browser — job completes regardless
- Return to project → see completed results or current progress
- Multiple projects can have active jobs simultaneously (within concurrent limit)

---

## 4. Error Recovery

### Per-Module Error Handling:

**Script Generation:**
- If one scene fails: show all successful scenes, retry button on failed scene only
- If outline generation fails: retry with different prompt, fall back to simpler template

**Voiceover Generation:**
- If one scene fails: show all successful scenes, retry failed scene
- If ElevenLabs is down: queue-and-retry (background) or fallback to OpenAI TTS (urgent)
- If voice clone fails quality check: notify user, suggest uploading cleaner audio

**Image Generation:**
- If one image fails: show placeholder, retry button, or switch to stock search
- If fal.ai is down: queue-and-retry (images can wait, not urgent)
- Stock search fails: auto-generate AI image using the stock query as a prompt

**Video Rendering:**
- If Fargate task crashes: auto-retry once from the last completed scene
- If retry fails: notify user with friendly message + "Try Again" button
- Rendering is idempotent — same inputs always produce same output

**YouTube Upload:**
- If upload fails: auto-retry up to 3 times with exponential backoff
- If YouTube API returns auth error: prompt user to re-authenticate
- If YouTube returns policy violation: show the specific violation, suggest fixes

### User-Facing Error Messages:
- NEVER show raw API errors (no "500 Internal Server Error")
- Always show: what happened + what the user can do about it
- Examples:
  - "Scene 7 voiceover couldn't be generated. Tap Retry to try again, or edit the script for this scene."
  - "Image generation is taking longer than usual. We'll notify you when it's ready."
  - "YouTube upload failed — your channel may need to re-authorize. Click here to reconnect."

### Admin Error Monitoring:
- All errors logged with: timestamp, user ID, operation type, error details, retry count
- Admin dashboard: error rate per service (fal.ai, ElevenLabs, OpenAI, YouTube)
- Alerts when error rate exceeds threshold (>5% of requests failing)

---

## 5. GDPR Compliance

### Data Export (Right of Access):
- "Export My Data" button in Account Settings
- Generates a ZIP file containing:
  - All projects (scripts, voiceover files, images, video files)
  - All channel data (styles, settings, analytics snapshots)
  - Account settings and preferences
  - Usage history and billing records
  - Media Library contents
- Available within 24 hours of request (large accounts may take longer)
- Download link sent via email, expires in 7 days

### Account Deletion (Right to be Forgotten):
- "Delete My Account" button in Account Settings
- Confirmation required: type "DELETE" to confirm
- 30-day grace period: account frozen, data preserved, user can reactivate
- After 30 days: permanent deletion of:
  - All DynamoDB records (account, channels, projects, styles, usage)
  - All S3 files (images, audio, video, thumbnails)
  - Cognito user record
  - Stripe subscription cancelled
  - YouTube OAuth tokens revoked
- Admin dashboard shows pending deletion requests

### Data Handling:
- User data stored in AWS us-east-1 (or configurable region)
- All data encrypted at rest (S3 SSE, DynamoDB encryption)
- All API calls over HTTPS
- No user data shared with third parties beyond what's needed for the service
- Privacy policy must disclose: OpenAI processes script content, ElevenLabs processes voice data, fal.ai processes image prompts

---

## 6. YouTube Policy Compliance Check

Before publishing, AI reviews the project against YouTube's community guidelines:

### What Gets Checked:
- **Script text:** Scanned for hate speech, harassment, misleading claims, dangerous content
- **Title:** Checked for clickbait that violates YouTube's misleading metadata policy
- **Description:** Checked for spam patterns, misleading links
- **Thumbnail text:** Checked for misleading claims, sensationalism beyond YouTube's limits
- **Overall content:** Checked against YouTube's "Advertiser-Friendly Content Guidelines"

### How It Works:
- GPT-4o reviews all text content in one API call (~$0.01-0.03)
- Returns: PASS, WARNING (with explanation), or FAIL (with specific violations)
- WARNING: shows the concern but allows publishing with acknowledgment
- FAIL: blocks publishing until the issue is fixed (user can override with explicit acknowledgment)
- This is part of the "Quality Check Before Publish" in the Publishing step

### Cost: Negligible (~$0.01-0.03 per project, rolled into script generation credits)

---

## 7. Platform Decisions (Explicit)

### v1 is Single-User Per Account
- One login = one person (except Agency tier which has team seats)
- No collaborative editing in v1
- Team seats on higher tiers: each seat is a separate login with shared channels/projects
- No real-time collaborative editing (that's a post-launch feature)

### Admin Account = Full Consumer Access
- Admin account bypasses ALL credit checks and tier gates
- Admin uses the same UI and workflow as paying users (no separate admin editor)
- This means admin can create channels, make videos, publish — everything a consumer can do, with no limits
- Implementation: `isAdmin` flag checked before every credit deduction and tier-gated feature
- Full details in billing.md under "Admin Account — Full Access, No Paywall"

### Desktop-First
- v1 optimized for desktop browsers (Chrome, Firefox, Safari, Edge)
- Dashboard, analytics, and project status pages are responsive (work on mobile)
- Wizard/editing are desktop-only — mobile shows "Please use a desktop browser for this feature"
- Future: mobile companion app for review/approval

### Project Duplication
- "Duplicate Project" button on any project
- Creates a copy with: same template, same style, same settings
- User changes the topic and regenerates content
- Short-Form Variant is a special case of duplication (from Scripts module)

### YouTube API Quota Management
- Multi-key rotation for Niche Finder (already defined)
- Prioritize publishing operations over analytics sync
- Cache YouTube data aggressively — don't re-fetch unchanged data
- Queue non-urgent reads (analytics, comments) during low-quota periods
- Admin alert when daily quota exceeds 80%
- Fallback: reduce analytics refresh frequency from daily to every 3 days if quota is tight

### Content Calendar
- Calendar shows both scheduled publishes AND in-progress projects
- Projects can be scheduled during the Publishing step
- Scheduling triggers automatic rendering (if not already rendered) and upload at the scheduled time
- AI recommends optimal posting times based on niche data and channel analytics
- Drag-and-drop to reschedule

### Onboarding Progress Checklist (Cross-Module)
- Tracked at **Account level** in DynamoDB (not channel level — one-time onboarding per account)
- Each step has `completed` boolean and `completedAt` timestamp
- Each module updates its step via shared `onboarding.completeStep(stepId)` function

| Step | Owning Module |
|---|---|
| Create your first channel | Channel Builder |
| Research your niche | Niche Finder |
| Save a reference channel | Research Board |
| Generate your Style | Style System |
| Create your first project | Projects/Wizard |
| Generate your first video | Projects/Wizard + generation modules |
| Publish to YouTube | Publishing |

- Checklist renders in the channel workspace dashboard
- Auto-dismisses when all 7 steps complete ("You're all set!")
- User can dismiss early via "Skip guide"
- Re-accessible from Help menu icon
- First-time flow: welcome screen → two-card choice → channel creation → contextual walkthrough (DRAFT highlights Niche Finder/Research Board, CONNECTED highlights Analytics/Projects)
- First project has a "guided mode" explaining each wizard step
- Tooltips on AI features throughout

---

## 8. Handoff Contracts (Between Modules)

### Voiceover → Visuals Handoff
Voiceover writes a "scene timing data" object that Images/Video reads:
```
{
  scene_number: 1,
  voiceover_duration_seconds: 45.3,
  word_timestamps: [{word: "In", start: 0.0, end: 0.15}, ...],
  silence_padding_before: 0.5,
  silence_padding_after: 1.0,
  total_scene_duration: 46.8
}
```
This is the source of truth for how long each scene's visuals need to fill.

### Caption Handoff (Voiceover → Editing)
Voiceover produces a caption data file per scene:
```
{
  scene_number: 1,
  words: [
    {word: "In", start: 0.0, end: 0.15, emphasis: false},
    {word: "February", start: 0.16, end: 0.52, emphasis: true},
    ...
  ],
  caption_style: "animated_word_by_word",
  style_fonts: {from Channel Style},
  emphasis_color: "#FF4444"
}
```

### Scripts → Niche Finder Integration (Niche Context Package)
When creating a project from Niche Finder data:
```
{
  niche_name: "True Crime Cold Cases",
  top_performing_hooks: ["cold open", "mystery question"],
  content_gaps: ["1980s cases", "international cold cases"],
  audience_persona: "25-45, true crime enthusiast, binge-watches",
  optimal_duration: "12-15 min",
  trending_topics: ["Dyatlov Pass", "DB Cooper"],
  outlier_analysis: {if triggered from specific outlier video}
}
```

### SEO Generation Timing
- **During Scripts:** AI scores the topic's SEO potential (search volume, keyword difficulty) — this is a signal, not the final output
- **During Publishing:** AI generates the actual title, description, and tags using the finalized script + niche data + Style patterns
- The SEO "score" from Scripts helps users pick better topics; the actual SEO content is written at publish time

### Thumbnail Generation Timing
- **During Visuals step:** Generate preliminary thumbnails using topic/hook from script (title not finalized yet)
- **During Publishing step:** Refine thumbnails with final title text overlay
- User sees thumbnails early (better UX) but gets the final polished version at publish time

### Publishing Readiness Checklist
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

## 9. Batch Generation Rules

- Batch generation produces **topic outlines** (not full scripts) — each outline becomes a separate project in TOPIC_SELECTED state
- User then opens each project individually to trigger full script generation and continue through the wizard
- Content calendar shows all projects and their pipeline status
- Users can work on multiple projects in parallel (each at a different wizard step)
- Concurrent project limit per tier (Starter: 2, Creator: 5, Pro: 10, Agency: 25)
- Future optimization: batch voiceover/visual generation for efficiency
