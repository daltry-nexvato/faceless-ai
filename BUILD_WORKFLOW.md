# Faceless AI — Build Workflow Guide

This document explains exactly how we will build this platform using Claude Code, step by step. Everything is written in plain language. If something is a technical term, it's explained the first time it appears.

---

## The Big Picture

We are building a large platform with many features. Claude Code is the tool that will write the code for us. But Claude Code has limitations — it can forget things, make stuff up, and lose track of what it's doing if we don't manage it properly.

Think of Claude Code like an incredibly fast and knowledgeable contractor who has short-term memory loss. If you give them clear blueprints, check their work regularly, and don't ask them to do too much at once, they'll build you an amazing house. If you give them vague instructions and walk away for hours, you'll come back to a mess.

Our workflow is designed around this reality. Every step exists to keep Claude Code on track and prevent problems before they happen.

---

## Phase 1: The Master Spec (What We Are Doing Right Now)

### What is a "spec"?

A spec (specification) is a detailed blueprint for the entire platform. It describes every feature, every screen, every database table, every AI prompt, and every connection between systems — before a single line of code is written.

### Why do we need one?

Research from real developers who've built large projects with Claude Code shows that **writing a detailed spec first and then coding from it produces the same quality in 1 attempt as it takes 8 attempts without a spec.** That's not a small difference — it's the difference between building the platform in weeks versus months of rework.

Without a spec, here's what happens:
- You ask Claude to build the login page. It makes decisions about how login works.
- Later, you ask Claude to build the profile page. It makes DIFFERENT decisions about how login works because it forgot (or never knew) what it decided earlier.
- Now login and profile don't work together, and you spend hours debugging.

With a spec, Claude reads the blueprint at the start of every session and knows exactly how everything connects. No guessing, no conflicting decisions.

### What goes in the spec?

Everything. Specifically:

**Data Model** — Every piece of data the platform stores. For example:
- An Account has: email, name, password hash, creation date, subscription tier
- A Channel has: name, niche, reference channels (1-5), style profile, owner (Account)
- A Project has: title, script, scenes, voiceover, status, parent Channel

For each piece of data, we define: what fields it has, what type each field is (text, number, date, etc.), which fields are required, and how it connects to other data.

**API Endpoints** — Every action the platform can perform. An API endpoint is like a specific service counter at a government office. Each counter handles one type of request. For example:
- POST /api/channels/create — Creates a new channel (you send it a name and niche, it sends back the created channel)
- GET /api/channels/{id} — Gets the details of a specific channel
- PUT /api/channels/{id}/style — Updates a channel's style

For each endpoint, we define: what you send it, what it sends back, what errors can happen, and who is allowed to use it (any user? only the channel owner? only admins?).

**UI Pages** — Every screen the user sees. For example:
- /dashboard — Shows all your channels with stats
- /niche-finder — The research interface with filters and scoring
- /channel/{id}/projects — All projects under a channel

For each page, we define: what it looks like (layout), what data it shows, what actions the user can take, and which API endpoints it calls.

**AI Prompts** — Every instruction we send to GPT-4o, fal.ai, or ElevenLabs. These are the actual text templates that tell the AI what to generate. For example, the script generation prompt would include: the user's channel style, the video topic, target length, hook pattern, and tone — all as a structured template with blanks that get filled in per project.

**Integration Contracts** — For every external service (fal.ai, OpenAI, ElevenLabs, YouTube API, Stripe), we document: which of their API endpoints we use, what we send them, what they send back, what errors can happen, how much each call costs, and what rate limits apply.

### What we're doing right now

We are going through every module of the platform one by one — Niche Finder, Scripts, Voiceovers, Images, Video, Editing, Publishing, etc. For each module, we discuss what it should do, how it should work, and iron out every detail. Once we've covered every module, I write the complete spec. You review it. Then we build from it.

**You said not to write the spec until you say "go." That instruction stands.**

---

## Phase 2: Project Setup

### What happens here

Before we write any feature code, we set up the project's foundation. This is like pouring the foundation and framing the walls before you start installing kitchens and bathrooms.

### What we set up

**Git Repository** — Git is a system that tracks every change made to your code, like an unlimited undo history. A "repository" (or "repo") is your project stored in Git. We create this on day one because:
- Every change is recorded — if something breaks, we can go back to when it worked
- We can create "branches" (explained below) to work on features safely
- Your code is backed up on GitHub (a website that stores Git repos in the cloud)

To set this up, I would run:
```
git init
git remote add origin https://github.com/your-username/faceless-ai.git
```
This creates the local repo and connects it to GitHub.

