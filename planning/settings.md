# Settings Module — Finalized Spec

## What This Module Does

Settings is the "control panel" for the platform — where users manage their account, connections, billing, and preferences. Much of what lives here is the UI for systems that other modules implement (auth handles security, billing handles Stripe, channel builder handles YouTube connections). Settings provides the screens plus a few things that don't belong anywhere else.

**Responsibilities:**
- Providing the UI for account profile, security, team, and billing management
- Managing external connections (YouTube, Google Drive) at the account level
- Platform-wide preferences and defaults
- Voice clone management (account-level)
- Standalone Style management
- Notification preferences
- API key management (Agency tier)
- Data export and account deletion (GDPR UI — platform-systems.md handles the job)

**What it does NOT do:** Settings doesn't implement auth logic (Cognito does that), billing logic (Stripe does that), or YouTube sync (Channel Builder does that). It provides the screens where users interact with those systems.

---

## Settings Page Structure

Settings is accessible from the global left sidebar (not inside a channel workspace). Organized into 11 sections, though most users only see 8-9 (Team is Pro/Agency only, API Access is Agency only).

---

### Section 1: Profile
- **Name** — display name across the platform (editable)
- **Email** — login email (editable, triggers re-verification via Cognito)
- **Profile picture** — upload or change (stored in S3, displayed in top bar and team member lists)
- **Time zone** — dropdown, used for scheduling features and content calendar display
- **Language** — English only in v1, but the preference is stored for future i18n

---

### Section 2: Security
- **Change password** — current + new password form (Cognito handles validation)
- **Login methods** — shows connected providers (Google, Apple) with add/remove buttons. Enforces minimum one method at all times (from auth.md).
- **Sign out everywhere** — button to invalidate all sessions across all devices (Cognito GlobalSignOut)
- **Two-factor authentication** — "Coming soon" placeholder in v1. Cognito supports TOTP and SMS MFA when ready.

---

### Section 3: Team (Pro/Agency Tiers Only)

Visible only to account owners on Pro ($199) or Agency ($399) tiers. Hidden entirely for Starter/Creator (1 seat = no team to manage).

- **Team roster** — list of members with: name, email, role (Owner/Member), last active date
- **Invite Member** button — opens email input, sends invitation (expires in 7 days)
- **Remove** button per member — with confirmation dialog. Includes reminder: "If this person had access to your API keys, consider revoking and regenerating them."
- **Transfer Ownership** button per member — triggers dual-confirmation flow (current owner + new owner must both accept)
- **Seats indicator** — "2 of 3 seats used" with link to upgrade if full

---

### Section 4: Connections

Where all external service connections live at the account level. V1 supports YouTube and Google Drive only. Social media posting (Instagram, TikTok, X, Facebook) is not in v1 — no UI for it exists until those APIs are integrated.

#### YouTube Connections
- List of all connected YouTube channels with: channel name, avatar, subscriber count, connection status (healthy / needs re-auth)
- Each shows which platform channel it's assigned to
- "Connect YouTube Channel" button (triggers OAuth flow — same flow as in Channel Builder, just accessible from here too)
- "Disconnect" per connection (with warning about publishing impact and scheduled publish cancellation)
- "Re-authorize" if token is expired/revoked
- Note: YouTube connections are also manageable from within Channel Builder. This is a convenience duplicate entry point, not a separate system.

#### Google Drive
- Connection status (connected / not connected)
- Connected account email
- "Connect Google Drive" / "Disconnect" buttons
- **Default export folder** — picker to choose where exported files go in the user's Drive (with "Change" button)
- **Auto-export toggle** — "Automatically export published videos to Google Drive" (default: OFF)
- **Export history** — last 10 exports with: status (completed/failed), file name, file size, timestamp

#### Team Member Access
Team members see all connections as **read-only** cards. They cannot add, remove, or modify connections — only the account owner can.

Each card shows: service, account name, status, which channels it's assigned to, "Connected by [Owner Name]."

Info text: "Connections are managed by the account owner. Contact [Owner Name] to add or change connections."

Future upgrade path: "Connection Manager" role permission that the owner can grant to specific team members. Clean addition, no architectural changes needed.

---

### Section 5: Billing

