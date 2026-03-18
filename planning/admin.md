# Admin Module — Finalized Spec

The Admin Dashboard is the platform owner's control center. It's where you manage API keys, monitor costs, handle users, configure AI models, and keep the platform running. Only the admin account can access this — regular users never see it.

**Important:** The admin account also has full consumer access (channels, projects, video creation) with no credit limits or tier gates. The admin uses the exact same UI as paying users for content creation. This dashboard is the *additional* admin-only layer on top of that.

---

## 1. Platform Overview (Admin Home)

The first thing the admin sees when opening the Admin Dashboard. A single-screen snapshot of platform health.

### Widgets:
| Widget | What It Shows |
|---|---|
| Active Users | Total registered, active in last 7 days, active in last 30 days |
| Revenue Summary | MRR, ARR, net revenue this month, growth % vs last month (from Stripe) |
| Credit Usage | Total credits consumed today / this week / this month across all users |
| Estimated API Costs | Total estimated cost today / this week / this month (calculated from credit ledger) |
| Gross Margin Indicator | Revenue vs estimated API costs — shows current margin % |
| Active Jobs | Currently running jobs (renders, voiceovers, image generation, uploads) |
| Error Rate | Errors in last 24 hours per service (fal.ai, ElevenLabs, OpenAI, YouTube) |
| Pending Actions | GDPR deletion requests, content moderation queue count, flagged accounts |

### Time Range:
- Default: last 7 days
- Options: 24 hours, 7 days, 30 days, 90 days
- All widgets update to match selected range

---

## 2. User Management

Search, view, and manage all user accounts on the platform.

### User List View:
- Searchable by: email, name, account ID
- Filterable by: tier, subscription status, signup date range, last active date
- Sortable by: signup date, last active, total credits used, total videos created
- Columns: name, email, tier, status, signup date, last active, videos created, credits used this month

### User Detail View:
When admin clicks into a specific user, they see:

| Section | Details |
|---|---|
| Account Info | Name, email, signup date, tier, subscription status, Stripe customer ID |
| Usage Stats | Credits used (this month / all time), videos created, channels, projects |
| Channels | List of all channels with connection status |
| Subscription | Current plan, billing cycle, payment history (links to Stripe) |
| Team | If Agency tier — team members list |
| Audit Trail | Last 50 actions by this user (project created, video rendered, settings changed) |

### Admin Actions on Users:
| Action | What It Does | Reversible? |
|---|---|---|
| Suspend Account | Blocks all access. User sees "Account suspended, contact support." | Yes — unsuspend |
| Unsuspend Account | Restores access. All data preserved. | — |
| Override Tier | Manually change a user's tier (e.g., give someone Pro access for free) | Yes — change again |
| Override Credits | Add or remove credits from a user's balance | Yes — adjust again |
| Force Password Reset | Sends password reset email via Cognito | — |
| Delete Account | Triggers the same GDPR deletion flow the user can trigger themselves | No — 30-day grace period, then permanent |
| Impersonate | View the platform as this user (read-only). See Section 11. | — |

### Safeguards:
- All admin actions logged to audit trail (who did what, when, to which user)
- Bulk actions NOT supported in v1 (one user at a time to prevent accidents)
- Suspend/delete require confirmation dialog ("Type SUSPEND to confirm")
- **primaryAdmin flag:** The first admin account is marked as `primaryAdmin: true` in DynamoDB. This account cannot be suspended, deleted, or have its admin role removed by any other admin. Prevents accidental admin lockout.
- **Lockout Recovery:** If the primaryAdmin account is somehow locked (e.g., Cognito password issue), recovery requires direct DynamoDB intervention — update the `primaryAdmin` flag on another admin account using AWS Console. This is documented in the ops runbook, not exposed in any UI.

---

## 3. API Keys & Services

Where the admin manages all the platform's API keys for external services. Users never see this — all AI is white-labeled.

