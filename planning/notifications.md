# Notifications System — Finalized Spec

The platform uses three distinct notification layers, each designed for a different context. Instead of one bell that handles everything, notifications appear where they're most useful — global events in the navbar, channel tasks on the channel dashboard, and real-time feedback inline within the project you're working on.

---

## The Three Layers

| Layer | Where It Lives | What It's For | Persistence |
|---|---|---|---|
| **Global Bell** | Top navbar, visible on every page | Platform-wide events not tied to where you're currently looking | Persisted until dismissed |
| **Channel Dashboard Cards** | Channel workspace dashboard | Channel-specific action items computed from real state | Computed on page load, dismissable |
| **Inline Project Alerts** | Inside the project wizard / editor | Real-time feedback about the current project's operations | Transient — disappears when resolved or navigated away |

### Why Three Layers

- If you're in the project editor and a render finishes, you need to know immediately **right there** — not buried in a bell menu
- If your YouTube channel gets disconnected while you're browsing Niche Finder, the bell catches it
- If a channel has 3 projects waiting for review, that belongs on the channel dashboard — not cluttering the global bell

---

## Layer 1: Global Bell

The bell icon in the top-right navbar. Badge shows unread count. Click to open a dropdown panel.

### Notification Categories:

| Category | Examples |
|---|---|
| Billing & Credits | "Credit balance below 10%", "Subscription renewal failed", "Payment method expiring soon" |
| Account | "Team member accepted invitation", "Password changed successfully", "New device login detected" |
| Publishing | "Video published successfully to [Channel]", "Scheduled publish failed — YouTube quota exceeded" |
| System | "Platform maintenance scheduled for [date]", "New feature available: [feature name]" |
| AI Jobs (long-running) | "Batch generation complete — 10 outlines ready", "Style generation complete for [Channel]" |
| Errors (cross-cutting) | "YouTube connection lost for [Channel]", "Google Drive export failed" |

### Notification Structure:
Each notification contains:
- **Icon** — category-specific (credit card, upload, warning, check, etc.)
- **Title** — short summary (e.g., "Video Published")
- **Body** — one line of detail (e.g., "Top 10 Facts About Space is now live on Space Explorer channel")
- **Timestamp** — relative (e.g., "2 minutes ago", "Yesterday")
- **Action link** — click to navigate to the relevant page (project, channel, settings, etc.)
- **Read/unread status** — unread notifications are visually distinct (bold or highlighted)

### Behavior:
- Badge count shows unread notifications (max display: "99+")
- Clicking the bell opens dropdown panel showing latest 20 notifications
- "Mark all as read" button at the top
- "View all" link at the bottom → full notifications page with infinite scroll
- Individual notifications can be dismissed (X button) or clicked (navigates to action link and marks as read)
- Notifications arrive in real-time via WebSocket (same connection used for job progress)

### Full Notifications Page:
- Accessible from "View all" in the bell dropdown or from Settings sidebar
- All notifications with infinite scroll
- Filterable by category
- Bulk "mark as read" and "dismiss all read" actions
- No delete — dismissed notifications are hidden but retained in DynamoDB for 90 days (for support/debugging)

---

## Layer 2: Channel Dashboard Cards

When a user opens a channel workspace, the dashboard shows cards for things that need attention. These are more actionable than bell notifications — they're task-oriented.

### How Cards Work:
Cards are **computed from project/channel state on page load**, NOT filtered from the Notifications table. They are a completely separate system from bell notifications.

When the dashboard loads, Lambda queries real state:
1. Projects with status "ready_for_review" → "Projects Ready for Review" card
2. Projects with status "published" in last 48h → "Publishing Results" card
3. Channel connection status → "Connection Issue" card if disconnected
4. Style evolution suggestions flag → "Style Update Available" card if ready
5. Credit burn rate vs remaining → "Credit Warning" card if on pace to exhaust
6. Failed jobs for this channel → "Failed Jobs" card
7. YouTube sync results → "Sync Status" card if new insights found
8. Onboarding checklist → "Onboarding" card if steps incomplete

This means cards are always accurate — they reflect real state, never stale notification records.

### Card Types:

