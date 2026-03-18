# Scripts Module — Finalized Spec

## Core Concept
Dual-script system: Narrator Script (what the voice says) + Scene Script (what appears on screen). Both generated simultaneously by GPT-4o using viral templates + Channel Style + niche data.

---

## Dual Script System

### Narrator Script
- The words the audience hears via voiceover
- Includes energy markers (speed up, slow down, emphasize specific words)
- Includes pacing notes (SLOW, MEDIUM, FAST, DRAMATIC_PAUSE)
- Includes caption emphasis words (which words get highlighted in captions)

### Scene Script
- What appears on screen — visuals, text overlays, B-roll descriptions, animations
- Timestamped visual sequence per scene
- On-screen text elements
- Can align with OR contrast the narrator (intentional relationship)

### Visual Relationship Types
Each scene defines how narrator and scene scripts relate:
- **MATCH** — Narrator says "the mountain" while showing mountains
- **CONTRAST** — Narrator says "everything seemed normal" while showing something ominous
- **SUPPLEMENT** — Narrator explains a concept while screen shows diagram/data
- **ATMOSPHERIC** — Narrator tells story while screen shows mood-setting B-roll

---

## Scene Structure

```
Scene {
  scene_number: 1
  title: "The Hiking Trip"
  template_section: "RISING_ACTION"
  estimated_duration: 45s
  visual_relationship: "MATCH" | "CONTRAST" | "SUPPLEMENT" | "ATMOSPHERIC"

  // NARRATOR SCRIPT
  narrator: {
    text: "In February 1959, nine experienced hikers set out..."
    energy_markers: ["SLOW_START", "BUILD", "EMPHASIZE:nine experienced hikers"]
    pacing: "SLOW" | "MEDIUM" | "FAST" | "DRAMATIC_PAUSE"
    caption_emphasis_words: ["nine", "routine expedition"]
  }

  // SCENE SCRIPT
  scene_direction: {
    description: "Aerial shot of snow-covered Ural mountains, slow pan right.
                  Text overlay: 'February 1959' fades in at 0:03.
                  Cut to archival-style map showing hiking route at 0:15."
    on_screen_text: ["February 1959", "Ural Mountains, Russia"]
    visual_sequence: [
      { timestamp: "0:00-0:15", description: "Aerial snowy mountains" },
      { timestamp: "0:15-0:30", description: "Archival map with route" },
      { timestamp: "0:30-0:45", description: "Stock footage of winter hiking" }
    ]
  }

  // VISUALS (per visual in the sequence)
  visuals: [
    {
      timestamp: "0:00-0:15"
      source: "GENERATE_AI" | "STOCK" | "USER_UPLOAD" | "EXTERNAL_PROMPT"

      // If GENERATE_AI (uses fal.ai, white-labeled)
      fal_image_prompt: "Aerial view of snow-covered Ural mountains..."
      fal_video_prompt: "Slow aerial pan over snowy mountain pass..."
      fal_model_recommendation: "kling-video-v2"

      // If STOCK (Pexels/Pixabay)
      stock_search_query: "snowy mountain aerial drone footage winter"

      // If USER_UPLOAD
      upload_slot: true

      // If EXTERNAL_PROMPT (user has their own AI tools)
      external_prompts: {
        generic_prompt: "A damaged expedition tent torn from the inside..."
        midjourney_prompt: "/imagine aerial snow-covered Ural mountains --ar 16:9 --v 6"
        dalle_prompt: "Photorealistic aerial photograph of snow-covered Ural mountains..."
        stable_diffusion_prompt: "aerial view, snowy Ural mountains, cinematic..."
        video_prompt: "Slow zoom on damaged tent in snow, cinematic, 5 seconds..."
      }

      // Visual consistency metadata (for Editing module)
      color_tone: "blue-grey cinematic"
      aspect_ratio: "16:9"
      resolution_target: "1920x1080"
    }
  ]

  // AUDIO DIRECTION
  audio: {
    music_mood: "mysterious, building tension"
    music_energy: 0.3  (0=silence, 1=peak)
    sound_effects: ["wind howling", "footsteps crunching in snow"]
  }

  // RETENTION
  retention_technique: "OPEN_LOOP" | "PATTERN_INTERRUPT" | "MINI_PAYOFF" | "RE_HOOK" | null
}
```

