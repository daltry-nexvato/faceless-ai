# Global Media Library — Finalized Spec

A centralized asset manager that stores every piece of media the user creates, generates, uploads, or downloads. Instead of media being trapped inside individual projects, users can browse everything they've ever made and reuse it anywhere.

---

## Two Levels of Media

**Global Media Library** (account level)
- Accessible from the main sidebar — not tied to any channel
- Contains ALL media across all channels and projects
- Also where Standalone Generator outputs land
- Also where user uploads go (drag-and-drop or file picker)

**Channel Media** (channel level)
- Filtered view showing only media associated with a specific channel
- Lives inside the channel workspace
- Same underlying data, just filtered by channel association

---

## Asset Types Stored

| Type | Source | Examples |
|---|---|---|
| AI Images | Generated in projects or Standalone Generator | Scene backgrounds, Visual Anchors, custom images |
| AI Video Clips | Generated in projects or Standalone Generator | Scene video clips from fal.ai |
| Thumbnails | Generated in projects or Standalone Generator | AI background + programmatic text composites |
| Voiceover Clips | Generated in projects or Standalone Generator | ElevenLabs/OpenAI TTS audio per scene |
| Music Tracks | Generated in projects or Standalone Generator | ElevenLabs Music / Mubert outputs |
| Stock Images | Downloaded from Pexels/Pixabay during projects | Royalty-free images |
| Stock Video | Downloaded from Pexels/Pixabay during projects | Royalty-free video clips |
| User Uploads | Uploaded directly by user | Logos, brand assets, custom images, audio files |
| Final Videos | Rendered outputs from the editing module | Complete rendered videos (all formats) |
| Exported Captions | Generated in publishing | SRT/VTT caption files |

---

## Browsing & Organization

### Views:
- Grid view (thumbnail previews) — default
- List view (filename, type, size, date, project, channel)

### Tabs:
- **All** — every asset in the library (default)
- **Favorites** — starred assets only
- **Trash** — deleted assets awaiting permanent removal (30-day retention, restorable)

### Filtering:
- By type: images, video clips, voiceovers, music, thumbnails, stock, uploads, final videos, Visual Anchors
- By channel: all channels, specific channel, no channel (orphaned/standalone)
- By project: all projects, specific project, no project (standalone/uploaded)
- By source: AI-generated, stock, user-uploaded
- By date range: created date

### Sorting:
- Newest first (default)
- Oldest first
- File size
- Name (alphabetical)
- Favorites sort to the top within whatever current sort order is selected

### Search:
- By filename
- By tags (auto-tagged by type + source, user can add custom tags)
- By prompt (for AI-generated assets — the prompt used to create them is stored as metadata)

---

## Asset Metadata

Every asset stores:

| Field | Description |
|---|---|
| assetId | UUID |
| accountId | Owner |
| channelId | Associated channel (nullable — standalone assets have no channel) |
| projectId | Associated project (nullable — uploaded/standalone assets have no project) |
| type | image, video_clip, thumbnail, voiceover, music, stock_image, stock_video, upload, final_video, captions |
| source | ai_generated, stock_pexels, stock_pixabay, user_upload, rendered |
| filename | Display name |
| s3Key | Storage path in S3 |
| s3ThumbKey | Thumbnail storage path in S3 (under /thumbs/ prefix) |
| fileSize | Bytes |
| mimeType | image/png, video/mp4, audio/mp3, etc. |
| dimensions | Width x height (for images/video) |
| duration | Seconds (for audio/video) |
| prompt | AI generation prompt (if applicable) |
| modelUsed | Which AI model generated it (if applicable) |
| tags | Array of strings (auto + user-defined) |
| isFavorited | Boolean — user can star assets for quick access |
| isIntermediate | Boolean — true for draft/intermediate files subject to 30-day cleanup |
| isVisualAnchor | Boolean — true if this asset is a Visual Anchor from the Style System |
| visualAnchorId | Links to the Style System's Visual Anchor definition (nullable) |
| uploadedBy | Account ID of the user who uploaded/generated this asset (for team permission checks) |
| licenseType | "pexels" / "pixabay" / null — tracks stock asset licensing for compliance |
| sourceUrl | Original URL on Pexels/Pixabay (nullable — for tracing stock assets back to source) |
| sourceId | Pexels/Pixabay asset ID (nullable — for re-download if needed) |
| status | active / trashed |
| trashedAt | Timestamp when moved to trash (nullable — for 30-day permanent deletion) |
| createdAt | Timestamp |

