# Style System Module — Finalized Spec

## What This Module Does

The Style System is the creative DNA of every channel. It's a profile that defines how every video looks, sounds, and feels — and it silently drives all AI generation across the platform.

**Responsibilities:**
- Defining what a Style contains (all fields that make up a channel's creative identity)
- Generating Styles (blended from reference channels or detected from existing YouTube content)
- Editing Styles (user can tweak any field after generation)
- Version history and rollback
- Shorts Override layer for dual-format channels
- Visual Anchors (recurring visual elements for consistency)
- Style Score (predicted effectiveness rating)
- Style evolution suggestions based on analytics
- Standalone Styles for experimentation
- How Style feeds into every other module
- Style limits by tier

**What it does NOT do:** Channel Builder triggers Style generation — Style System does the actual work. Projects inherit Style but the Projects/Wizard module handles that inheritance.

---

## The Style Profile — All Fields

### Section 1: Script & Tone
- Script tone (e.g., "conversational and suspenseful", "educational but casual")
- Hook pattern (cold open, question, statistic, story teaser, bold claim)
- Preferred hook length (in seconds)
- Narrative structure preference (linear, mystery reveal, problem-solution, listicle)
- Pacing per section (fast intro → slow build → fast climax → slow outro)
- CTA style (subtle mention, direct ask, end-card focused)
- Vocabulary level (simple, intermediate, advanced)
- Humor level (none, light, moderate, heavy)

### Section 2: Voice
- Default voice ID (from ElevenLabs library or user's cloned voices)
- Voice tone description (e.g., "deep, calm, authoritative")
- Speaking pace (words per minute target)
- Energy variation pattern (where to speed up, slow down)
- Pronunciation dictionary entries (niche-specific terms)
- Multi-voice setup if applicable (narrator voice + character voices)

### Section 3: Visual Format
- Primary format: stock footage / AI-generated images / mixed / animation
- Aspect ratio default: 16:9 (landscape), 9:16 (Shorts), 1:1 (square)
- Image generation tier default: Draft / Standard / Premium
- Visual density (how many visual changes per minute)
- Visual relationship preference (MATCH / CONTRAST / SUPPLEMENT / ATMOSPHERIC — default weighting)
- Ken Burns motion style: standard pan-zoom / parallax depth (Creator+ only)

### Section 4: Color Palette & Typography
- Primary color (hex)
- Secondary color (hex)
- Accent color (hex)
- Background mood (dark, light, neutral, vibrant)
- Font family for on-screen text (from curated list of 20-30 web-safe + popular fonts)
- Font weight and style
- Text shadow/outline settings for readability

### Section 5: Thumbnail Template
- Thumbnail approach (text-heavy, face-focused, minimal, collage, before-after)
- Text placement (top, bottom, center, left-third, right-third)
- Text color and outline
- Background treatment (blurred scene, solid color, gradient, AI-generated)
- Emoji/icon usage (yes/no, style)
- Consistency rule (e.g., "always include channel logo in bottom-right")

### Section 6: Music & Sound
- Default music mood (dark ambient, upbeat pop, cinematic orchestral, lo-fi chill, etc.)
- Music energy curve (matches video pacing — builds with content)
- Sound effect style (realistic, dramatic, subtle, cartoon)
- Music volume relative to voice (suggested dB relationship)
- Intro/outro music preference (separate track or same as body)

### Section 7: Captions
- Caption style (animated word-by-word, sentence blocks, karaoke highlight)
- Font and size
- Position (bottom-center, top, custom)
- Color scheme (match palette or high-contrast)
- Emphasis style (color change, scale up, glow, underline)
- Background (none, semi-transparent box, full bar)

### Section 8: Intro/Outro
- Intro template selection (from 15-20 platform templates or "none")
- Intro duration target
- Outro template selection
- Outro duration target
- End screen layout preference (subscribe button position, video suggestions)

### Section 9: Structure & Pacing
- Target video length (e.g., "10-12 minutes")
- Shorts target length (e.g., "45-55 seconds")
- Scene count target (derived from length and pacing)
- Transition style between scenes (cut, crossfade, wipe, zoom)
- Transition duration default (0.3s - 2.0s)
- Chapter grouping preference (4-7 chapters for long-form)

### Section 10: SEO Patterns
- Title pattern (e.g., "Number + Power Word + Topic", "Question format", "How-to")
- Title length target (characters)
- Description structure (hook paragraph, timestamps, links, social links)
- Tag strategy (broad + specific + long-tail mix)
- Hashtag usage for Shorts

### Section 11: Visual Anchors
Recurring visual elements that stay consistent across all projects under this channel.

Each anchor has:
- **Name:** "Detective Character", "Lab Mascot", "Host Avatar"
- **Type:** Character / Object / Setting / Logo
- **Reference image:** An uploaded or generated image defining what this anchor looks like (stored in S3)
- **Description:** Text used in AI image prompts ("A silhouetted detective figure in a trench coat and fedora, noir style, always shown from behind")
- **Usage rules:** "Every intro scene", "Thumbnail always", "Only in mystery reveal scenes"
- **Format applicability:** "both" / "long-form only" / "shorts only" — determines whether anchor is used for Shorts projects, long-form projects, or both
- **fal.ai reference data:** If generated with fal.ai, store model + seed + prompt for consistency (image-to-image reference for future generations)

**Limits:** Max 10 Visual Anchors per Style.

**Connection to Images module:** When the auto-fill pipeline generates images for a project, it checks the Style's Visual Anchors. If a scene matches an anchor's usage rules (and format applicability), the anchor's reference image and description are injected into the generation prompt for consistency. This is the canonical home for what the Images module calls "Visual Anchors."

---

## Shorts Override Layer

Instead of a separate Style for Shorts, the Style contains a **Shorts Override** — a layer of field overrides that apply when creating Shorts projects. The base Style covers long-form. Fields not overridden carry through unchanged (color palette, voice, visual anchors, etc.).

### Override Fields

| Field | Long-Form Default | Shorts Override |
|---|---|---|
| Hook length | 5-15 seconds | 1-2 seconds |
| Aspect ratio | 16:9 | 9:16 |
| Visual density | 4-6 changes/min | 15-20 changes/min |
| Caption style | Bottom-center, medium | Center-screen, large bold |
| Caption background | Semi-transparent | Solid or none (bigger text readable without) |
| Intro/Outro | From template | None |
| Chapters | 4-7 | None |
| Music approach | Mood-based background | High-energy, trending-style beats — fast tempo, punchy, optimized for short attention spans |
| Target length | 10-12 minutes | 45-55 seconds |
| Scene count | 15-30 | 5-10 |
| Transition style | Crossfade/cut | Hard cut (faster) |
| Transition duration | 0.3-2.0s | 0.1-0.3s |
| SEO: Title | Full pattern (Number + Power Word) | Short, hashtag-focused |
| SEO: Description | Full structure with timestamps | Minimal, hashtag-heavy |
| Thumbnail | Full template | Minimal (YouTube auto-generates, custom has less impact) |
| End screen | Subscribe + video suggestions | None |

### How It Works
- Every Style has a `shortsOverride` object. When empty, sensible defaults are applied automatically based on the table above.
- User can customize any Shorts Override field independently.
- When creating a Shorts project, the system merges: base Style + Shorts Override = effective Style for that project.
- Fields NOT in the override (color palette, voice ID, script tone, Visual Anchors) carry through from the base unchanged.
- Style Editor shows a toggle: "Long-Form Settings" / "Shorts Settings" — switching shows override fields with effective values.
- For Shorts-only channels: base Style still exists (same structure) but Shorts Override is the primary view in the editor.

### Music Note
Shorts music described as "high-energy, trending-style beats" is generated by ElevenLabs Music / Mubert as original compositions in that style. We do NOT replicate specific viral TikTok sounds. If users want a specific trending sound, they upload it themselves via the editing module.

---

## Style Generation — Two Paths

### Path A: From Reference Channels (Plan-First)

When user has saved 1-5 reference channels and triggers Style generation:

1. **Reference compatibility check:** AI evaluates references for compatibility before generation begins.
   - All same/adjacent niches: proceed normally
   - 2 clearly different niches: Warning: "Your references span True Crime and Finance. The blend may feel inconsistent." Options: Proceed anyway / Pick a group / Go back to Research Board
   - 3+ different niches: Stronger warning recommending focus on one category
   - "Adjacent" determined by GPT-4o judgment (True Crime ↔ Mystery Documentaries = adjacent; True Crime ↔ Cooking = not)
   - References stay on the Research Board regardless of which are used for generation
2. AI pulls analysis data from Research Board (thumbnail analysis, script structure, title patterns, performance)
3. GPT-4o processes all references together and produces a **blended Style recommendation**
4. For each field, AI shows: recommended value with reasoning, where references agree (strong signal) vs disagree (conflict)
5. **Conflict resolution:** When references disagree, AI presents both options with performance data and its recommendation
6. **Gap filling:** If references don't give signal for a field, AI recommends based on niche norms
7. User reviews complete Style profile, edits anything
8. Style Score calculated (see below)
9. Style saved as Version 1

**Cost: 75 credits** (includes compatibility check, blending, conflict detection, scoring)

### Path B: Detected from Existing YouTube Content (Connect-First)

When user connects a YouTube channel with existing videos:

1. Channel Builder's analysis has already extracted patterns (included in free onboarding)
2. GPT-4o maps patterns to Style fields:
   - Thumbnail analysis → Thumbnail Template
   - Title patterns → SEO Patterns
   - Transcript analysis → Script & Tone
   - Upload frequency + video lengths → Structure & Pacing
   - Comment sentiment → audience preferences informing tone
3. AI presents: "Here's the Style we detected from your existing content"
4. User reviews and tweaks
5. Style Score calculated
6. Style saved as Version 1

**Cost: Free** (absorbed as part of Channel Builder's free onboarding analysis)

### Style Regeneration
- "Regenerate Style" button: creates a brand new Style from current references, replacing the existing one. Old Style preserved in version history.
- **Cost: 75 credits**

---

## Style Score (Predicted Effectiveness)

A 1-100 score rating the predicted effectiveness of the Style based on niche performance data.

### Category Breakdown
- **Thumbnail Score:** How well the thumbnail template matches high-CTR patterns in this niche
- **Hook Score:** How effective the hook pattern is based on niche data
- **Pacing Score:** How well the pacing matches audience retention patterns
- **SEO Score:** How competitive the title/tag patterns are
- **Overall Score:** Weighted average of all categories

### Data Sources (in priority order)
1. **Channel's own analytics** (if CONNECTED with 5+ published videos) — strongest signal, actual audience response
2. **Reference channel analysis** (from Research Board) — what works for similar channels
3. **Niche Finder aggregate data** — general niche trends and patterns

If all three available, score blends them (own analytics weighted highest). If only niche data exists (new DRAFT, no references), score shows "Limited data" disclaimer with lower confidence.

### Dual-Format Scoring
If a channel has a configured Shorts Override, Style Score shows two ratings:
- "Long-form Score: 85 | Shorts Score: 62"
- Each evaluated independently against format-appropriate niche data
- If channel only does one format, show one score

### When It Runs
- On initial Style generation (included in 75-credit cost)
- On saving a new version (free — quick GPT-4o evaluation, ~$0.01)
- Does NOT run on every minor field edit — only version saves or explicit refresh
- When user edits a field and saves, score updates showing impact: "Changing to cold opens would drop your Hook Score from 85 to 62"

### Display
- Score badge on Style page: "Style Score: 78/100"
- Each section shows its sub-score in the Style Editor
- Color coding: Green (70+), Yellow (40-69), Red (below 40)
- **Advisory only** — low scores don't block anything. It's guidance, not restriction.

---

## Style Editing

### Style Editor UI
- Organized by all 11 sections
- Each section is a collapsible card
- Each field shows: current value, AI recommendation (if different), edit button
- "Reset to AI recommendation" button per field
- "Reset entire section" option per section
- Toggle: "Long-Form Settings" / "Shorts Settings" for Shorts Override editing

### Style Preview Panel (Template-Based Mockups)
Previews are **programmatic client-side mockups**, not AI generations:

- **Thumbnail preview:** Pre-built HTML/CSS template applying Style's colors, font, text placement, and background treatment. Sample placeholder text like "10 SHOCKING Facts About [Topic]" using the title pattern. No fal.ai calls — instant.
- **Caption preview:** Animated preview of captions on a dark background using Style's font, size, position, color, and emphasis style. Shows 5-6 sample words with selected animation.
- **Title preview:** SEO title pattern filled with niche-relevant sample text, shown at YouTube thumbnail scale and search result scale.
- **Color palette preview:** Swatches with sample elements showing how colors work together.

**What CAN'T be previewed visually:**
- Script tone, hook pattern, humor level — shown as descriptive text: "Your scripts will use a conversational, suspenseful tone with question-based hooks."
- Music mood — shown as label: "Dark ambient with building intensity."
- Voice — not previewed here. Voice selection has audio samples in the Voice section.

**Full AI-Generated Preview (optional):**
- "Generate full Style preview" button: creates one AI-generated sample thumbnail + one sample title + one sample caption animation using actual AI pipeline
- **Cost: 15 credits**

### Save Behavior
- Auto-saves drafts as user edits (no lost work)
- Explicit "Save as new version" button creates a version history entry
- User can add a note to each version: "Switched to brighter thumbnails after testing"

---

## Style Pinning on Projects — Snapshot Copy

When a project is created, the full Style JSON is **copied** into the project record as `pinnedStyle`.

### How It Works
- Project is fully self-contained — no dependency on the channel's current Style
- `pinnedStyle` also stores `sourceStyleId` and `sourceVersionNumber` for tracking
- If user later updates or deletes the channel's Style, the project is unaffected
- DynamoDB storage: ~5-15KB per Style snapshot × 1,000 projects = ~15MB. Negligible.

### Manual Style Update for Existing Projects
- Project settings shows: "Style: Version 3 (from Oct 2026). Current channel Style: Version 7."
- "Update to latest Style" button overwrites the pinned Style
- Warning: "Updating the Style may change how AI generates content for this project. Your existing scripts, voiceovers, and visuals won't change, but regenerated content will use the new Style."

### Visual Consistency Warning
When a user regenerates any content in a project after its pinned Style has been updated:
- System detects the mismatch between when existing content was generated vs the current pinned Style version
- Warning: "This scene will be generated with your updated Style. Scenes 1-9 still use the previous Style, which may cause visual inconsistency. Would you like to regenerate all visuals for consistency?"
- Options: "Regenerate this scene only" / "Regenerate all visuals" (shows credit cost) / "Cancel"

### Visual Anchors in Snapshots
- Visual Anchor definitions are included in the snapshot (names, descriptions, usage rules, format applicability)
- Reference images are stored in S3 — snapshot stores S3 keys (not image copies)
- If a Visual Anchor's reference image is later deleted from S3, the description text still works for generation (graceful degradation)

---

## Version History

- **Version 1:** Initial generation (from references or detection)
- **Version 2, 3, etc.:** Each time user saves significant changes
- Each version stores: full Style snapshot, timestamp, auto-generated change summary, optional user note
- **Rollback:** Preview any past version and restore with one click
- **Compare:** Side-by-side view of any two versions highlighting changes
- Versions are never deleted (even after rollback)

### What Creates a New Version
- User explicitly clicks "Save as new version"
- AI suggests a Style evolution and user accepts
- NOT on every minor edit — auto-save draft is separate from version history
- Version history does NOT count against the Style tier limit (versions are history of one Style, not separate Styles)

---

## Style Evolution (Analytics-Driven)

### Trigger Rules
- **Minimum:** At least 5 videos published through our platform
- **Monthly fallback:** Only triggers if 3+ videos published since last evolution check. If fewer than 3 new videos: skip this month, check again next month.
- **After 5 new videos:** Always generates suggestions regardless of time elapsed

### Confidence Levels
- 3-5 videos: "Low confidence — early signal, may change with more data"
- 6-15 videos: "Medium confidence — emerging patterns detected"
- 15+ videos: "High confidence — strong data backing"

### What AI Analyzes
- Performance of videos grouped by Style attributes
- Thumbnail CTR correlation with Style choices
- Retention correlation with pacing settings
- Comment sentiment trends

### What AI Suggests
- Specific field changes with data backing: "Consider switching your hook pattern from 'cold open' to 'question hook' — your question-hook videos perform 2.3x better"
- Each suggestion shows: current value, recommended value, performance data, confidence level
- Suggestions appear in: Channel Dashboard AI Suggestions section, Style Editor as "AI recommends" badges, post-publish analytics

### User Action
- Ignore (stays until dismissed)
- Accept (field updated, new Style version created automatically)
- Explore (see full data breakdown before deciding)

### Insufficient Data State
- Style Editor shows: "Style evolution suggestions will appear after you publish a few more videos. We need at least 3 recent videos to identify meaningful patterns."
- Dashboard AI Suggestions: topic suggestions still appear (use niche data), but Style-specific suggestions require minimum threshold

---

## Standalone Styles

Styles not attached to any channel, used for experimentation and planning.

### How to Create
- **From Channels page:** Below channel cards, a "Standalone Styles" section (collapsed by default). "+ New Standalone Style" button.
- **From Channel Style page:** "Duplicate as Standalone" button copies a channel's Style for experimentation.
- **From Settings:** "Manage All Styles" link shows complete view of all Styles (channel-attached + standalone).

Three creation options:
- **From template:** Pick one of the 10 niche templates, customize (free)
- **From scratch:** Set a niche manually, optionally link reference channels, then generate (75 credits)
- **Duplicate existing:** Copy any channel's current Style (free, just a copy)

### Where They Live
- Channels page: "Standalone Styles" section below channel cards
- Settings → "Manage All Styles" for full view
- NOT a top-level sidebar item (too niche a feature for global navigation)

### How to Use
- **Assign to channel:** "Apply to Channel" button. Pick a channel. Warning: "This will replace [Channel Name]'s current Style. Current Style will be saved to version history." Current becomes a version, standalone becomes active Style. Standalone slot freed up.
- **Use in Standalone Generator:** When generating in the Standalone Generator tool, user can select any Style (standalone or channel-attached) to apply as style context.
- **Compare:** Side-by-side comparison between any two Styles

### Lifecycle
- No version history (lightweight — users duplicate before big changes if needed)
- Can be renamed, edited, duplicated, deleted at any time
- No projects are ever pinned to standalone Styles (no projects exist outside channels)

---

## Style Deletion Rules

### Attached Styles (linked to a channel)
- **Cannot be deleted directly.** A channel must always have a Style.
- To start over: "Regenerate Style" button (75 credits) creates brand new Style from current references. Old Style preserved in version history.
- To effectively reset: manually edit all fields (free) — no credit cost
- Style is only fully removed when the entire channel is deleted

### Standalone Styles
- Can be deleted freely, instant, no grace period
- Frees up a Style slot immediately
- If duplicated into a channel's Style, the channel's copy is unaffected (snapshot, not reference)

### Style Slot Management
- Active channel Styles + standalone Styles = total count against tier limit
- Version history does NOT count
- Archived channels' Styles don't count (same rule as channel limits)

---

## Style Limits by Tier

| | Starter | Creator | Pro | Agency |
|---|---|---|---|---|
| Styles | 3 | 10 | 25 | Unlimited |

Each channel has exactly one active Style. The Style limit = channel limit PLUS any standalone Styles for experimentation.

When limit hit: "You've reached your plan's limit of X Styles. Upgrade, or delete an unused standalone Style to free up a slot."

---

## Style Templates (Starter Library)

Pre-built Style templates by niche category for quick starts:

1. **True Crime** — dark, suspenseful, deep voice, moody thumbnails
2. **Educational/Explainer** — bright, clean, energetic voice, text-heavy thumbnails
3. **Finance/Business** — professional, data-driven, authoritative voice, minimal thumbnails
4. **Tech Review** — modern, sleek, conversational voice, product-focused thumbnails
5. **Gaming** — vibrant, fast-paced, energetic voice, face-reaction thumbnails
6. **Cooking/Food** — warm, inviting, friendly voice, food-photography thumbnails
7. **Travel/Documentary** — cinematic, ambient, calm narrative voice, landscape thumbnails
8. **Health/Fitness** — motivational, bright, coaching voice, before-after thumbnails
9. **Story/Commentary** — casual, personality-driven, conversational voice, reaction thumbnails
10. **Shorts/Viral** — fast, punchy, high-energy voice, bold text thumbnails

Each template is a fully filled Style profile (all 11 sections + Shorts Override). User selects one, then customizes. Templates are always **free** (no credit cost).

---

## How Style Drives Every Module

| Module | Style Sections Used |
|---|---|
| **Scripts** | Section 1 (Script & Tone) + Section 9 (Structure & Pacing) |
| **Voiceovers** | Section 2 (Voice) |
| **Images** | Section 3 (Visual Format) + Section 4 (Color Palette) + Section 11 (Visual Anchors) |
| **Video Generation** | Section 3 (Visual Format) + Section 6 (Music & Sound — for motion energy) |
| **Thumbnails** | Section 5 (Thumbnail Template) + Section 4 (Color Palette) |
| **Captions** | Section 7 (Captions) |
| **Music** | Section 6 (Music & Sound) |
| **Editing** | Section 7 (Captions) + Section 8 (Intro/Outro) + Section 9 (Structure & Pacing) |
| **Publishing/SEO** | Section 10 (SEO Patterns) + Section 5 (Thumbnail Template) |

**Implementation:** Every AI prompt includes a "Style Context" block — a formatted summary of the relevant Style sections for that operation. Scripts prompts include Sections 1+9. Image prompts include Sections 3+4+11. This keeps token usage minimal while ensuring Style consistency.

**Shorts projects:** When the project is Shorts format, the Shorts Override values replace their base equivalents in the Style Context block before it's sent to any AI service.

---

## Credit Costs (Style System)

| Operation | Credits | Notes |
|---|---|---|
| Style generation (from references) | 75 | GPT-4o analysis, blending, conflict detection, scoring |
| Style regeneration | 75 | Start over from current references |
| Style detection (connect-first) | 0 | Absorbed in Channel Builder's free onboarding |
| Style editing | 0 | Always free |
| Style full AI preview | 15 | One AI-generated thumbnail + title + caption sample |
| Style template selection | 0 | Always free |
| Style Score refresh | 0 | Included in version saves, negligible GPT-4o cost (~$0.01) |

---

## Connection to Other Modules

| Module | How Style System Connects |
|---|---|
| **Channel Builder** | Triggers generation. Style lives under a channel. Manages "Generate Style" prompt. Style Reconciliation on draft-to-connected. |
| **Research Board** | Provides reference channel analysis data feeding into Style generation |
| **Scripts** | Reads Sections 1+9 to shape every script |
| **Voiceovers** | Reads Section 2 for voice selection and pacing |
| **Images** | Reads Sections 3+4+11 for generation prompts. Visual Anchors defined here, enforced by Images auto-fill pipeline. |
| **Editing** | Reads Sections 7+8+9 for captions, intro/outro, pacing |
| **Publishing** | Reads Sections 5+10 for SEO and thumbnails |
| **Analytics** | Feeds performance data back into Style Evolution suggestions |
| **Standalone Generator** | Can select any Style (standalone or channel) as context for generation |
| **Billing** | Style count tier-gated. Generation costs 75 credits. AI preview costs 15. |
| **Platform Systems** | Style pinning (snapshot copy) on project creation. Onboarding "Generate your Style" step. Cascade invalidation: warning only for existing projects. |

---

## Error Handling

- **Not enough reference data:** "Your saved references don't have enough data to fully generate a Style. We've filled gaps with niche best practices — review and adjust."
- **Single reference channel:** "Style generated from one reference. For a more unique blend, save 2-4 more references and regenerate."
- **Incompatible references (2 niches):** "Your references span two different categories. The blend may feel inconsistent." Options: Proceed / Pick a group / Go back
- **Incompatible references (3+ niches):** Stronger warning recommending focus on one category
- **Style field conflict:** "Your references disagree on [field]. Here are both options with performance data — pick one."
- **Style limit reached:** "You've reached your plan's limit. Upgrade or delete an unused Style."
- **Existing projects after Style change:** "You have 5 projects using the previous Style version. They'll keep their current Style. New projects will use your updated Style."
- **Visual consistency mismatch:** "This scene will be generated with your updated Style. Other scenes use the previous version. Regenerate all visuals for consistency?" Options: This scene only / All visuals / Cancel
- **Visual Anchor reference image missing:** Graceful degradation — anchor's text description still used in generation prompts
- **Style Score low confidence:** "Limited data — score based on general niche patterns. Save more reference channels or publish more videos for a more accurate score."