---

## Four Visual Source Options

### 1. Generate with AI (built-in, white-labeled fal.ai)
- User clicks "Generate" → image or video appears
- Can regenerate, adjust prompt, pick different model
- Cost included in subscription tier limits

### 2. Stock Library (Pexels/Pixabay)
- Search stock footage directly within the scene editor
- Browse results, pick assets
- Free with Pexels attribution

### 3. Upload Your Own
- Drag-and-drop or file picker
- Supports: jpg, png, mp4, mov, gif
- Saves to Media Library

### 4. Get Prompts (for external AI tools)
- System provides optimized prompts for: Midjourney, DALL-E, Stable Diffusion, Runway, generic
- ALL prompts include Channel Style context (colors, mood, aesthetic)
- User generates externally, uploads the result
- Serves users with their own AI tools without losing them from the platform

---

## Script Generation Flow

### Step 1: Topic Selection
- AI suggests topics from: niche trends, content gaps, outlier videos, seasonal relevance
- User can type their own topic
- Batch mode: select multiple topics for content calendar

### Step 2: Topic Research (AI-powered)
- Competitor coverage: who has published on this topic, how it performed
- Search volume and competition level
- Outlier videos on this topic: what made them work
- Content gaps: angles no one has covered yet
- AI suggests unique angles based on research

### Step 3: Template Selection
- Pick from viral template library (educational, listicle, documentary, comparison, explainer, short-form variants)
- AI recommends best template for this topic + niche + style
- Option: "Also create a Short-Form Variant" checkbox

### Step 4: Script Generation (Chunked Scene-by-Scene)
AI generates using: Template + Style + Niche data + Topic research + Retention rules

**Why chunked:** GPT-4o maxes out at ~600-800 words per response. A 10-minute video needs ~1,500 words, a 60-minute video needs ~9,000 words. One prompt can't do it. So we break it up:

**4a — User Sets Target Duration**
- Short-form: 30s, 60s, 90s, 3 min
- Long-form: 5, 8, 10, 12, 15, 20 min
- Custom: any duration (scales to 60+ minutes)
- AI recommends optimal duration based on niche + template + Style data

**4b — System Calculates Word Budget**
- Target duration × 150 words/minute = total word budget
- Divided across scenes based on template structure (hook gets fewer words, meat sections get more)
- Example: 10 min = 1,500 words across 10 scenes ≈ 150 words/scene

**4c — Outline Generation (1 API call)**
- AI generates scene outline: titles, key points, word budget per scene
- Template structure drives which sections get more/less time
- This is short (~200-300 words) — well within token limits

**4d — Scene-by-Scene Generation (1 API call per scene)**
- Each scene generated individually with:
  - Full outline for big-picture context
  - Previous scene's text for natural flow
  - That scene's word budget as a hard target
  - Style, template, and retention rules
- Each call produces ~100-200 words — easy for GPT-4o
- Scenes can run in parallel batches where transitions aren't critical

**4e — Stitch and Validate**
- Combine all scenes into full script
- Auto-check: total word count within 5% of target?
- Auto-check: any scene dramatically over/under its budget?
- One final "polish" API call reviews transitions between scenes
- If off-target: automatically expand or trim specific scenes (targeted small calls)

**Scales to any duration:** A 60-minute video = ~9,000 words = ~60 scenes = ~60 small API calls. Same process, just more scenes. No single API call ever needs to produce more than 200 words.

Outputs:
- Full dual script (narrator + scene) for every scene
- Visual prompts for all 4 source options per visual slot
- Audio direction per scene
- Retention techniques placed at optimal points

AI self-scores:
- Hook strength (1-10 with reasoning)
- Predicted retention percentage
- Style compliance (does it match the Channel Style?)
- SEO potential for title + description

