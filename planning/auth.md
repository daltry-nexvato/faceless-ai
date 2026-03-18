# Auth (Cognito) Module — Finalized Spec

## What This Module Does

Auth handles everything about who you are, how you sign in, and how the system knows what you're allowed to do. It's the "front door" of the platform.

**Responsibilities:**
- User registration (new accounts)
- Login / logout
- Password management (reset, change)
- Email verification
- Social sign-in (Google, Apple)
- Session management (keeping you logged in, timing out)
- Team seats (multiple people sharing one account on higher tiers)
- Admin vs. User account types
- Free trial account creation
- JWT tokens for securing every API call
- Account-level data (profile, preferences)
- Account deactivation and deletion (ties into GDPR from platform-systems.md)

**What it does NOT do:** YouTube OAuth (Channel Builder's job — separate OAuth flow with different scopes). Social media OAuth for publishing (managed at account level in Settings). Billing/subscription (Stripe handles that, billing module manages it).

---

## AWS Cognito Setup

### User Pool Configuration
- **One User Pool** for the entire platform (all users + admin in the same pool)
- **Sign-in options:** Email + password, Google sign-in, Apple sign-in
- **Username:** Email address (no separate username — email IS the identifier)
- **Required attributes:** email (verified), name
- **Optional attributes:** none stored in Cognito — everything else lives in DynamoDB (keeps Cognito lean)

### Custom UI (No Hosted UI)
- All auth pages are custom-built within our Next.js app — no Cognito Hosted UI
- Full branding control — our logo, our colors, our layout. Users never see AWS or Cognito branding.
- Consistent with the "white-label everything" philosophy from architecture.md
- Social sign-in buttons trigger OAuth flows via AWS Amplify Auth library (`@aws-amplify/auth`), which handles the redirect to Google/Apple and back
- **Auth pages we build:**
  - `/login` — email/password form + Google/Apple buttons
  - `/register` — name, email, password form + Google/Apple buttons + password strength indicator
  - `/verify` — 6-digit code input after registration
  - `/forgot-password` — email input
  - `/reset-password` — code + new password form

### Why Cognito?
- AWS-native — integrates with Lambda, API Gateway, and Amplify (our existing stack)
- Handles password hashing, token management, and OAuth flows out of the box
- Scales automatically — no login infrastructure to manage
- Supports social sign-in providers (Google, Apple) with minimal configuration
- Cost: Free up to 50,000 monthly active users (won't hit that for a long time)

---

## Token Strategy — Backend-for-Frontend (BFF) Pattern

### How Tokens Work
- **ID Token:** Contains user identity (email, name, Cognito sub ID, custom claims). Short-lived: 1 hour.
- **Access Token:** Used to authorize API calls. Short-lived: 1 hour.
- **Refresh Token:** Used to silently get new ID + access tokens. Long-lived: 30 days.
- All tokens are JWTs signed by Cognito.

### How Tokens Are Stored and Used
Tokens are stored in **HttpOnly, Secure, SameSite=Lax cookies** — browser JavaScript can never read them.

All API calls go through **Next.js Route Handlers** (server-side). The flow:
1. Frontend makes a request to a Next.js Route Handler (e.g., `/api/projects`)
2. Next.js server reads the access token from the HttpOnly cookie (server-side code CAN read cookies)
3. Next.js validates the JWT and forwards the request to downstream services (Lambda, DynamoDB) with the decoded claims
4. Response flows back through Next.js to the frontend

**Token refresh** also happens server-side: when Next.js detects an expired access token, it uses the refresh token to get new tokens from Cognito, updates the cookies, and retries the request — the user never notices.

### Why This Pattern
- **XSS-proof:** Tokens are never exposed to browser JavaScript (HttpOnly cookies can't be stolen by malicious scripts)
- **No CSRF risk:** SameSite=Lax cookies block cross-site requests but allow OAuth redirects
- **Clean architecture:** Next.js Route Handlers serve as both the API layer and the token manager — no separate API Gateway needed for most operations
- **Standalone Lambda still used for:** async callbacks (video rendering complete), webhooks (Stripe, YouTube), and background jobs that aren't triggered by user requests

### Why SameSite=Lax (Not Strict)
- SameSite=Strict would block cookies on OAuth redirects from Google/Apple back to our site — users would appear logged out after completing OAuth
- SameSite=Lax allows cookies on top-level navigations (like OAuth redirects) but still blocks cross-site POST/AJAX requests
- Combined with HttpOnly + Secure flags, this is the industry standard for OAuth-supporting apps

---

## Registration Flow

### Email + Password Sign-Up
1. User fills in: Name, Email, Password
2. Invisible reCAPTCHA v3 scores the request (see Bot Prevention section)
3. Password requirements validated inline (see Password Requirements below)
4. Cognito Pre Sign-Up Lambda checks: does this email already exist? Is the email domain disposable?
5. Cognito creates the user in UNCONFIRMED state
6. Verification email sent with a 6-digit code (Cognito's default, customized email template with our branding)
7. User enters the code on the verification screen
8. Account moves to CONFIRMED state
9. Automatic login after verification
10. DynamoDB record created: Account record with default settings, `role: "user"`, `tier: "starter"`, `subscriptionStatus: "trial"`, `trialStartDate`, `trialEndDate`
11. Redirects to first-time onboarding (Channel Builder's Welcome Flow)

### Google Sign-In
1. User clicks "Sign in with Google"
2. Amplify Auth redirects to Google's OAuth consent
3. User authorizes (or is already logged in with Google)
4. Cognito receives Google's ID token
5. **If new user (no email match):** Cognito creates user, email automatically verified (Google guarantees it), DynamoDB record created, redirects to onboarding
6. **If returning user (email matches existing federated link):** logs in, redirects to dashboard
7. **If email matches an existing email+password account:** see Account Linking below (does NOT auto-link)

### Apple Sign-In
1. User clicks "Sign in with Apple"
2. Amplify Auth redirects to Apple's OAuth
3. User authorizes with Face ID / Touch ID / password
4. Apple provides a private relay email or real email (user's choice)
5. If Apple provides a private relay email: stored as-is (e.g., `abc123@privaterelay.appleid.com`). All platform emails go through Apple's relay. Works fine.
6. If new user: DynamoDB record created, redirects to onboarding
7. If returning user: logs in

### Account Linking (Verification Required)

Auto-linking on email match is disabled — it's a security risk (attacker with your email could sign in via Google and access your account). Instead:

**User has email+password account, tries Google sign-in with same email:**
1. System detects email match
2. Shows: "An account with this email already exists. Sign in with your password to link your Google account."
3. User signs in with password (or resets password if forgotten)
4. After successful password auth, Google is linked to the existing account
5. Future Google sign-ins go straight to the same account

**User has Google account, tries email+password sign-up with same email:**
1. Registration form checks if email exists
2. Shows: "An account with this email already exists. Try signing in with Google, or reset your password."

**Implementation:** Cognito Pre Sign-Up Lambda intercepts registration. If it detects an email match with an existing account, it throws a custom error that the frontend catches and shows the appropriate message. Auto-linking is disabled in User Pool settings.

### Apple Private Relay — Duplicate Account Risk
If someone signs up via Apple (private relay email) and later signs up with email+password using their real email, those are two separate accounts (emails don't match, can't link them).

**Mitigation:**
- Sign-up page shows prominent "Already have an account?" with all sign-in options: "Try signing in with Google, Apple, or email first"
- Welcome email after Apple sign-up: "If you already had an account under a different email, contact support to merge your accounts."
- Admin Dashboard includes an Account Merge tool (see Admin module) for support-handled merges

---

## Login Flow

### Email + Password
1. Enter email + password
2. Cognito validates credentials
3. Returns: ID token, access token, refresh token
4. Tokens stored in HttpOnly cookies via the BFF
5. Redirects to dashboard

### Social Sign-In (Google / Apple)
1. Click provider button
2. OAuth flow (same as registration — Cognito handles new vs. returning)
3. Tokens returned, stored in cookies
4. Redirects to dashboard

### Failed Login
- Wrong password: "Incorrect email or password" (never reveal which one is wrong)
- Account locked after 5 failed attempts: "Too many attempts. Try again in 15 minutes" (Cognito's built-in lockout)
- Unverified email: "Please verify your email first. Resend verification code?"
- Account doesn't exist: same "Incorrect email or password" message (don't reveal whether email is registered)

---

## Password Management

### Forgot Password
1. User clicks "Forgot password?" on login screen
2. Enters email address
3. Cognito sends a password reset code (6-digit, expires in 1 hour)
4. User enters code + new password
5. Password updated, user redirected to login

### Change Password (Logged In)
1. In Account Settings → Security
2. Enter current password + new password
3. Cognito validates current password, updates to new
4. All other sessions invalidated (forces re-login on other devices)

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&* etc.)
- Cannot be the same as any of the last 5 passwords (Cognito password history)
- Strength indicator on the registration form (visual bar: weak / fair / strong)

---

## Session Management

### How Sessions Work
- Tokens stored in HttpOnly, Secure, SameSite=Lax cookies (managed by the BFF)
- When ID/access tokens expire (after 1 hour): the BFF automatically uses the refresh token to get new ones — user never notices
- When refresh token expires (after 30 days): user is logged out, must sign in again
- "Remember me" checkbox on login: if unchecked, refresh token set to session-only (expires when browser closes). If checked: full 30-day refresh token.

### Multi-Device
- Users can be logged in on multiple devices simultaneously
- No limit on concurrent sessions
- "Change password" invalidates all sessions on all devices
- "Sign out everywhere" button in Settings → Security (Cognito GlobalSignOut — invalidates all refresh tokens in one API call)

### Session Security
- CSRF protection via SameSite=Lax cookie attribute
- All tokens in HttpOnly cookies (not accessible to JavaScript — XSS-proof)
- JWT signature validated against Cognito's public keys on every request
- Token revocation via Cognito's GlobalSignOut for "sign out everywhere"

### Active Session Tracking — V1 Scope
- V1 provides "Sign out everywhere" only (single Cognito API call, zero custom infrastructure)
- Per-session tracking (list of devices, individual session sign-out) deferred to v1.1
- When built, it will use a DynamoDB `UserSessions` table capturing browser/OS from User-Agent, IP address, and mapped to individual refresh tokens

---

## Account Types

### Regular User (role: "user")
- Default for all new sign-ups
- Subject to tier-based limits (channels, credits, features)
- Sees only their own data
- Cannot access admin dashboard

### Admin (role: "admin")
- Set manually in DynamoDB (platform owner sets `role: "admin"` directly — one-time setup)
- Full platform access with no credit limits, no tier gates, no billing (as defined in billing.md)
- Same consumer UI + admin dashboard access
- Multiple admin accounts supported (v1 = single admin, architecture supports more)
- Admin flag checked on every credit deduction and tier-gated feature: `if role === 'admin' → bypass`

### How Admin is Created
- Platform owner creates a normal account (same sign-up flow)
- Then sets `role: "admin"` directly in DynamoDB (one-time manual step during initial setup)
- Future: admin can designate other admins from the Admin Dashboard
- Admin accounts are NOT created through a special registration flow — they're promoted from regular accounts

---

## JWT Custom Claims

When the BFF (Next.js server) decodes the JWT, it gets:

| Claim | Source | What It's For |
|---|---|---|
| `sub` | Cognito | Unique user ID (UUID, never changes) |
| `email` | Cognito | User's email address |
| `name` | Cognito | Display name |
| `custom:accountId` | DynamoDB (via pre-token-generation trigger) | The parent account ID (same as `sub` for owners, parent's `sub` for team members) |
| `custom:role` | DynamoDB (via pre-token-generation trigger) | "user" or "admin" |
| `custom:tier` | DynamoDB (via pre-token-generation trigger) | Current subscription tier |
| `custom:subscriptionStatus` | DynamoDB (via pre-token-generation trigger) | "active", "past_due", "cancelled", "lapsed", "trial", "trial_expired" |

### Pre-Token-Generation Lambda Trigger
- Cognito fires this Lambda every time it issues tokens (including refresh)
- Lambda looks up the user's DynamoDB record and injects custom claims
- Every request carries the user's role, tier, subscription status, and account ID without a separate database lookup
- If the user is a team member: `accountId` points to the parent account → all data queries use the parent account's data

### JWT Staleness and Tier Changes
- JWT claims can be up to 1 hour stale (token lifetime)
- For **cosmetic UI elements** (tier badge in header): JWT claims are fine, staleness is acceptable
- For **credit-sensitive operations** (any generation that costs credits): the credit deduction function already reads DynamoDB, so it checks the authoritative tier and subscription status there — JWT staleness doesn't affect feature access
- For **tier-gated features** (AI animation, priority rendering): check DynamoDB server-side before allowing the operation
- On tier change (Stripe webhook): DynamoDB is updated immediately. The user gets instant access to new features (all gating checks hit DynamoDB). The JWT catches up on the next natural token refresh (within 1 hour). No forced logout or session disruption.

---

## API Authorization Flow

Every API call follows this path:

1. Frontend makes request to Next.js Route Handler
2. Next.js reads the access token from the HttpOnly cookie
3. Next.js validates the JWT (signature checked against Cognito's public keys, expiration checked, claims extracted)
4. If valid: Route Handler processes the request using decoded claims (`accountId` for data queries, `role` for admin checks, `tier` + `subscriptionStatus` for feature gating)
5. If expired: BFF uses refresh token to get new tokens from Cognito, updates cookies, retries
6. If refresh token also expired: 401 response → frontend redirects to login

### Admin Bypass Logic
Every operation that checks credits or tier:
1. Read `role` from JWT claims (or DynamoDB for authoritative check)
2. If role === "admin" → skip credit deduction, skip tier check, allow
3. If role === "user" → normal credit/tier/subscriptionStatus enforcement

### Subscription Status Enforcement
Every generation or feature-gated operation:
1. Check `subscriptionStatus` (from DynamoDB for authoritative check)
2. If `active` or `trial` or `past_due` → allow (past_due = card failing but still in Stripe retry window)
3. If `cancelled` → allow until end of billing period (check `subscriptionEndDate`)
4. If `lapsed` or `trial_expired` → block with appropriate message
5. Admin bypasses all of this

---

## Team Seats (Multi-User Accounts)

### How Team Seats Work
- Higher tiers allow multiple people to share one account's channels and projects
- Seat counts: Starter (1), Creator (1), Pro (3), Agency (10)
- Each team member has their **own Cognito login** (own email, own password, own social sign-in)
- Team members are linked to a **parent account** (the account owner / billing contact)
- Team member relationship tracked in DynamoDB: `TeamMembership` records map `userId → parentAccountId`

### V1 Rule: Team Members Create New Accounts
- Team members must create a NEW account via the invitation link (fresh signup)
- If they already have a standalone account on the platform, they must use a different email
- No "pause/resume" of standalone accounts in v1 — keeps implementation simple
- When a team member leaves, their account becomes a standalone account (empty, no subscription, would need to subscribe separately)

### Roles Within a Team
- **Owner** (1 per account): Created the account. Manages billing and team members. Full access. Can transfer ownership.
- **Member** (remaining seats): Full access to all channels, projects, and generation features under the parent account. Cannot manage billing or team members. Cannot delete the account.

### Inviting Team Members
1. Owner goes to Settings → Team
2. Clicks "Invite Team Member"
3. Enters email address
4. System sends invitation email with a unique link (expires in 7 days)
5. Invitee clicks link → creates a new account (or links existing if different email — but v1 requires new)
6. Invitee now sees all the parent account's channels and projects when they log in
7. A person can only be a member of ONE team at a time

### Removing Team Members
- Owner removes a member from Settings → Team
- Member's access to the parent account's data is revoked immediately
- Member's account becomes standalone (empty, no subscription)
- No data is transferred — team data stays with the parent account
- Email notification sent to the removed member

### Ownership Transfer
1. Owner goes to Settings → Team → "Transfer Ownership" next to a member's name
2. Confirmation email sent to the new owner: "Accept ownership of [Team Name]?"
3. New owner accepts → ownership transfers
4. Old owner becomes a regular member (keeps their seat)
5. Billing remains on the original payment method — new owner can update it in Settings → Billing
6. Both parties receive confirmation emails

### Owner Account Deletion
- Owner cannot delete their account while team members exist without confirmation
- Warning: "You have 3 team members who will lose access. Remove them first, or confirm to proceed."
- If confirmed: all team members notified, 30-day grace period, team members' accounts revert to standalone after deletion completes

### When Tier Downgrades Reduce Seats
- If a Pro account (3 seats) downgrades to Creator (1 seat): at end of billing cycle, owner must choose which members to keep
- System prompts: "Your new plan has 1 seat. You currently have 3 team members. Please remove 2 members before the plan change takes effect."
- If they don't act by the downgrade date: all members are removed except the owner, notification sent to removed members

---

## Free Trial

### Trial Configuration
- 7-day free trial on Starter tier (no credit card required)
- DynamoDB record created with `tier: "starter"`, `subscriptionStatus: "trial"`, `trialStartDate`, `trialEndDate`
- 5,000 credits during trial (~4-5 videos)
- Full feature access (same as Starter tier) except:
  - Watermark on generated videos
  - 2 channel limit
  - 1 voice clone
- No credit card stored during trial

### Trial Expiration
- Day 5: email reminder — "Your trial ends in 2 days. You've used X of 5,000 credits."
- Day 7: email — "Trial expired. Subscribe to keep creating."
- After expiration:
  - `subscriptionStatus` changes to `trial_expired`
  - User can still log in and VIEW everything (projects, videos, analytics)
  - Cannot create new content (all generation features blocked)
  - Prominent banner: "Your trial has expired. Subscribe to continue creating."
  - "Subscribe" button goes directly to billing page
- Data preserved for 90 days after trial expiration, then deleted if no subscription
- If user subscribes at any point during the 90 days: all data preserved, `subscriptionStatus` changes to `active`, watermarks removed from future videos (not retroactive on already-rendered ones)

### Trial Abuse Prevention
1. **Disposable email blocking:** Cognito Pre Sign-Up Lambda checks the email domain against a blocklist of ~3,000 known disposable email services (Mailinator, Guerrilla Mail, etc.). Blocklist stored in DynamoDB, admin can add/remove domains. If blocked: "Please use a permanent email address to sign up."
2. **IP-based flagging:** Registration IP stored on account record. If same IP creates 3+ trial accounts within 7 days: flagged for admin review in the Admin Dashboard (not auto-blocked — could be a shared office or classroom).
3. **Watermark as primary defense:** Trial videos have a visible watermark, making them unsuitable for serious publishing. This is the strongest deterrent — free content that's branded isn't truly useful.
4. **Invisible CAPTCHA:** reCAPTCHA v3 enabled from day one on registration (see Bot Prevention section). Zero friction for real users.

---

## Subscription Lapse (Paying Customer)

### Card Failure (Involuntary)
- Stripe retries failed payments automatically (up to 4 attempts over ~2 weeks)
- `subscriptionStatus` changes to `past_due`
- During retry period: **full access continues** (grace period)
- User sees a banner: "We couldn't process your payment. Please update your card in Settings → Billing."
- Email sent on first failure + reminder on day 7
- If all retries fail after ~14 days: `subscriptionStatus` changes to `lapsed`

### Voluntary Cancellation
- `subscriptionStatus` changes to `cancelled`
- Full access continues until end of current billing period (they paid for it)
- `subscriptionEndDate` tracked — after this date: `subscriptionStatus` changes to `lapsed`

### Lapsed State
- User can log in and VIEW everything but cannot create or generate anything
- Banner: "Your subscription has ended. Resubscribe to continue creating."
- Scheduled publishes: cancelled when lapsed state begins
- Active rendering jobs: allowed to complete (don't waste compute), no new jobs
- Credits reset to 0
- **`tier` field preserved** — stores their last active tier (e.g., `tier: "pro"`, `subscriptionStatus: "lapsed"`) so we can show "Pick up where you left off on Pro" when they return
- Data preserved for 90 days, then deleted
- If user resubscribes within 90 days: everything restored, credits reset to new tier's monthly amount

### Team Members During Lapse
- Team members are **frozen** (lose access but stay on the roster) — not permanently removed
- When the owner resubscribes, team access is automatically restored
- Only on full account deletion (after 90 days without resubscription) are team members actually removed and notified

---

## Google OAuth vs. YouTube OAuth — Disambiguation

Users will encounter TWO Google OAuth popups and might get confused:

### Platform Login (Cognito Google OAuth)
- **When:** Signing up or logging in
- **Scopes:** `openid`, `email`, `profile` (just identity — who are you?)
- **Purpose:** Creates/verifies your platform account
- **UI messaging:** "Sign in with Google" (standard auth button)

### YouTube Connection (Channel Builder YouTube OAuth)
- **When:** Connecting a YouTube channel in the Channel Builder
- **Scopes:** YouTube read (analytics, videos, comments) + YouTube write (upload, metadata, thumbnails)
- **Purpose:** Links a specific YouTube channel to pull data and publish videos
- **UI messaging:** "Connect Your YouTube Channel — we'll pull your channel data and enable publishing"

### Handling Confusion
- If a user who signed in with Google tries to connect YouTube: the second OAuth popup might auto-approve (same Google account). We show: "Connecting YouTube channel [Channel Name] — this gives us access to your channel data and upload permissions."
- Users can log in with one Google account but connect a YouTube channel from a different Google account. That's fine — the YouTube connection is at the account level, not tied to the login identity.
- Settings page lists them separately:
  - "Login Method: Google (personal@gmail.com)" under Security
  - "YouTube Connections: [Channel Name] via business@gmail.com" under Connections

---

## Sign-In Method Management

### Minimum One Method Required
The system enforces at least one sign-in method at all times — not just a warning, but a hard block.

**Rules:**
- User has password + Google → can remove either one (still has the other)
- User has password only → can add Google/Apple, cannot remove password
- User has Google only → can add password or Apple, cannot remove Google
- User has Google + Apple → can remove either one

**UI behavior:** If removing would leave zero methods, button is disabled with tooltip: "You need at least one sign-in method. Add a password or another provider before removing this one."

**Backend enforcement:** The "remove provider" Lambda counts remaining methods before proceeding. Rejects the request if it would result in zero methods. Never trust the frontend alone for security checks.

**"Add password" option** always available in Settings → Security for social-only users.

---

## Bot Prevention

### Invisible CAPTCHA (Primary Defense)
- reCAPTCHA v3 enabled from day one on registration and password reset forms
- Invisible — zero user friction (no "click the traffic lights")
- Scores every request 0.0 to 1.0
- Below 0.3 = blocked (likely bot)
- 0.3 to 0.7 = allowed but flagged for admin review
- Above 0.7 = allowed (likely human)
- Admin can adjust thresholds from the Admin Dashboard

### Rate Limits (Safety Net)
Implemented at the Next.js Route Handler level (or API Gateway for standalone endpoints):

| Endpoint | Rate Limit |
|---|---|
| Registration | 20 per IP per hour |
| Login | 10 per IP per minute (before Cognito's own lockout) |
| Password reset request | 3 per email per hour, 10 per IP per hour |
| Verification code resend | 3 per email per hour |
| Team invitation | 10 per account per hour |

Rate limits are set high enough to avoid blocking legitimate shared-IP scenarios (classrooms, offices, co-working spaces) while still catching actual bot attacks. The invisible CAPTCHA is the primary defense, rate limits are the safety net.

---

## Account Settings (Auth-Related)

### Profile Section
- Name (editable)
- Email (editable — triggers re-verification flow via Cognito. Old email works until new one is verified.)
- Profile picture (uploaded, stored in S3)
- Time zone (for scheduling features)
- Language preference (English only in v1, but we store the preference for future i18n)

### Security Section
- Change password (current + new)
- Login methods: shows Google / Apple connections, with add/remove buttons (enforces minimum one method)
- "Sign out everywhere" button (Cognito GlobalSignOut — one API call)
- Two-factor authentication: NOT in v1 (Cognito supports TOTP and SMS MFA — revisit based on user demand)

### Team Section (Owner only, Pro/Agency tiers)
- List of team members with: name, email, role, last active date
- "Invite Member" button
- "Remove" button per member
- "Transfer Ownership" button per member
- Remaining seats indicator: "2 of 3 seats used"

### Danger Zone
- "Export My Data" button (GDPR — triggers data export job from platform-systems.md)
- "Delete My Account" button (GDPR — triggers deletion flow from platform-systems.md)
- Account deletion requires: typing "DELETE" to confirm, then 30-day grace period
- If account owner with team members: must confirm team impact before proceeding

---

## S3 Path Architecture Requirement

**S3 paths must use project/file UUIDs, NOT account IDs.**

- Correct: `s3://bucket/projects/{projectId}/images/{imageId}.png`
- Correct: `s3://bucket/media/{fileId}.mp4`
- Wrong: `s3://bucket/accounts/{accountId}/projects/{projectId}/...`

**Why:** If account IDs are in S3 paths, account merges (e.g., Apple duplicate accounts) require moving thousands of S3 files — slow, expensive, error-prone. DynamoDB records associate files to accounts. S3 paths are account-agnostic. This is an architecture-wide rule, not just auth.

---

## Email Templates (Cognito SES Integration)

All emails sent through Amazon SES with our branding:

| Email | When | Content |
|---|---|---|
| Verification code | After sign-up | "Verify your email. Code: XXXXXX" |
| Password reset code | Forgot password | "Reset your password. Code: XXXXXX" |
| Welcome email | After first login | "Welcome to [Platform Name]! Here's how to get started..." |
| Trial reminder (day 5) | 2 days before trial ends | "Your trial ends in 2 days. Here's what you've created so far." |
| Trial expired | Day 7 | "Trial expired. Subscribe to keep creating." |
| Payment failed | Card failure | "We couldn't process your payment. Update your card to keep access." |
| Payment failed reminder | Day 7 of card failure | "Your payment is still failing. Update your card before access is paused." |
| Subscription lapsed | After Stripe retries exhausted | "Your subscription has ended. Resubscribe within 90 days to keep your data." |
| Team invitation | Owner invites member | "[Owner Name] invited you to join their team on [Platform Name]" |
| Team removal | Owner removes member | "You've been removed from [Owner Name]'s team" |
| Ownership transfer request | Owner initiates transfer | "Accept ownership of [Team Name]?" |
| Ownership transfer complete | New owner accepts | "Ownership transferred successfully" |
| Seat reduction warning | Tier downgrade with excess members | "Your team has more members than your new plan allows. Please remove members by [date]." |
| Account deletion notice | User requests deletion | "Your account is scheduled for deletion on [date]. Log in to cancel." |
| Account deletion complete | 30 days after request | "Your account and all data have been permanently deleted." |
| Team owner deletion notice | Owner deletes account with team | "The account owner has deleted [Team Name]. Your access ends on [date]." |

---

## Error Handling

| Scenario | User Sees |
|---|---|
| Email already registered (email+password) | "An account with this email already exists. Try signing in, or reset your password." |
| Email already registered (social sign-in) | "An account with this email already exists. Sign in with your password to link your [Provider] account." |
| Invalid verification code | "That code is incorrect or expired. Request a new one?" |
| Password too weak | Inline validation with specific feedback: "Add a special character (!@#$%^&*)" |
| Google OAuth popup blocked | "Sign-in popup was blocked. Allow popups for this site and try again." |
| Apple OAuth fails | "Apple sign-in failed. Try again or sign in with email." |
| Session expired | Redirect to login with message: "Your session expired. Please sign in again." |
| Account locked (5 failed attempts) | "Too many failed attempts. Try again in 15 minutes, or reset your password." |
| Team invitation expired | "This invitation has expired. Ask the team owner to send a new one." (Invitations expire after 7 days.) |
| Already on a team | "You're already a member of [Team Name]. Leave that team first before joining a new one." |
| Trial expired, user tries to generate | "Your trial has ended. Subscribe to continue creating videos." |
| Subscription lapsed, user tries to generate | "Your subscription has ended. Resubscribe to continue creating." |
| Card failing (past_due) | Banner: "We couldn't process your payment. Update your card in Settings → Billing." |
| Disposable email blocked | "Please use a permanent email address to sign up." |
| CAPTCHA blocked | "We couldn't verify you're human. Please try again." |
| Removing last sign-in method | Button disabled: "You need at least one sign-in method. Add a password or another provider before removing this one." |
| Rate limited | "Too many requests. Please wait a moment and try again." |

---

## Credit Costs (Auth Module)

| Operation | Credits | Notes |
|---|---|---|
| Registration | Free | Always |
| Login | Free | Always |
| Password reset | Free | Always |
| Email change | Free | Always |
| Team invitation | Free | Always |
| All auth operations | Free | Auth is never credit-gated |

---

## Connection to Other Modules

| Module | How Auth Connects |
|---|---|
| **Billing** | `tier` and `subscriptionStatus` determine credit limits, seat counts, feature gates. Stripe subscription linked to account owner. Stripe webhooks update DynamoDB, JWT catches up on next refresh. |
| **Channel Builder** | First-time users routed to onboarding after auth. `accountId` (from JWT) is the top-level owner of all channels. |
| **All Modules** | Every request carries JWT with `accountId`, `role`, `tier`, `subscriptionStatus`. This is how every module knows who's making the request and what they're allowed to do. DynamoDB is authoritative for credit/tier checks. |
| **Platform Systems** | GDPR data export and deletion triggered from account settings. `subscriptionStatus` lifecycle managed here. |
| **Admin Dashboard** | `role: "admin"` (from JWT) gates access to the admin dashboard. Account merge tool for duplicate Apple accounts. |
| **Settings** | Auth-related settings (profile, security, team) are part of the Settings page. |
| **Notifications** | Trial reminders, payment failure alerts, team invitations, and subscription status changes go through the notification system. |