- **Current plan** — tier name, price, billing cycle (monthly/annual), next renewal date
- **Credits** — remaining credits / total, usage bar, reset date
- **Usage breakdown** — pie chart or bar showing credits spent by category (scripts, voiceovers, images, video clips, music, other)
- **Credit history** — scrollable list of recent credit transactions with: operation, credits used, timestamp, project name
- **Buy More Credits** — 10K credits for $15 one-time purchase button
- **Upgrade/Downgrade** — tier comparison table with current tier highlighted. Upgrade is immediate (prorated). Downgrade takes effect next billing cycle.
- **Payment method** — card on file (last 4 digits, expiry), "Update" button
- **Billing history** — list of invoices with download links (from Stripe)
- **Cancel subscription** — in the "danger zone" at the bottom, with retention prompt: "Are you sure? You'll lose access to [list features] at the end of your billing period."

**Admin accounts:** This entire section is hidden (admins have no billing). Shows a simple "Admin account — no billing" card.

**Team members:** See a simple "Your plan: Pro (managed by [Owner Name])" card. Cannot access billing details or make changes.

---

### Section 6: Notifications

Notification preferences control what gets shown in the global bell icon and what gets emailed.

**Implementation note:** The specific notification categories listed below are a starting point. The Settings page reads categories from a configuration that the Notifications module defines. Each category has: `id`, `label`, `description`, `defaultEnabled`, `canBeDisabled`. This means the Notifications module can add, remove, or rename categories without any Settings code changes. Final categories will be confirmed when the Notifications module is discussed.

#### Email Notifications (toggles)
- Trial/subscription reminders (on by default)
- Payment failure alerts (on by default, **cannot be disabled** — critical)
- Team invitations/removals (on by default)
- Rendering complete (on by default)
- Publishing complete (on by default)
- YouTube sync issues (on by default)
- AI suggestions ready (off by default — could be noisy)
- Weekly channel digest (off by default)

#### In-App Notifications (toggles)
- Project status updates (on by default)
- AI suggestions (on by default)
- Niche alerts (on by default)
- Research Board monitoring (on by default)
- Channel milestones (on by default)

**Team members:** Each team member manages their own notification preferences independently.

---

### Section 7: Styles

Access point for standalone Styles (not attached to any channel). As defined in style-system.md, standalone Styles are accessible from here, the Channels page (collapsed section), and Channel Style page ("Duplicate as Standalone").

- **List of all standalone Styles** with: name, niche, Style Score, created date
- Per-style actions: "Attach to Channel" / "Delete" / "Edit" / "Duplicate"
- **"Create Standalone Style" button** (75 credits)
- Channel-attached Styles are NOT shown here (managed from within the channel workspace)

---

### Section 8: Voices & Clones

Account-level voice management. Voice clones are tier-gated (Starter: 1, Creator: 5, Pro: 15, Agency: 30) and shared across all channels.

#### Voice Clones
- **Clone slots indicator:** "2 of 5 voice clones used" with tier limit shown
- **List of all clones:** Each shows: name, preview (play button — 5-second sample), created date, which channels use it as default, quality indicator

**"Create Voice Clone" button:**
1. Upload voice sample(s) — minimum 1 minute of clean audio, recommended 3+ minutes for better quality
2. Name the voice (e.g., "Deep Male Narrator," "Energetic Female Host")
3. System processes via ElevenLabs Voice Cloning API (Instant Voice Cloning)
4. Preview generated — user approves or re-uploads with better audio
5. Clone saved to account, available in all channels' voiceover step
6. Cost: **50 credits** (already in billing.md as "Voice design (create new)")

**Per-clone actions:**
- **Rename** — change the display name
- **Test** — type any text and hear the clone speak it (free, no credits)
- **Delete** — removes the clone, frees up a slot. Confirmation: "This voice is used as the default in [X] channels. Existing projects keep their generated audio, but new projects won't be able to use this voice."
- **Re-train** — upload new/additional samples to improve quality (50 credits, replaces the existing clone data)

#### Default Voices (Not Clones)
Below the clones section: list of platform-provided voices (ElevenLabs stock voices). These don't count toward clone slots — always available to everyone.

Each shows: name, gender, accent/style description, preview play button.

Categorized: Male / Female / Neutral, with tags like "Authoritative," "Friendly," "Documentary," "Energetic."

**How voices connect to other modules:**
- Channel Settings has a "Default voice" dropdown — pulls from this account-level list (clones + stock voices)
- The Voiceover step in the project wizard also pulls from this list
- Voice selection is per-project (overridable) with the channel default as the pre-fill

---

### Section 9: Preferences

Per-user preferences. Each team member has their own preferences (not shared across the account).

- **Default visual quality tier** — Draft / Standard / Premium (pre-fills new projects)
- **Default video format** — Long-Form / Shorts (pre-fills new projects)
- **Auto-save interval** — how often the wizard auto-saves progress (default: 30 seconds, options: 15s / 30s / 60s / manual only)
- **Theme** — Light / Dark mode (v1 ships with light mode only, dark mode as a fast follow)
- **Content calendar start day** — Monday / Sunday (affects weekly view in content calendar)