**CLAUDE.md File** — This is a special file that Claude Code reads automatically at the start of every session. Think of it as a permanent instruction sheet that survives even when we clear Claude's memory. It contains:
- How to run the project (what commands to type)
- How to run the tests
- Coding rules (like "always use TypeScript" or "never delete code I didn't ask you to delete")
- Project structure (which folders contain what)
- Forbidden patterns (things Claude should NEVER do)

This file stays short and critical. If it's too long, Claude starts ignoring parts of it — like a student skimming a 50-page syllabus.

**Architecture.md** — This is the master spec from Phase 1, saved as a file in the project. Claude reads this whenever it needs to understand how something should work.

**Folder Structure** — We decide upfront where everything goes:
```
faceless-ai/
├── CLAUDE.md                    (Claude's instruction sheet)
├── architecture.md              (the master spec)
├── frontend/                    (Next.js — what users see)
│   ├── src/
│   │   ├── app/                 (pages and routes)
│   │   ├── components/          (reusable UI pieces)
│   │   └── lib/                 (helper functions)
├── backend/                     (Lambda functions — the server logic)
│   ├── functions/               (one folder per API endpoint group)
│   ├── models/                  (data definitions)
│   └── services/                (business logic)
├── infrastructure/              (AWS setup — DynamoDB tables, S3 buckets, etc.)
├── tests/                       (all test files)
└── tasks/                       (progress tracking files per feature)
```

This structure is decided ONCE and written into the spec. Claude follows it for every file it creates.

---

## Phase 3: Build Feature by Feature

### What "feature by feature" means

Instead of building all the database stuff first, then all the backend stuff, then all the frontend stuff, we build one complete feature at a time. Each feature is a "vertical slice" — it goes all the way from the database to the screen the user sees.

**Example — Building "Create a Channel":**

This one feature requires:
1. A DynamoDB table to store channels (database layer)
2. A Lambda function that handles the "create channel" request (backend layer)
3. A Next.js page where the user fills in a form and clicks "Create" (frontend layer)
4. Tests that verify it all works correctly (test layer)

We build ALL FOUR of these together as one batch. When we're done, the user can actually create a channel — it's a real, working feature. Then we move to the next feature.

**Why not build layer by layer?** Because if you build the entire database first without testing it against real features, you'll discover halfway through that your database design doesn't work for some features. Then you have to redo it. Building vertically catches these problems immediately.

### How we track progress

Each feature gets three files in the `tasks/` folder:

**tasks/create-channel-plan.md** — What we're building. This is a subset of the master spec, focused on just this feature. It describes the specific database fields, API endpoints, and UI components needed. Claude reads this at the start of each session so it knows exactly what to build.

**tasks/create-channel-context.md** — Key information Claude needs. Which existing files are relevant, what decisions have been made, what other features this connects to. This prevents Claude from accidentally breaking things that already work.

**tasks/create-channel-progress.md** — A checklist. For example:
```
[x] DynamoDB table definition
[x] Create channel Lambda function
[x] Create channel API route
[ ] Channel creation form (frontend)
[ ] Form validation
[ ] Tests for create channel
[ ] PR created and reviewed
```

Claude updates this as it works. You can see at a glance what's done and what's left.

### The build order

Features are built in a specific order because some depend on others. You can't build "create a project" before "create a channel" because projects live inside channels. Here's the order:

```
 1. Auth (Cognito)                  — Login/signup. Everything needs this first.
 2. Account + DynamoDB base         — The core data layer that stores everything.
 3. Channel CRUD                    — Create, read, update, delete channels.
 4. Style model                     — The style structure that lives inside channels.
 5. Niche Finder (search + scoring) — Find niches and analyze them.
 6. Research Board                  — Save reference channels while researching.
 7. Channel Builder + AI Style Gen  — Create channels from research with auto style.
 8. Scripts (GPT-4o)                — Generate video scripts.
 9. Voiceovers (ElevenLabs)         — Generate voice audio from scripts.
10. Images (fal.ai)                 — Generate images for video scenes.
11. Video Generation (fal.ai)       — Generate video clips.
12. Editing (FFmpeg on Fargate)     — Assemble everything into final video.
13. Publishing (YouTube OAuth)      — Upload to YouTube.
14. SEO + Analytics                 — Optimize and track performance.
15. Billing (Stripe)                — Subscriptions and payments.
16. Settings + Admin                — Account settings, API key management.
```

Each number is one or more coding sessions. Each session produces a working feature that you can test.

---