### Services Managed:
| Service | Key Type | What It Powers |
|---|---|---|
| OpenAI | API Key | Scripts, SEO, analysis, YouTube policy checks |
| ElevenLabs | API Key | Voiceovers, music generation |
| fal.ai | API Key | Image generation, video clip generation |
| Pexels | API Key | Free stock images + video |
| Pixabay | API Key | Supplemental stock (images, video, music, SFX) |
| Mubert | API Key | Backup AI music generation |
| Stripe | Secret Key + Publishable Key | Billing, subscriptions |
| YouTube | OAuth Client ID + Secret | User YouTube connections (OAuth flow) |
| Google Drive | OAuth Client ID + Secret | User Drive export connections |
| ScrapeCreators | API Key | Social Competitor Tracker (Phase 2) |

### How Keys Are Stored:
- All keys stored in **AWS Secrets Manager** (encrypted, versioned, audited)
- Lambda functions retrieve keys at runtime from Secrets Manager
- Keys are **never displayed in the Admin Dashboard after initial entry** — admin enters the key once, it's stored, and the UI shows only a masked version (e.g., `sk-...7x3F`)
- To update a key: admin enters the new key, which overwrites the old one in Secrets Manager
- No "reveal key" button — if admin needs the key, they get it from the original service's dashboard

### Per-Service Status:
Each service card shows:
- Connection status: Active / Error / Not Configured
- Last successful call timestamp
- Error rate (last 24 hours)
- Current billing tier / quota at the provider (if available via their API)

### Key Rotation:
- Admin can update any key at any time
- Old key is immediately replaced — no grace period
- If the new key is invalid, the service will start returning errors (detected by Error Monitoring)
- Recommendation: test new keys via the provider's own dashboard before pasting into admin panel

---

## 4. Model Configuration

Controls which AI models the platform uses by default for each operation. This is how the admin optimizes for cost vs quality.

### Configurable Models:

| Operation | Options | Default |
|---|---|---|
| Script Generation | GPT-4o, GPT-4o-mini | GPT-4o |
| SEO Generation | GPT-4o, GPT-4o-mini | GPT-4o |
| Script Analysis / AI Insights | GPT-4o, GPT-4o-mini | GPT-4o |
| YouTube Policy Check | GPT-4o, GPT-4o-mini | GPT-4o-mini |
| Image Generation (Draft) | FLUX schnell | FLUX schnell |
| Image Generation (Standard) | FLUX dev, FLUX schnell | FLUX dev |
| Image Generation (Premium) | FLUX pro | FLUX pro |
| Video Clips | Sora 2, Veo 3, Kling 3 | Kling 3 |
| Voiceover | ElevenLabs (multiple models) | ElevenLabs Turbo v2.5 |
| Voiceover Fallback | OpenAI TTS | OpenAI TTS-1-HD |
| Music | ElevenLabs Music | ElevenLabs Music |
| Music Fallback | Mubert | Mubert |

### How It Works:
- Admin changes the default → all new operations use the new model
- In-progress jobs keep their original model (no mid-job switching)
- Model selection is a platform-level default — individual users don't choose models (white-label strategy)
- Exception: Image model tier (Draft/Standard/Premium) is user-facing, but which specific model backs each tier is admin-controlled

### Cost-Per-Unit Rates:
For each model/operation, admin configures the **estimated cost per unit** (per image, per 1K tokens, per minute of audio, etc.). These rates are used by the Cost Monitoring system to calculate estimated API costs from the credit ledger. Admin updates these when provider pricing changes.

---

## 5. Feature Flags

Toggle platform features on/off without deploying code. Essential for Phase 2 features and emergency shutoffs.

### Feature Flag List:

| Flag | Default | Purpose |
|---|---|---|
| socialCompetitorTracker | OFF | Phase 2 "Coming Soon" feature — flip ON when API key connected |
| videoClipGeneration | ON | Emergency kill switch if fal.ai video costs spike |
| musicGeneration | ON | Emergency kill switch for music features |
| voiceCloning | ON | Can disable if ElevenLabs changes cloning policy |
| batchGeneration | ON | Can disable if batch operations cause resource issues |
| newUserRegistration | ON | Flip OFF to close registration (e.g., during maintenance) |
| googleDriveExport | ON | Can disable if Google Drive API has issues |
| revenueAnalytics | ON | Can disable revenue tracking feature |
| maintenanceMode | OFF | Shows maintenance page to all non-admin users |

### How It Works:
- Flags stored in DynamoDB (AdminConfig table)
- Lambda checks flag before executing the feature
- Changes take effect immediately (no deploy needed)
- When a flag is OFF, the associated UI elements show "Feature temporarily unavailable" (not hidden — users know it exists)
- Admin sees toggle switch + last changed timestamp + who changed it