#### Default Priority Chain

When creating a new project, defaults resolve in this order (highest wins):

1. **Project-level override** — user explicitly sets a value in the wizard → always wins
2. **Channel default** — set in Channel Settings → used if no project override
3. **Global default** — set here in Preferences → used if channel hasn't set one
4. **System default** — hardcoded platform defaults → used if nothing else is set

The wizard just shows the pre-filled value with no source annotation — users don't need to know where a default came from, they just change it or keep it. Source indicators are shown only in the places where defaults are configured: Settings → Preferences says "Channels can override this" and Channel Settings → Defaults says "Overrides your global default of [value]."

---

### Section 10: Data & Privacy

- **Export My Data** — triggers GDPR data export (ZIP file containing all projects, channel data, settings, usage history, media library contents). Available within 24 hours. Download link emailed, expires in 7 days.
- **Delete My Account** — triggers GDPR deletion flow. Type "DELETE" to confirm. 30-day grace period (account frozen, data preserved, can reactivate). After 30 days: permanent deletion of all data.
- If account owner with team members: shows team impact warning before proceeding — "You have [X] team members who will lose access."
- Link to Privacy Policy
- Link to Terms of Service
- "Your data" summary: "We store your data in AWS (US region). Your content is processed by our AI engine. See our Privacy Policy for details."

**Team members:** Can export their own identity data and delete their own user account (removes them from the team). Cannot export or delete the team's shared data.

---

### Section 11: API Access (Agency Tier Only)

Visible only to account owners on the Agency ($399) tier. Team members cannot access this section — API keys are owner-managed only.

#### API Keys
- **"Generate API Key" button** — creates a new key with a name/label (e.g., "Production," "Staging," "Partner Integration")
- Each key shows: name, key prefix (first 8 characters + masked), created date, last used date, status (active/revoked)
- **"Revoke" button** per key (with confirmation — irreversible)
- Maximum **5 active API keys** per account
- Keys shown in full exactly once at creation — after that, only the prefix is visible (same pattern as Stripe/AWS key management)
- Keys stored hashed in DynamoDB (can verify but not retrieve)

#### API Usage
- Total API calls this month
- Credits consumed via API this month (counts against the same credit pool as UI usage)
- Bar chart: API calls per day over the last 30 days

#### API Rate Limits
- 60 requests per minute
- 10,000 requests per day
- Each API call costs the same credits as the equivalent UI operation
- Exceeding limits returns 429 Too Many Requests

#### API Security
- Authenticated via `X-API-Key` header, validated by Lambda authorizer
- Each key scoped to the parent account (same `accountId` as the owner)
- V1: all keys have full account access. Per-key permission scoping (read-only keys, endpoint restrictions) is a v2 feature.
- All API activity logged: key used, endpoint, timestamp, credits consumed
- Link to API documentation (hosted separately)

---

## Google Drive Export — Action Points

The Google Drive connection is managed in Settings. The actual export actions live in these locations:

### Per-Project Export (Primary Use Case)
- Available on any project in RENDER_COMPLETE, READY_TO_PUBLISH, or PUBLISHED state
- "Export" dropdown button with options:
  - "Download to computer" (direct browser download)
  - "Export to Google Drive" (if Drive is connected)
- Exports: final rendered video + thumbnail + script (as text file) + captions (as SRT file)
- Files go to the default Drive folder (set in Settings), inside a subfolder named after the project
- Progress shown inline: "Uploading to Google Drive... 45%"
- Notification when complete: "Exported [Project Name] to Google Drive"

### Bulk Export from Channel Workspace
- In the channel's Projects list: multi-select checkbox on published projects
- "Export Selected" button → same options (download ZIP or export to Drive)
- Maximum 10 projects per bulk export

### Media Library Export
- Individual assets (images, audio, video clips) have an "Export to Drive" option in their action menu
- Bulk select + export also available

### Automatic Export (Optional)
- Toggle in Settings → Connections → Google Drive: "Auto-export published videos to Google Drive"
- When enabled: every time a project reaches PUBLISHED state, final video + thumbnail auto-exports
- Default: OFF

### Export Failure Handling
- If Google Drive is full: "Export failed — your Google Drive storage is full. Free up space and try again."
- If Drive connection is broken: "Export failed — please reconnect Google Drive in Settings."
- If file is too large: "Export failed — file exceeds Google Drive's upload limit. Download to your computer instead."

---