### Step 5: Script Review + Edit
- Scene-by-scene review with narrator and scene scripts side by side
- Edit narrator text, scene direction, or both per scene
- Regenerate individual scenes (maintains surrounding context)
- A/B hook variants: 2-3 alternative hooks scored and ranked
- Visual source selection per scene (Generate / Stock / Upload / Prompts)
- Cost projection panel: estimated credits for full video pipeline
  - Voiceover cost (based on character count + ElevenLabs pricing)
  - Visual generation cost (based on scene count × chosen sources)
  - Music generation cost
  - Rendering cost
  - Total estimated cost

### Step 6: Script Approval
- User marks script as "Approved"
- Warning: "Changes after approval may require regenerating voiceover and visuals"
- Script is locked (editable but shows warning on changes)
- Proceeds to Voiceover step

---

## Visual Consistency Layer

When user mixes visual sources within a scene or across scenes:
- System flags potential mismatches: "Your AI clip is cinematic blue-grey but your stock footage is warm-toned"
- Suggests: "Apply a color grade to match?"
- Tracks per-visual: color_tone, aspect_ratio, resolution_target
- Editing module uses this metadata to harmonize mixed sources

---

## Additional Features

### Short-Form Variant Generation
- "Create Short-Form Variant" button on any completed long-form script
- AI identifies most viral-worthy 30-60 second segment
- Based on retention science: highest-energy moment, biggest revelation, or the hook
- Generates standalone short-form script with loop potential
- Saves as separate project linked to the parent

### Batch Generation
- Select multiple topics from AI suggestions or user's own list
- Pick a template (same for all or different per topic)
- System generates all scripts in background
- Each script needs individual review and approval
- Tied to content calendar / scheduling

### YouTube Video Analysis
- User pastes a YouTube URL
- System pulls transcript (youtube-transcript-api, free, no API key)
- GPT-4o analyzes: hook type, structure, pacing, retention techniques, what made it work
- User can say "Write a script inspired by this video's structure for [my topic]"
- AI follows structural patterns but creates original content in user's Style
- Powers the "Create Video From Outlier" flow from Niche Finder

### Version History
- Save multiple script versions
- Compare side-by-side
- Revert to any previous version
- Track what changed between versions

### Export
- Download as PDF, Google Doc (via Drive integration), or plain text
- Includes both narrator and scene scripts
- Includes visual prompts if selected

---

## AI Prompting Strategy

System prompt structure for GPT-4o:
```
SYSTEM: You are a YouTube scriptwriter specializing in viewer retention.

TEMPLATE: [Selected viral template from library]

STYLE CONTEXT:
- Tone: [from Channel Style]
- Hook pattern: [from Style]
- Pacing: [from Style]
- Video length target: [from Style]
- Visual format: [from Style]
- Reference channel patterns: [from Style analysis]

NICHE CONTEXT:
- Niche: [from Channel]
- What works: [from Niche Finder data]
- Audience: [from persona data]
- Competitor gaps: [from Topic Research]

TOPIC: [User's chosen topic + angle]

RULES:
- Follow template structure exactly
- Generate both narrator and scene scripts
- Insert pattern interrupts every 20-30 seconds
- Open loops at 25%, 50%, 75% marks
- Mini-payoffs every 60-90 seconds
- Hook under 10 seconds
- Include energy markers for voiceover variation
- Generate fal.ai prompts AND external AI prompts per visual
- Include music mood progression
- Estimate per-scene duration
- Define visual_relationship per scene
- Score hook (1-10) with reasoning
- Predict overall retention percentage
```

---

## Cost Estimates
- Short-form script (30s-3min): ~$0.05-0.10 per script
- Standard long-form (5-15min): ~$0.15-0.35 per script
- Extended long-form (15-60min): ~$0.35-1.50 per script
- With A/B hook variants: add ~$0.05-0.10
- YouTube video analysis: ~$0.05-0.10 per video
- Topic research: ~$0.03-0.05 per topic (much cached per niche)
- Batch of 10 standard scripts: ~$1.50-3.50

---

## Dependencies
- **Upstream:** Niche Finder (topic suggestions, outlier data), Channel Style (drives all generation), Viral Templates (script structure)
- **Downstream:** Voiceover (reads narrator script + energy markers), Visuals (reads scene script + prompts), Editing (reads audio direction + visual consistency metadata), Publishing (reads SEO scores)