---

## 6. Cost Monitoring

Tracks estimated API spend across all services. This is how the admin knows if the platform is profitable.

### How Cost Tracking Works:
Cost tracking **piggybacks on the existing credit ledger** in DynamoDB. Every credit transaction already logs: userId, operation type, credits consumed, timestamp. We add one field:

```
estimatedCostUSD: 0.003  // estimated API cost for this specific operation
```

This means:
- No separate cost tracking table (avoids millions of duplicate records)
- Cost data is always in sync with credit usage (same record)
- Aggregation queries sum `estimatedCostUSD` grouped by service/operation/time period
- Cost-per-unit rates are configured in Model Configuration (Section 4) — admin updates these when provider pricing changes

### Dashboard Views:

**Cost Overview:**
- Total estimated cost: today / this week / this month / custom range
- Breakdown by service (pie chart): OpenAI, ElevenLabs, fal.ai, Mubert, infrastructure
- Breakdown by operation type: scripts, voiceovers, images, video clips, music, rendering
- Cost trend line (daily) over selected period

**Per-Service Detail:**
- Click into any service → see daily cost breakdown, operation counts, average cost per operation
- Compare to previous period (cost up/down % this month vs last month)

**Per-User Cost View:**
- Top 20 most expensive users (by estimated API cost)
- Per-user: estimated cost vs revenue from their subscription
- Flag users where estimated cost > subscription revenue (losing money on them)

**Margin Dashboard:**
- Revenue (from Stripe) vs estimated API costs
- Gross margin % per tier (are Starter users profitable? Are Agency users?)
- Trend: is margin improving or declining?

### Alerts:
| Alert | Trigger | Action |
|---|---|---|
| Daily cost spike | Any service >2x its 7-day daily average | Admin notification |
| User cost spike | Single user's daily cost >3x their tier price | Auto-pause account + admin notification (existing platform-systems.md rule) |
| Margin warning | Gross margin drops below 40% | Admin notification |
| Service outage cost | Error rate >10% on any service (wasting credits on failures) | Admin notification |

### Spend Caps:
Admin can set a global daily spend cap per service. When the cap is hit:
- New jobs for that service enter a **queue** instead of executing immediately
- Queued jobs have a **30-minute timeout** — if the cap isn't lifted or the next day hasn't started within 30 minutes, the job fails and **credits are automatically refunded** to the user
- Admin is notified immediately
- Admin can manually lift the cap or increase it
- Users see: "This service is temporarily at capacity. Your request is queued and will process shortly."

---

## 7. Error Monitoring

Real-time visibility into what's breaking across the platform.

### Error Dashboard:
- Error rate per service (last 1h / 24h / 7d)
- Error breakdown by type (auth errors, rate limits, timeouts, validation errors, server errors)
- Error trend chart (are errors increasing or stable?)
- Most recent 100 errors with details

### Per-Error Detail:
Each error log entry contains:
- Timestamp
- Service (OpenAI, ElevenLabs, fal.ai, YouTube, etc.)
- Operation type (script generation, image generation, voiceover, etc.)
- User ID (which user triggered it)
- Error code + message from the service
- Request details (what was being attempted, sanitized — no user content in logs)
- Retry count (how many auto-retries were attempted)
- Resolution (auto-resolved, pending, required manual intervention)

### Alerts:
| Alert | Trigger |
|---|---|
| Service degraded | Error rate >5% for any service (sustained over 15 minutes) |
| Service down | Error rate >50% for any service (sustained over 5 minutes) |
| Auth errors spike | >10 auth failures in 5 minutes (possible attack or Cognito issue) |
| Rate limit hit | Any service returning rate limit errors |

### Actions Admin Can Take:
- **Acknowledge alert** — marks it as seen, stops repeat notifications
- **Disable service** — feature flag kill switch (redirects to Feature Flags)
- **View affected users** — list of users who hit this error
- **Retry failed jobs** — bulk retry all failed jobs from the last X hours for a specific service

---

## 8. GDPR & Compliance

Manages data export requests, account deletions, and compliance obligations.