## Settings Within Channel Workspace

Channel-level settings are separate from global Settings and live inside the channel workspace sidebar under "Settings." Defined in channel-builder.md, listed here for cross-reference:

- Channel name, niche, description
- Default project settings (video length, voice, visual tier, music mood, caption style, thumbnail approach)
- Publishing defaults (YouTube category, language, Made for Kids, comments, visibility, playlist)

These are NOT part of the global Settings page.

---

## Navigation and Access

- **Global sidebar:** "Settings" menu item with a gear icon, always visible
- **Top bar profile menu:** Clicking the user avatar in the top-right shows a dropdown with: Profile, Settings, Billing, Sign Out
- **Quick links from contextual locations:**
  - "Manage billing" on credit warning banners → opens Settings → Billing
  - "Update payment method" on failed payment banners → opens Settings → Billing
  - "Manage team" from team-related notifications → opens Settings → Team
  - "Connect YouTube" from Channel Builder → opens YouTube OAuth (same flow, different entry point)
  - "Manage voices" from voiceover step → opens Settings → Voices & Clones
- **URL structure:** Each section is directly linkable (e.g., `/settings/billing`, `/settings/team`, `/settings/voices`) so banners and notifications can deep-link to the right section

---

## Permissions Summary

| Section | Owner | Team Member |
|---|---|---|
| Profile | Full access | Own profile only |
| Security | Full access | Own security only |
| Team | Full access | Hidden |
| Connections | Full access (add/remove/modify) | Read-only |
| Billing | Full access | See plan name only |
| Notifications | Full access | Own preferences only |
| Styles | Full access | Full access (uses team credits) |
| Voices & Clones | Full access | Full access (uses team credits) |
| Preferences | Full access | Own preferences only |
| Data & Privacy | Full access | Own identity export/delete only |
| API Access | Full access (Agency only) | Hidden |

---

## Error Handling

| Scenario | User Sees |
|---|---|
| Email change fails verification | "Verification failed. Your email remains unchanged. Try again?" |
| Social provider disconnect blocked (last method) | "You need at least one sign-in method. Add a password before removing this one." |
| Team invitation to existing team member | "This person is already on your team." |
| Team invitation to someone on another team | "This person is already a member of another team. They need to leave that team first." |
| Payment method update fails | "We couldn't update your payment method. Check the card details and try again." |
| Google Drive connection fails | "We couldn't connect to Google Drive. Make sure you allowed access and try again." |
| Google Drive full on export | "Export failed — your Google Drive storage is full. Free up space and try again." |
| Data export in progress | "Your data export is being prepared. We'll email you a download link within 24 hours." |
| Account deletion while team owner | "You have [X] team members. Remove them or transfer ownership before deleting your account." |
| Voice clone upload too short | "Audio sample must be at least 1 minute long. Longer samples produce better results." |
| Voice clone slots full | "You've used all [X] voice clone slots. Delete an existing clone or upgrade your plan." |
| API key generation at max | "You've reached the maximum of 5 API keys. Revoke an existing key to create a new one." |

---

## Credit Costs (Settings Module)

| Operation | Credits | Notes |
|---|---|---|
| All settings changes | Free | Configuration, not generation |
| Create standalone Style | 75 credits | Defined in style-system.md |
| Create voice clone | 50 credits | Defined in billing.md |
| Re-train voice clone | 50 credits | Replaces existing clone data |
| Test voice clone (type & hear) | Free | Preview only |
| Data export | Free | GDPR right, never gated |
| Account deletion | Free | GDPR right, never gated |
| Google Drive export | Free | File transfer, not generation |

---

## Connection to Other Modules

| Module | How Settings Connects |
|---|---|
| **Auth** | Profile and Security sections are the UI for auth operations (password change, provider management, session management) |
| **Billing** | Billing section is the UI for Stripe subscription management (tier changes, payment method, invoices, credit purchases) |
| **Channel Builder** | YouTube connections managed here are the same ones Channel Builder uses. Same component, two entry points. |
| **Style System** | Styles section provides one of the access points for managing standalone Styles |
| **Voiceovers** | Voices & Clones section manages the account-level voice library that the voiceover step pulls from |
| **Platform Systems** | Data export and account deletion trigger GDPR jobs defined in platform-systems.md |
| **Notifications** | Notification preferences control what gets shown and emailed. Categories defined by Notifications module, rendered dynamically by Settings. |
| **Publishing** | Google Drive export is triggered from published projects. Connection managed here. |
| **Admin Dashboard** | API key management (Agency) is in Settings. Admin-level API key management for platform services is in Admin Dashboard. |