## Phase 4: The Session Discipline (How Each Coding Session Works)

This is the most important part. Every single time we sit down to write code, we follow this exact process. No exceptions. This is what prevents Claude Code from going off the rails.

### Step 1: Start Fresh

**What you do:** Open your terminal (Command Prompt, PowerShell, or Windows Terminal on your computer). Navigate to the project folder and start Claude Code:

```
cd "D:\Faceless AI"
claude
```

Then immediately type:
```
/clear
```

**Why:** `/clear` wipes Claude's conversation memory completely. This is critical because leftover context from a previous session will confuse Claude. Maybe yesterday you were debugging a tricky problem and tried 5 different approaches — all that noise is still in Claude's memory and will pollute today's work.

After `/clear`, the ONLY things Claude knows are:
- What's in your CLAUDE.md file (the permanent instruction sheet)
- What's in the actual code files on your computer
- Nothing else — no conversation history, no previous decisions, nothing

This is a GOOD thing. Clean slate means clean work.

**When you might skip this:** If you're continuing the exact same task from a few minutes ago and haven't done anything else in between, you can skip `/clear`. But if in doubt, clear.

### Step 2: Load Context

**What you do:** Tell Claude what you're working on today by pointing it to the right files:

```
> Read architecture.md and tasks/create-channel-plan.md and tasks/create-channel-progress.md.
  We are working on the Channel Creation feature. Pick up where we left off based on the progress file.
```

**Why:** Remember, you just cleared Claude's memory. It has no idea what you're building or where you left off. By pointing it to specific files, you're giving it exactly the context it needs — nothing more, nothing less.

The architecture.md tells Claude how the whole platform fits together. The plan file tells Claude what this specific feature requires. The progress file tells Claude what's already done and what's next.

**What Claude does:** It reads these files, understands the current state, and is ready to work with a clear, focused understanding of the task.

**Important:** Don't just say "continue where we left off" without pointing to files. Claude will try to guess what you were doing, and it will guess wrong. Always be explicit.

### Step 3: Small Batch

**What you do:** Ask Claude to implement a small, specific piece of the feature. Not the whole thing at once.

Good example:
```
> Build the DynamoDB table definition for Channels and the Lambda function for creating a channel.
  Follow the spec in the plan file exactly. Don't build the frontend yet.
```

Bad example:
```
> Build the entire channel feature with database, backend, frontend, and tests.
```

**Why:** Claude Code works best when given focused tasks that touch 5-20 files. When you ask it to do too much at once:
- It runs out of context space (memory) halfway through
- It starts making shortcuts and quick hacks
- It forgets instructions from the beginning of the conversation
- The output is too large for you to review effectively

Think of it like asking a contractor to tile the bathroom. Good: "Tile the floor today, we'll do the walls tomorrow." Bad: "Tile the floor, walls, and shower, replumb the sink, and install the vanity — all today."

**Rule of thumb:** Each request to Claude should produce changes in 5-20 files. If you think it'll be more than that, break it into smaller requests.

### Step 4: Tests Must Pass

**What you do:** After Claude writes code, tell it to run the tests:

```
> Run all the tests. Show me the results. Do NOT modify any existing tests — only fix the implementation code if tests fail.
```

**Why:** Tests are automated checks that verify the code works correctly. When Claude runs the tests and they all pass (shown as green checkmarks or "PASS" messages), you know the code does what it's supposed to do.

The critical instruction here is **"Do NOT modify any existing tests."** This is because Claude has a known bad habit: when a test fails, instead of fixing the code that's broken, it sometimes changes the test so it no longer checks for the problem. That's like a student erasing the answer key instead of fixing their wrong answers. By explicitly forbidding test modifications, you force Claude to fix the actual code.

**What "passing tests" looks like:**
```
PASS  tests/channels/create-channel.test.ts
  ✓ should create a channel with valid data (45ms)
  ✓ should reject channel creation without a name (12ms)
  ✓ should reject channel creation for unauthenticated users (8ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

**What "failing tests" looks like:**
```
FAIL  tests/channels/create-channel.test.ts
  ✓ should create a channel with valid data (45ms)
  ✗ should reject channel creation without a name (12ms)
    Expected: 400 error
    Received: 200 success