### Deletion Request Queue:
- Shows all pending account deletion requests (users who clicked "Delete My Account")
- Each request shows: user email, request date, days remaining in 30-day grace period, data size estimate
- Admin can: view user data, expedite deletion, cancel deletion (if user requests reactivation)
- After 30 days: deletion executes automatically (Lambda cron job)
- Admin cannot block a deletion — GDPR requires it. Admin can only expedite or let it run.

### Data Export Requests:
- Shows pending "Export My Data" requests
- Status: queued, processing, ready for download, expired
- Admin can: view request details, retry failed exports
- Exports auto-expire download links after 7 days

### Compliance Dashboard:
- Total active users with data
- Total data stored (S3 size estimate per user)
- Pending deletion requests count
- Completed deletions (last 90 days)
- Data processing agreements status (which services have DPAs signed)

---

## 9. Platform Settings

Global configuration that affects all users.

### Rate Limits:
| Setting | What It Controls | Default |
|---|---|---|
| Concurrent AI jobs (per tier) | Max simultaneous AI operations | Starter: 2, Creator: 5, Pro: 10, Agency: 25 |
| Daily burst limit | Max % of monthly credits in one day | 20% |
| API request rate limit | Max API calls per minute per user | 60 |
| File upload max size | Largest file a user can upload | 500MB |
| Max channels per account (per tier) | How many channels a user can create | Starter: 2, Creator: 5, Pro: 15, Agency: 50 |

### Tier Configuration:
Admin can modify tier parameters (credit amounts, feature access, limits) without a code deploy:

**How changes apply:**
- **Credit amount changes** (e.g., changing Starter from 5,000 to 6,000 credits): Take effect at the user's **next billing cycle**. Users on the current cycle keep their current allocation.
- **Feature access changes** (e.g., enabling voice cloning for Creator tier): Take effect **immediately** for all users on that tier.
- **Limit changes** (e.g., changing max channels): Take effect **immediately**.

Changes are logged in the audit trail with before/after values.

### Default Content Settings:
- Default video language (English)
- Default "Made for Kids" setting (No)
- Default comment moderation setting (Hold for review)
- NSFW content policy (Strict / Moderate / Off)

---

## 10. Audit Log

Immutable record of every admin action on the platform.

### What Gets Logged:
- Every admin action (user suspend, tier override, credit adjustment, key rotation, feature flag change, setting change, impersonation session)
- Timestamp + admin account ID + action type + target (user/setting/service)
- Before/after values for any change
- IP address of the admin

### Viewing:
- Searchable by: action type, target user, date range, admin account
- Exportable as CSV
- Retention: permanent (audit logs are never deleted)

### Integrity:
- Audit log entries are append-only (no editing or deleting)
- Stored in a dedicated DynamoDB table with deletion protection enabled
- Admin can view but never modify the audit log

---

## 11. Impersonation Mode

Lets the admin see the platform exactly as a specific user sees it — for debugging issues, verifying user-reported bugs, or checking what a user's experience looks like.

### How It Works:
1. Admin clicks "Impersonate" on a user from User Management
2. The BFF (Next.js backend) sets an `impersonation_target` cookie with the target user's account ID
3. All subsequent API requests from that browser session include an `X-Impersonation` header with the target's account ID
4. Lambda receives the request, sees the impersonation header, and loads the target user's data instead of the admin's
5. **All write operations are blocked** — Lambda checks for the `X-Impersonation` header and rejects any mutation (POST/PUT/DELETE that would modify data)
6. Admin sees a persistent banner: "You are viewing as [user email] — Read Only" with an "Exit" button
7. Clicking "Exit" clears the impersonation cookie and returns to normal admin view

### What Admin Can See in Impersonation:
- User's channels, projects, styles, media library
- User's settings and preferences
- User's analytics dashboards
- User's credit balance and usage history
- What the user's UI looks like (tier-gated features, etc.)

### What Admin CANNOT Do in Impersonation:
- Create, edit, or delete anything (all writes blocked)
- Trigger any AI generation
- Publish or schedule anything
- Change any settings
- Access the user's connected accounts (YouTube OAuth tokens, Google Drive)

### Logging:
- Every impersonation session logged: admin ID, target user ID, start time, end time, duration
- Visible in audit log
- If admin impersonation is detected to cause any write (should be impossible, but defense in depth), the write is blocked and an alert fires

---