| Card | When It Appears | Action |
|---|---|---|
| Projects Ready for Review | A project's AI generation is complete and waiting for user review | Click → opens project |
| Publishing Results | A video was published — shows view count, like count after 24h/48h | Click → opens post-publish dashboard |
| Style Update Available | Analytics suggest style adjustments (min 5 videos, from Style evolution) | Click → opens Style editor with suggestions |
| Connection Issue | YouTube connection lost or token expired | Click → opens Settings > Connections |
| Credit Warning | Channel's recent usage rate will exhaust credits before next billing cycle | Click → opens Settings > Billing |
| Sync Status | YouTube data sync completed with new insights | Click → opens Analytics |
| Failed Jobs | Any job in this channel that failed and needs attention | Click → opens the failed project/step |
| Onboarding Checklist | Incomplete onboarding steps for this channel | Click → opens relevant step |

### Behavior:
- Cards appear at the top of the channel dashboard
- Ordered by priority: errors first, then action items, then informational
- Each card has a dismiss (X) button — sets a `dismissedUntil` timestamp on a simple DynamoDB record (accountId + channelId + cardType) so it doesn't reappear for that specific event
- When the underlying state changes (new failure, credits replenished), dismissed flags become irrelevant because conditions have changed — new cards appear naturally
- Cards auto-resolve when the underlying condition is fixed (e.g., "Connection Issue" disappears when the user reconnects YouTube)
- Maximum 5 cards visible at once — "Show more" if there are additional
- Cards are channel-scoped — each channel has its own set

### WebSocket Fallback for Cards:
Since cards are computed from state, they don't depend on WebSocket for delivery. If WebSocket is down, the dashboard still shows correct cards on page load. For users sitting on the dashboard with a dead WebSocket, the cards section auto-refreshes every 60 seconds (just the cards, not the whole page) to catch state changes like job completions or connection drops.

---

## Layer 3: Inline Project Alerts

Real-time feedback inside the project wizard and editor. These are contextual to exactly what the user is doing.

### Alert Types:

| Alert | Where It Shows | When |
|---|---|---|
| Job Progress | Current wizard step | AI generation in progress — progress bar with percentage and estimated time |
| Job Complete | Current wizard step | "Scene 3 image generated" — with preview thumbnail |
| Job Failed | Current wizard step | "Image generation failed for Scene 3 — Retry or Replace" with action buttons |
| Validation Warning | Relevant step | "Script exceeds recommended length for Shorts (>60 seconds)" |
| Credit Usage | Credit estimator area | "This step will use approximately 15 credits (balance: 230)" |
| Cascade Alert | Editing step | "Script was modified — scenes 3, 5, 7 need new images" (from cascade invalidation) |
| Publishing Status | Step 7 | "Uploading to YouTube... 45%", "Processing...", "Published!" |
| Save Confirmation | Any step | "Draft saved" — auto-save indicator |

### Behavior:
- Inline alerts appear within the relevant section of the page (not a separate panel)
- They are transient — success alerts auto-dismiss after 5 seconds, errors persist until acted on
- Progress bars update in real-time via WebSocket
- Errors include action buttons (Retry, Skip, Replace) specific to the failure
- No persistence — inline alerts are gone when you leave the page. The underlying state (job status, validation issues) is persisted in the project record, and the alerts regenerate from state when you return.

---

## Team Member Notification Routing

For Agency tier accounts with team members, notifications go to **the person who triggered the action**, not the account owner.