Test Suites: 1 failed, 1 total
Tests:       1 failed, 2 passed, 3 total
```

If tests fail, Claude fixes the code and runs them again. Repeat until all tests pass. Only then do we move to the next step.

### Step 5: Review the Diff

**What you do:** Ask Claude to show you what changed:

```
> Show me a git diff of everything you changed. Then explain each change in plain English.
```

A "diff" is a display showing what was added (green), removed (red), and which files were affected.

**Why:** This is your quality check. You are the project owner, and even though Claude wrote the code, you need to verify it before it becomes permanent. You don't need to understand every line of code — here's what to look for:

1. **Does the scope match?** If you asked Claude to build one feature and it touched 40 files, something's wrong. Ask why.

2. **Did it delete anything unexpected?** Red lines in the diff mean code was removed. If you see red in files you didn't ask Claude to touch, ask about it.

3. **Does the explanation match your request?** When Claude explains the changes in plain English, does that explanation match what you actually asked for? If you asked for a simple form and Claude says "I also refactored the authentication system for better performance," that's a red flag.

4. **Are there any hardcoded secrets?** Look for things like API keys, passwords, or email addresses written directly in the code. These should never be hardcoded — they should be in environment variables (secure settings stored separately).

5. **File count check.** Count how many files changed. For a small feature, 3-10 files is normal. 20+ files for a simple feature means Claude probably did more than you asked.

**If something looks wrong:** Tell Claude specifically what's wrong and ask it to fix it. For example:
```
> You modified the auth middleware but I only asked you to build the channel creation endpoint.
  Revert your changes to auth and only change files related to channels.
```

### Step 6: Commit the Work

**What you do:** If the tests pass and the diff looks good, tell Claude to save the work:

```
> Commit these changes with the message "Add channel creation endpoint and DynamoDB table"
```

A "commit" is like pressing "Save" in Git — it creates a snapshot of your project at this exact moment. The message describes what changed so you can find it later.

**Why:** Committing frequently means you always have a recent save point to go back to. If the next batch of work goes wrong, you can undo back to this commit and try again without losing the good work.

**What "committing" actually does:**
1. Claude runs `git add` — this tells Git which files to include in the save
2. Claude runs `git commit` — this creates the snapshot with your message
3. The changes are now permanently recorded in your project history

**Pushing to GitHub:** Periodically (after every few commits, or at the end of each session), you should also push to GitHub so your code is backed up in the cloud:
```
> Push to GitHub
```
This runs `git push` which uploads your commits to the GitHub website. If your computer dies, your code is safe.

### Step 7: Update Progress

**What you do:** Tell Claude to update the progress file:

```
> Update tasks/create-channel-progress.md — mark the DynamoDB table and Lambda function as complete.
  Note any decisions we made or issues we ran into.
```

**Why:** The progress file is how future sessions know where you left off. Tomorrow (or next week), when you start a new session and Claude reads this file, it knows exactly what's done and what's next. Without this, you'd have to remember everything yourself and re-explain it each time.

### Step 8: Decide — Continue or Stop

**What you do:** Check how the session is going:

- **If Claude is still sharp and responsive** — Go back to Step 3 and do another small batch within the same session.
- **If Claude is starting to repeat itself, forget instructions, or give generic answers** — The context is getting stale. Stop here, `/clear`, and start a fresh session if you want to keep going.
- **If you've been working for a while and it's a natural stopping point** — End the session. Everything is committed and saved. You can pick up tomorrow.

**Signs that it's time to stop the session:**
- Claude suggests something you already discussed and rejected
- Claude asks you a question it already asked earlier
- Claude's responses are getting longer and more generic instead of specific
- You've been in the same session for 30+ minutes of heavy coding
- Claude starts "over-explaining" simple things (padding responses because it's losing focus)

**When you come back:** Start over at Step 1. `/clear`, load context, pick up where the progress file says you left off. Clean slate, clean work.

---

## Phase 5: Verification Strategy (How We Make Sure Things Work)

### The Problem

Claude Code produces code that looks correct. It reads well. It has the right variable names, the right structure, the right comments. But "looks correct" and "is correct" are two different things. Without verification, bugs hide until users find them — which is the worst possible time.

### Our Verification Layers

**Layer 1: Tests Written Alongside Code (Not After)**

For every feature, we write tests at the same time as the code — not as an afterthought. The tests describe what the feature should do in concrete terms:

- "When a user submits a channel name, a channel is created in the database"
- "When a user submits an empty name, they get an error message"
- "When a user who isn't logged in tries to create a channel, they get a 401 unauthorized error"

These tests run automatically and either pass or fail. No ambiguity.

**How we handle this with Claude:** We tell Claude to write the test FIRST, then implement the code to make it pass. This is called Test-Driven Development (TDD). The test is written based on the spec, not based on the code — so it's genuinely checking the requirements, not just confirming that the code does whatever it happens to do.

The prompt to Claude looks like:
```
> Based on the spec in the plan file, write tests for the "create channel" endpoint.
  Cover: successful creation, missing required fields, unauthenticated user, and duplicate channel name.
  Do NOT write the implementation yet — just the tests. They should all fail when you run them.