## 12. Content Moderation

Lightweight review queue for content flagged by the platform's automated checks.

### What Gets Flagged:
- Images that trigger NSFW detection at "borderline" confidence (e.g., 60-85% confidence — below the auto-block threshold but above the safe threshold)
- Scripts flagged by YouTube policy check as WARNING (not FAIL)
- Thumbnails with potentially misleading text detected by the policy check
- User-uploaded voice clone samples that fail quality checks

### Moderation Queue:
- List of flagged items, newest first
- Each item shows: user, project, content type, flag reason, confidence score, the flagged content (image/text)
- Admin actions per item:
  - **Approve** — clears the flag, content proceeds normally
  - **Reject** — blocks the content, notifies user with reason
  - **Escalate** — marks for deeper review (just a tag for admin's own tracking)

### How It Fits:
- This is NOT a heavy-duty moderation system. It's a safety net for edge cases.
- Most content passes automated checks without any admin involvement
- The queue is expected to be low volume (a few items per day at scale)
- Admin gets a notification when new items enter the queue
- Items auto-expire from the queue after 7 days if not reviewed (content remains blocked during this time)
- If queue grows beyond 50 items, admin gets an alert to review

---

## 13. Admin Notifications

The admin gets their own notification system, separate from user notifications.

### Notification Channels:
- **In-dashboard:** Bell icon in Admin Dashboard header (same pattern as user notifications)
- **Email:** Critical alerts sent to admin email (configurable)

### Notification Categories:
| Category | Examples | Email? |
|---|---|---|
| Cost Alerts | Daily cost spike, margin warning, spend cap hit | Yes |
| Error Alerts | Service degraded/down, auth spike, rate limits | Yes |
| User Alerts | User cost spike (auto-paused), suspicious activity | Yes |
| GDPR | New deletion request, export request | Yes |
| Moderation | New items in moderation queue | No (in-dashboard only) |
| System | Maintenance mode changes, feature flag changes, key rotation | No (in-dashboard only) |

### Configuration:
- Admin can toggle email notifications per category
- In-dashboard notifications are always on (can't disable)
- Email notifications include a direct link to the relevant admin section

---

## DynamoDB Tables (Admin-Specific)

| Table | Purpose | Key Schema |
|---|---|---|
| AdminConfig | Feature flags, platform settings, tier configs, model configs | PK: configType, SK: configKey |
| AuditLog | Immutable admin action log | PK: YYYYMM (partition by month), SK: timestamp#actionId |
| ContentModeration | Flagged content queue | PK: status (PENDING/APPROVED/REJECTED), SK: timestamp#itemId |

**Note:** Cost tracking does NOT have its own table — it piggybacks on the existing credit ledger by adding `estimatedCostUSD` to each credit transaction record. Aggregation queries sum this field grouped by service/operation/time period.

### GSIs:
- AuditLog: GSI on targetUserId (find all actions affecting a specific user)
- AuditLog: GSI on actionType (find all actions of a specific type)
- ContentModeration: GSI on userId (find all flagged items for a specific user)

---

## Admin Access Control

- Admin accounts identified by `isAdmin: true` flag in DynamoDB user record
- The first admin account also has `primaryAdmin: true` — this account cannot be suspended, deleted, or de-admined
- Admin check happens at the Lambda level (not just frontend routing)
- Non-admin users hitting admin API endpoints get 403 Forbidden
- Admin endpoints are separate Lambda functions (or separate routes) from consumer endpoints — defense in depth
- All admin API calls require valid authentication (same Cognito + BFF pattern as consumer)
- There is no "super admin" vs "regular admin" distinction in v1 — all admins have full access
- Adding new admins: manually set `isAdmin: true` in DynamoDB (no self-service admin creation in v1)

---

## What's NOT in Admin v1

These are explicitly deferred:
- **Multi-admin roles** (viewer admin, editor admin, super admin) — all admins are equal in v1
- **Automated cost optimization** (auto-switching models based on spend) — manual admin decision for now
- **Custom email templates** — system emails use hardcoded templates
- **A/B testing framework** — no built-in experimentation
- **Bulk user operations** — one user at a time to prevent accidents
- **Self-service admin creation** — admins added via direct DynamoDB update
- **Admin API** — no external API for admin operations, dashboard-only