---

## Visual Anchor Integration

Visual Anchors (recurring characters/elements for consistency) get special treatment in the library:

- When the Style System creates a Visual Anchor, the generated image is saved to the library with `isVisualAnchor: true` and `visualAnchorId` linking to the style definition
- A dedicated **"Visual Anchors"** filter option appears alongside the type filters
- Visual Anchors display a distinct badge in the grid view so users spot them instantly
- When a project generates new scenes, it queries the library for Visual Anchors belonging to that channel's style — pulling them directly rather than regenerating
- Visual Anchors are never marked as intermediate (they're always kept)

---

## Multi-Project Asset References

Assets use **references, not duplicates**. One S3 file, many projects pointing to the same assetId.

- "Copy to Project" doesn't create a new S3 file — the project stores the assetId in its scene data
- Multiple projects can reference the same asset
- No duplicate files in S3, ever
- To check which projects use an asset: query the Projects table for scenes containing this assetId (only runs on delete — rare action, scan is fine)
- If an asset is deleted while referenced by a project, the project shows a placeholder: "Asset deleted — regenerate or replace"

---

## Thumbnail Previews

Every asset gets an auto-generated thumbnail for fast grid loading:

| Asset Type | Thumbnail Method |
|---|---|
| Images | 300px wide WebP thumbnail, generated by Lambda on S3 upload trigger |
| Video clips | First frame extracted as 300px WebP thumbnail |
| Final videos | First frame extracted as thumbnail |
| Audio (voiceovers, music) | No visual thumbnail — waveform icon with duration text |
| Captions | File type icon with filename |

- Thumbnails stored alongside originals in S3 under a `/thumbs/` prefix
- Grid view loads only thumbnails — full asset loads on click (preview modal)
- If thumbnail generation fails (corrupt file), asset stored but marked with "Processing failed" badge

---

## Actions on Assets

| Action | What Happens |
|---|---|
| Preview | Opens a modal with full-size preview (images), playback (audio/video) |
| Download | Downloads the file to user's local machine |
| Copy to Project | References the asset in a specific project's media panel (no S3 duplicate) |
| Rename | Changes the display filename |
| Add/Edit Tags | User can add custom tags for organization |
| Favorite/Unfavorite | Toggles the star — favorited assets sort to top and appear in Favorites tab |
| Delete | Moves to Trash tab (30-day retention, then permanent delete) |
| Restore | From Trash tab only — moves asset back to active status |
| Permanent Delete | From Trash tab only — immediately removes from S3 (no recovery) |
| Details | Shows full metadata panel (prompt, model, dimensions, license info, etc.) |
| Google Drive Export | Exports to connected Google Drive using standard folder structure |

### Deletion Protection (Three Tiers):

1. **Published video asset** — warning: "This asset is used in a published video. Deleting it won't affect the published video (already rendered), but the project can't be re-rendered without it." User can still delete.
2. **Active project asset** (not yet published) — warning: "This asset is used in [Project Name]. Deleting it will mark that scene as needing a new image/clip." User can still delete. Triggers cascade invalidation per platform-systems.md.
3. **No project references** — normal delete, straight to Trash.

### Trash Behavior:
- Deleted assets are hidden from the main library grid
- Visible only in the Trash tab
- Restorable for 30 days (clicking Restore sets status back to active)
- After 30 days: Lambda cron job permanently deletes from S3
- Permanent delete available immediately from Trash tab (for users who want instant cleanup)

---

## How Assets Get Into the Library

Assets flow in automatically — no manual step needed:

1. **Project wizard generates an image** → saved to library with projectId + channelId
2. **Standalone Generator creates a voiceover** → saved to library with no projectId, no channelId
3. **User uploads a logo** → saved to library as user_upload, no projectId
4. **Stock image downloaded in project** → saved to library with source = stock_pexels, licenseType/sourceUrl/sourceId populated
5. **Final video rendered** → saved to library as final_video with projectId + channelId
6. **User assigns a standalone asset to a channel** → channelId gets set
7. **Style System generates a Visual Anchor** → saved with isVisualAnchor: true + visualAnchorId

---

## Upload Validation

### Accepted File Types:

| Category | Accepted Types |
|---|---|
| Images | PNG, JPG, JPEG, WebP, GIF |
| Video | MP4, MOV, WebM |
| Audio | MP3, WAV, M4A, AAC, OGG |
| Blocked | Everything else — executables, archives, documents, scripts |

### Rules:
- Max file size: 500MB (matches Platform Settings)
- File header (magic bytes) validation — prevents renaming .exe to .png
- No malware scanning in v1 — file header validation + S3 built-in protections sufficient for media files
- If file can't be processed (thumbnail generation fails), still stored but marked with "Processing failed" badge

### Two-Level Validation:
1. **Frontend**: file picker restricts to accepted MIME types, size check before upload starts
2. **Lambda**: validates file header magic bytes after upload to S3 (S3 trigger), rejects and deletes if invalid

---

## Google Drive Export Structure

All Google Drive exports across the platform (Media Library, project wizard, Settings bulk export) use a consistent folder structure:

```
Faceless AI/
  └── [Channel Name]-[last4 of channelId]/
      └── [Project Name]-[last4 of projectId]/
          ├── images/
          ├── video-clips/
          ├── voiceovers/
          ├── music/
          ├── thumbnails/
          └── final/
```

- **Per-asset export:** goes into the correct subfolder based on type
- **Per-project export:** exports entire project folder
- **Bulk export from library:** groups by channel → project → type
- **Standalone assets** (no channel/project): go into `Faceless AI/Standalone/[type]/`
- **Auto-export toggle** (from Settings): uses this same structure automatically after each render
- **ID suffixes** on folder names prevent collisions when channels or projects share the same name

---

## Team Member Access (Agency Tier)

| Action | Owner | Team Member |
|---|---|---|
| View assets in assigned channels | Yes | Yes |
| View assets in unassigned channels | Yes | No (filtered out) |
| Upload new assets | Yes | Yes |
| Use assets in projects | Yes | Yes |
| Delete own uploads | Yes | Yes |
| Delete others' uploads | Yes | No |
| Favorite/tag/rename | Yes | Yes (any visible asset) |
| Bulk operations | Yes | Yes (within their permissions) |

- `uploadedBy` field tracks who created each asset
- Delete permission: owner can delete anything, team members can only delete assets where `uploadedBy` matches their account ID
- Channel filtering respects team assignments — team members only see assets from channels they have access to

---

## Storage & Lifecycle

Follows the existing S3 lifecycle policy from architecture.md:

| Asset Category | Retention |
|---|---|
| Intermediate files (drafts, unused alternatives) | Auto-deleted after 30 days (regenerable via AI) |
| Final videos | Kept indefinitely (until user deletes) |
| User uploads | Kept indefinitely (not regenerable) |
| Stock downloads | Kept indefinitely (re-downloading costs API calls) |
| Thumbnails (published) | Kept indefinitely (tied to published videos) |
| Visual Anchors | Kept indefinitely (never marked intermediate) |
| Assets in Trash | Permanently deleted after 30 days |
| Generated thumbnails (/thumbs/) | Lifecycle matches parent asset |

---

## Bulk Operations

- **Bulk select** — checkbox per asset or "select all on page"
- **Bulk delete** → moves all selected to Trash
- **Bulk download** → zips selected assets and downloads (max 500MB per zip)
- **Bulk tag** → adds a tag to all selected assets
- **Bulk export to Google Drive** → exports all selected using standard folder structure
- **Bulk restore** (from Trash tab) → restores all selected to active

---

## Usage Indicators

Each asset shows:
- Which project(s) it's used in (click to navigate to project)
- Which channel it belongs to (click to navigate to channel)
- Whether it's currently used in a published video (warning on delete)
- Whether it's an intermediate file ("Auto-cleanup in X days" badge)
- Whether it's a Visual Anchor (Visual Anchor badge)
- Whether it's favorited (star icon)

---

## Quotas

No hard quota on number of assets. Storage managed by S3 lifecycle policies. The 30-day intermediate file cleanup keeps storage reasonable. If storage costs become an issue at scale, admin can adjust lifecycle policies via Platform Settings.

---

## DynamoDB Table

| Table | Purpose | Key Schema |
|---|---|---|
| MediaAssets | All media metadata | PK: accountId, SK: assetId |

### GSIs:
- **channelId + createdAt** — channel media view
- **projectId + type** — project media panel
- **accountId + type + createdAt** — filtered global browsing
- **accountId + isIntermediate + createdAt** — lifecycle cleanup queries
- **accountId + status + createdAt** — separating active vs trashed assets
- **accountId + isVisualAnchor + channelId** — Visual Anchor lookups for scene generation