### Routing Rules:
| Event Type | Who Gets Notified |
|---|---|
| Job complete/failed | The team member who triggered it |
| Publishing success/failure | Both the team member AND the account owner (publishing is significant enough the owner should know) |
| Billing & credit events | Account owner only (team members don't manage billing) |
| Connection issues | Account owner only (they manage connections) |
| Account security (new device, password change) | Each person gets their own |
| System announcements | Everyone on the account |

### Implementation:
The Notifications table `accountId` field stores the **recipient's** account ID (not the workspace owner). For dual-notify scenarios (like publishing), two separate notification records are created — one for each recipient. Simple, no complex routing logic needed.

---

## Notification Batching

When multiple events of the same type fire in rapid succession (e.g., batch generation completing), they get collapsed into a single notification.

### Batching Rules:
- If **3+ notifications** of the same type, same scope, and same channelId/projectId arrive within **60 seconds**, collapse them into one summary notification
- Examples:
  - 10 batch outlines complete → "Batch generation complete — 10 outlines ready for review"
  - 5 scene images generated → "5 images generated for [Project Name]"
  - 3 voiceovers complete → "3 voiceovers generated for [Project Name]"

### How It Works Server-Side:
1. Lambda creates a notification → checks if there's a pending notification of the same type + scope + channelId/projectId created within the last 60 seconds
2. If yes: increment the counter on the existing notification and update the body text
3. If no: create a new notification normally
4. The 60-second window ensures rapid bursts get batched while spaced-out events remain individual

### Action Links on Batched Notifications:
- Batched notifications link to the **parent project** (not a specific scene/step), so the user sees all results in context
- Single (non-batched) notifications still link to the specific scene or step

### Email Batching:
For real-time email notifications, add a **2-minute send delay**. The email Lambda collects events for 2 minutes, then sends one email summarizing all events in that window. Prevents 10 separate emails from batch operations.

---

## Notification Preferences (Settings Integration)

From settings.md, the Notifications section is data-driven from this module.

### User-Configurable Preferences:
| Setting | Options | Default |
|---|---|---|
| Email notifications | Per-category toggle (Billing, Account, Publishing, Errors) | Publishing + Errors ON, others OFF |
| Bell notifications | Per-category toggle | All ON |
| Channel cards | Cannot be disabled (always shown when relevant) | — |
| Inline alerts | Cannot be disabled (always shown when relevant) | — |
| Email digest | Real-time OR daily digest | Real-time |
| Quiet hours | Set hours when no real-time email notifications are sent | OFF |

### Email Rules:
- Only sent for categories the user has enabled
- Each email includes: notification content, action link, unsubscribe link for that category
- Daily digest option: batches all notifications into one email per day (sent at user's preferred time or 9 AM default)
- **Quiet hours apply to real-time emails only, not to digests.** The daily digest always sends at the scheduled time regardless of quiet hours. If users don't want a digest at a certain time, they change the digest time — quiet hours don't block it.
- Transactional emails (password reset, payment confirmation) are NOT affected by notification preferences — they always send

---

## Standalone Generator Notifications

The Standalone Generator creates notifications with context-aware routing:
- **User is on the generator page:** Inline preview update only (no bell notification — you're already looking at it)
- **User has navigated away:** Bell notification ("Image generation complete" or "Video clip generation failed — credits refunded")

Detection: the WebSocket event includes `source: "standalone_generator"`. The frontend checks if the Standalone Generator page is currently active. If yes → inline only. If no → bell notification. This keeps the generator snappy when you're using it directly and catches you if you've wandered off during a longer video clip generation.

---

## WebSocket Integration

Notifications rely on the existing WebSocket connection defined in platform-systems.md (used for job progress tracking).

### How It Works:
1. User connects to WebSocket on app load (authenticated via session token)
2. Server pushes events through the connection: job progress, job complete, job failed, new notification
3. Frontend receives events and routes them to the correct layer:
   - Job progress/complete/failed in current project → Inline alert
   - Channel-specific events → Channel dashboard card refresh (if on that channel's dashboard)
   - Everything → Global bell (always)
4. If WebSocket disconnects, the frontend falls back to polling every 30 seconds for missed bell notifications
5. On reconnect, any missed notifications are fetched and displayed

### Event Routing Logic:
Each notification event from the server includes:
- `type` — the notification category
- `scope` — "global", "channel", or "project"
- `channelId` — which channel (if applicable)
- `projectId` — which project (if applicable)
- `priority` — "info", "warning", "error"
- `source` — which module generated it

The frontend uses `scope` + current page context to decide which layer(s) to display the notification in. A single event can trigger multiple layers (e.g., "render complete" shows as an inline alert if you're in that project, AND as a bell notification).

---

## Notification Generation

Notifications are created server-side by the relevant Lambda functions. Each module is responsible for creating its own notifications.

### Which Modules Create Notifications:

| Module | Notifications It Creates |
|---|---|
| Projects/Wizard | Job progress, job complete, job failed, validation warnings, cascade alerts |
| Publishing | Upload progress, publish success/failure, scheduled publish reminders |
| Billing | Credit warnings, payment failures, subscription changes, approaching limits |
| Auth | New device login, password changes, team invitations |
| Channel Builder | YouTube sync complete (only if new insights), connection status changes, onboarding reminders |
| Style System | Style generation complete, style evolution suggestions ready |
| Analytics | Weekly insights ready, sentiment analysis complete |
| Standalone Generator | Generation complete/failed (bell only if user navigated away) |
| Admin (system) | Maintenance announcements, feature releases |

### How Notifications Are Created:
1. Lambda function completes an operation (e.g., video published)
2. Lambda writes a notification record to DynamoDB
3. Lambda pushes the event to WebSocket (via API Gateway WebSocket endpoint)
4. Frontend receives and displays immediately
5. If user is offline, the notification waits in DynamoDB — fetched on next app load

---

## Deduplication

Some events could generate duplicate notifications if not handled:

| Scenario | Rule |
|---|---|
| Credit warning | Send once when crossing 20% threshold, once more at 5%. Don't repeat until credits are replenished and drop again. |
| YouTube sync | Only create a notification if the sync found meaningful changes (new videos detected, metrics significantly changed). Don't notify on every routine sync. |
| Connection issues | Send once when detected. Don't repeat until connection is restored and breaks again. |
| Failed jobs | One notification per failed job. Retrying and failing again updates the existing notification instead of creating a new one. |
| Burst events | Batching rules apply (3+ of same type within 60 seconds → collapsed). See Notification Batching section above. |

---

## Admin vs Consumer Notification Separation

The admin has a separate notification bell in the Admin Dashboard. Consumer and admin notifications share infrastructure but are cleanly separated.

| Aspect | Consumer Notifications | Admin Notifications |
|---|---|---|
| Bell location | Main app navbar (top right) | Admin Dashboard navbar only |
| When visible | When using the platform as a regular user | When in the Admin Dashboard |
| DynamoDB table | Notifications (same table) | Notifications (same table) |
| WebSocket | Same connection, different event routing | Same connection, different event routing |

### How Separation Works:
Notifications are separated using a **sort key prefix** on the DynamoDB table:
- Consumer notifications: `SK: user#createdAt#notificationId`
- Admin notifications: `SK: admin#createdAt#notificationId`

Same table, same query patterns — just different SK prefix. No extra GSI or filter expression needed. The frontend queries with the appropriate prefix based on which context the admin is in.

When the admin is using the platform as a regular user (making videos), they see the **consumer bell only** with their consumer notifications. When they're in the Admin Dashboard, they see the **admin bell only** with admin notifications. No mixing, no dual bells on the same screen.

---

## DynamoDB Table

| Table | Purpose | Key Schema |
|---|---|---|
| Notifications | All user + admin notifications | PK: accountId, SK: user#createdAt#notificationId (or admin# prefix) |
| CardDismissals | Tracks dismissed channel dashboard cards | PK: accountId#channelId, SK: cardType |

### Notification Fields:
| Field | Description |
|---|---|
| notificationId | UUID |
| accountId | Recipient |
| type | Category (billing, publishing, error, etc.) |
| scope | global, channel, project |
| channelId | Nullable |
| projectId | Nullable |
| priority | info, warning, error |
| title | Short summary |
| body | One-line detail |
| actionLink | URL path to navigate to |
| status | unread, read, dismissed |
| batchCount | Number of events collapsed into this notification (default: 1) |
| emailSent | Boolean — whether email was sent for this notification |
| source | Which module generated it |
| createdAt | Timestamp |
| expiresAt | TTL — 90 days after creation (auto-deleted by DynamoDB TTL) |

### GSIs:
- **accountId + status + createdAt** — unread notifications query (for badge count and bell dropdown)
- **accountId + scope + channelId + createdAt** — channel-specific notifications

### CardDismissals Fields:
| Field | Description |
|---|---|
| accountId#channelId | Composite PK |
| cardType | Which card type was dismissed |
| dismissedUntil | Timestamp — card stays hidden until this time or until state changes |

---

## What's NOT in v1

- **Push notifications** (mobile/browser push) — in-app + email only
- **SMS notifications** — email only for external delivery
- **Notification sounds** — no audio alerts
- **Slack/Discord integration** — no third-party notification delivery
- **Custom notification rules** — predefined categories only, no user-defined triggers
- **Notification grouping beyond batching** — each notification is individual (batching handles rapid bursts, but no general rollup like "3 videos published this week")