```

Then:
```
> Now write the implementation to make all these tests pass. Do NOT modify the tests.
```

**Layer 2: Integration Tests Over Unit Tests**

There are two types of tests:
- **Unit tests** test a single tiny piece of code in isolation. Like testing that a calculator's "add" button works by itself.
- **Integration tests** test that multiple pieces work together. Like testing that you can type 2 + 3 on the calculator and see 5 on the screen.

We prioritize integration tests because they catch real problems. A unit test might confirm that the "save channel" function works, but an integration test confirms that clicking "Create" on the website actually saves a channel to the database and shows it on the dashboard.

Claude has a bad habit of writing unit tests that "mock" (fake) the things they're supposed to test. For example, instead of actually saving to the database, it fakes the database response. This means the test passes even if the database code is broken. We explicitly forbid this:

```
> Write integration tests that hit the actual API endpoint and verify the data in DynamoDB.
  Do NOT mock the database. Do NOT mock the API. Test the real thing.
```

**Layer 3: Manual Testing (You)**

After Claude builds a feature and the automated tests pass, you test it yourself in the browser. Click through the feature as a real user would:
- Try to create a channel with a normal name — does it work?
- Try to create one with no name — does it show an error?
- Try to create one while logged out — does it redirect to login?
- Create 3 channels — do they all show up on the dashboard?

Your manual testing catches things that automated tests miss, like: the button is in a weird place, the loading spinner never goes away, or the error message is confusing.

**Layer 4: Quality Check Before Moving On**

Before starting the next feature, we verify that the current feature works with everything built so far. This is quick — just run all existing tests:

```
> Run the full test suite. Everything should pass.
```

If any old tests break, it means the new feature damaged something existing. We fix it before moving on. This prevents problems from piling up.

---

## Summary: The One-Page Version

```
PHASE 1 — PLAN (what we're doing now)
  Go through every module
  Iron out every detail
  Write the master spec when you say "go"

PHASE 2 — SETUP (one-time, before any feature code)
  Create Git repo + GitHub connection
  Write CLAUDE.md (Claude's permanent instructions)
  Save architecture.md (the master spec)
  Define folder structure

PHASE 3 — BUILD (repeated for each feature)
  Pick next feature from the build order
  Create task files (plan, context, progress)
  Build in vertical slices (database + backend + frontend + tests)
  Follow the Session Discipline (Phase 4) for each coding session

PHASE 4 — SESSION DISCIPLINE (every single coding session)
  1. /clear                → Fresh start
  2. Load spec + task file → Claude knows what to do
  3. Small batch           → 5-20 files per request
  4. Tests must pass       → No exceptions, no modifying tests
  5. Review the diff       → You verify before it's permanent
  6. Commit                → Save the work to Git
  7. Update progress       → Future sessions know where we are
  8. Continue or stop      → Watch for context staleness

PHASE 5 — VERIFY (after each feature)
  Tests written alongside code, not after
  Integration tests (real calls, no faking)
  You test manually in the browser
  Full test suite passes before moving to next feature
```

---

## Questions You Might Have

**Q: How long will each coding session take?**
It depends on the feature complexity. A simple feature (like account settings) might take 1-2 sessions of 30-60 minutes each. A complex feature (like the Niche Finder) might take 5-10 sessions. The master spec will break each feature into small enough pieces that each session is productive.

**Q: What if Claude builds something wrong?**
That's what the review step catches. If the diff doesn't look right or tests fail, we tell Claude to fix it. If it can't fix it after 2 attempts, we `/clear` and start fresh with a better prompt. Worst case, we `git revert` (undo) back to the last good commit and try a different approach.

**Q: Do I need to understand the code?**
Not line by line, but you should understand what each feature does and be able to test it as a user. The review step focuses on scope (did Claude do what you asked?) and sanity checks (did it delete anything? did it touch unexpected files?) rather than reading code syntax.

**Q: What if we need to change the spec midway through?**
That's fine and expected. We update the spec, update any affected task files, and adjust. The build order might shift. But because each feature is a complete, tested unit, changes don't cascade into chaos — they only affect the features that haven't been built yet.

**Q: How do we know when we're done?**
When every feature in the build order is complete, all tests pass, you've manually tested the whole platform, and it's deployed to AWS. The spec serves as the checklist.
