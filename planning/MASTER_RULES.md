# MASTER RULES — READ THIS EVERY SESSION

These rules govern every interaction on the Faceless AI project. Claude MUST read this file at the start of every session and follow every rule without exception. The user is not a developer — communicate in plain language always.

---

## RULE 1: KNOW WHAT PHASE WE ARE IN

Before doing ANYTHING, determine which phase the project is in:

- **PLANNING PHASE** — We are discussing modules and designing the platform. NO code is written. NO spec/blueprint is written until the user explicitly says "go."
- **SETUP PHASE** — We are setting up the Git repo, CLAUDE.md, folder structure, and infrastructure. No feature code yet.
- **BUILD PHASE** — We are building features one at a time from the build order.

**How to check:** Read `tasks/current-phase.md` if it exists. If it doesn't exist, we are still in the PLANNING PHASE.

**What to do:**
- If PLANNING: Focus only on discussing modules, making decisions, and saving them to memory files. Do NOT write code. Do NOT write the spec/blueprint unless the user says "go."
- If SETUP: Follow the setup checklist. Do NOT start feature code until setup is verified complete.
- If BUILD: Follow the Session Discipline (Rule 5) exactly.

---

## RULE 2: ALWAYS CHECK MEMORY FILES FIRST

At the start of every session, read these files to understand where we are:

1. `MASTER_RULES.md` (this file) — The rules
2. `MEMORY.md` — Project overview and key decisions
3. `data-model.md` — The data hierarchy (Account → Channel → Style → Project)
4. `architecture.md` — Tech stack and cost strategy
5. `build-workflow.md` — How we build and session discipline
6. `niche-finder.md` — Finalized niche finder spec
7. Any module spec files that exist (e.g., `scripts.md`, `editing.md`, etc.)

**If a memory file contradicts something the user says in conversation, the user's words win.** Update the memory file immediately.

---

## RULE 3: SAVE EVERY DECISION

When the user makes a decision or we finalize something in conversation, it MUST be saved to a memory file before the session ends. Unsaved decisions are lost decisions.

**What to save:**
- Any feature decision ("we're using fal.ai for all images")
- Any workflow decision ("no phased tiers, everything ships at launch")
- Any data model change ("Style is blended from 1-5 references, not one")
- Any module spec that's been discussed and agreed on
- Any change to the build order or architecture

**Where to save:**
- Architecture decisions → `architecture.md`
- Data model changes → `data-model.md`
- Module specs → `[module-name].md` (e.g., `scripts.md`)
- Key decisions → `MEMORY.md` (the decisions log)
- Workflow changes → `build-workflow.md`

**When the user says "remember this" or "don't forget" — save it immediately, don't wait.**

---

## RULE 4: REMIND THE USER OF THE WORKFLOW

The user is not a developer. They may not remember every step of the workflow. It is Claude's job to remind them at the right moments:

### During PLANNING PHASE:
- After finishing a module discussion: "That's [module name] locked down. I've saved it. Ready to move to [next module]?"
- If the user tries to jump to coding: "We're still in the planning phase. We have [X] modules left to discuss: [list them]. Want to continue with [next module], or are you ready to say 'go' on the spec?"
- If the user says "go" on the spec: "Got it. I'll write the complete master spec now. This will cover every module we discussed: [list all]. I'll save it to D:\Faceless AI\REBUILD_BLUEPRINT.md. Once you review and approve it, we move to the Setup Phase."

### During BUILD PHASE:
- **At the start of every coding session:** "Starting fresh. Let me read the spec and the current task files to see where we left off." Then do it.
- **After Claude writes code:** "Code is written. Let me run the tests before we go any further." Then run them.
- **If tests fail:** "Tests failed. Let me fix the implementation — I will NOT modify the tests." Then fix the code, not the tests.
- **After tests pass:** "All tests pass. Here's what I changed and why: [plain English summary]. Does this look right to you?"
- **After user approves:** "I'll commit this, update the progress file, and push to GitHub." Then do all three.
- **Before starting next batch:** "Context check — we've been going for a while. Should we /clear and start fresh, or keep going?"
- **After completing a feature:** "Feature [name] is complete. Before we move on, let me run the FULL test suite to make sure nothing is broken." Then run ALL tests.
- **After full test suite passes:** "All existing tests still pass. You should test this feature manually in the browser now. Try: [specific things to test]. When you're satisfied, we move to feature [next in build order]."

---

## RULE 5: SESSION DISCIPLINE (BUILD PHASE ONLY)

Every coding session follows these steps IN ORDER. No skipping.

```
STEP 1 → /clear (fresh start)
STEP 2 → Read spec + task files (load context)
STEP 3 → Small batch (5-20 files per request)
STEP 4 → Run tests (must ALL pass)
STEP 5 → Show diff + explain in plain English (user reviews)
STEP 6 → Commit + push to GitHub (save the work)
STEP 7 → Update progress file (track where we are)
STEP 8 → Check context freshness (continue or /clear)
```

### Step-by-step detail:

**STEP 1 — /clear:** Wipe conversation memory. Start clean. The only things Claude knows after this are CLAUDE.md and the actual files on disk.

**STEP 2 — Load context:** Read architecture.md, the current feature's task files (plan, context, progress), and any relevant module spec. Tell the user: "I've read the spec and progress files. We're working on [feature name]. Last session we completed [X]. Next up is [Y]."

**STEP 3 — Small batch:** Implement ONE specific piece. Ask the user what to build if unclear, or follow the progress file's next unchecked item. Never touch more than 20 files in one batch. Never build the whole feature at once.

**STEP 4 — Run tests:** Run the test suite. If tests fail, fix the IMPLEMENTATION code — NEVER modify existing tests. If Claude can't fix it after 2 attempts, tell the user: "I've tried twice and can't fix this. Let's /clear and try a different approach." Do NOT keep retrying the same thing.

**STEP 5 — Review:** Show the user a plain-English summary of every change. List which files were modified. Flag anything unexpected. Ask: "Does this look right to you?"

**STEP 6 — Commit:** Only after tests pass AND user approves. Commit with a clear message. Push to GitHub. Never commit broken code.

**STEP 7 — Update progress:** Mark completed items in the progress file. Note any decisions made or issues encountered. This is how the next session knows where to start.

**STEP 8 — Context check:** If the session has been going for a while, or if Claude is starting to feel "foggy" (repeating things, forgetting context), tell the user: "Our context is getting full. I recommend we /clear and start a fresh session. Everything is saved — we won't lose anything."

---

## RULE 6: THINGS CLAUDE MUST NEVER DO

These are absolute prohibitions. No exceptions, no matter what.

1. **Never write code during the PLANNING PHASE.** We are designing, not building.
2. **Never write the spec/blueprint until the user says "go."** The user explicitly said this.
3. **Never modify existing tests to make them pass.** Fix the implementation instead.
4. **Never commit code that has failing tests.** Tests must all pass first.
5. **Never improvise architecture.** Every structural decision must come from the spec. If the spec doesn't cover something, ask the user — don't guess.
6. **Never build out of order.** Follow the build order. Dependencies exist for a reason.
7. **Never change files unrelated to the current task.** If asked to build the channel page, don't touch the auth system. Scope discipline.
8. **Never hardcode API keys, passwords, or secrets in code.** Use environment variables or AWS Secrets Manager.
9. **Never delete code without explaining why.** If something needs to be removed, explain it in plain English first.
10. **Never use technical jargon without explaining it.** The user is not a developer. Every technical term gets a plain-English explanation the first time it's used.
11. **Never mock database calls or external APIs in integration tests.** Test the real thing.
12. **Never claim a feature is "done" until tests pass AND the user has approved the diff.**
13. **Never keep retrying the same failed approach.** After 2 failures, /clear and try differently.
14. **Never skip the progress file update.** Every session must end with an updated progress file.

---

## RULE 7: AUDIT CHECKPOINTS

At specific milestones, Claude MUST stop and run an audit before proceeding.

### After completing each feature:
- Run the FULL test suite (all features, not just the current one)
- Verify no existing features are broken
- Tell the user to manually test in the browser
- List specific things for the user to test
- Do NOT move to the next feature until the user confirms it works

### After every 3 features completed:
- Run a full codebase audit:
  - Are all files following the folder structure from the spec?
  - Are there any hardcoded secrets?
  - Are there any files that don't belong?
  - Is the code consistent with the coding style rules in CLAUDE.md?
  - Are all DynamoDB tables matching the spec?
  - Are all API endpoints matching the spec?
- Report findings to the user in plain English
- Fix any issues before proceeding

### After all features are complete:
- Full end-to-end audit of the entire platform
- Every API endpoint tested
- Every UI page verified
- All tests pass
- Performance check (are any pages slow? are any API calls taking too long?)
- Security check (any exposed secrets? any missing auth checks? any injection vulnerabilities?)
- Cost check (are we staying within the cost targets from the architecture decisions?)

---

## RULE 8: HOW TO HANDLE PROBLEMS

### If Claude encounters a bug it can't fix:
1. Try to fix it (attempt 1)
2. If that fails, try a different approach (attempt 2)
3. If that fails, STOP. Tell the user: "I've tried two approaches and neither worked. Here's what's happening: [plain English explanation]. Here are our options: [list options]. What would you like me to try?"
4. Never silently move on from a bug. Never hide a problem.

### If the spec doesn't cover something:
1. Tell the user: "The spec doesn't define how [X] should work. Here's what I think makes sense: [recommendation]. Should I go with this, or do you want something different?"
2. Whatever the user decides, save it to the relevant memory file immediately.
3. Never guess and build. Always ask first.

### If the user's request contradicts the spec:
1. Tell the user: "That's different from what we planned in the spec. The spec says [X], but you're asking for [Y]. Which one should we go with?"
2. If the user changes their mind, update the spec and memory files immediately.
3. Never silently override the spec.

### If a new session starts and the progress file doesn't match the actual code:
1. Tell the user: "The progress file says [X] is complete, but I'm not finding it in the code. Something may have gone wrong in a previous session. Let me investigate."
2. Investigate and report findings.
3. Never assume the progress file is right if the code doesn't match.

---

## RULE 9: COMMUNICATION STYLE

- **Always use plain English.** No jargon without explanation.
- **Be direct.** Say what's happening, what went wrong, or what you need. Don't pad responses.
- **Proactively flag risks.** If you see a potential problem, say it now, not after it becomes a real problem.
- **Ask questions when unsure.** A 30-second question saves hours of rework.
- **Summarize at natural breakpoints.** After finishing a module discussion, after completing a feature, after an audit — give a brief "here's where we are" summary.
- **Never say "it's done" without proof.** Proof = passing tests + diff review + user approval.

---

## RULE 10: MODULES STATUS TRACKER

This tracks which modules have been discussed, agreed on, and saved.

| Module | Status | Memory File |
|--------|--------|-------------|
| Niche Finder | DISCUSSED + SAVED | niche-finder.md |
| Data Model / Hierarchy | DISCUSSED + SAVED | data-model.md |
| Architecture / Tech Stack | DISCUSSED + SAVED | architecture.md |
| Build Workflow | DISCUSSED + SAVED | build-workflow.md |
| AI Integration Strategy | DISCUSSED + SAVED | ai-integration.md |
| UI Flow / System Workflow | DISCUSSED + SAVED | ui-flow.md |
| Stock Assets / Media | DISCUSSED + SAVED | architecture.md (integrations section) |
| Viral Templates / Retention | DISCUSSED + SAVED | viral-templates.md |
| Cross-Platform Trends | DISCUSSED + SAVED | viral-templates.md (bottom section) |
| Scripts | DISCUSSED + SAVED | scripts.md |
| Voiceovers | DISCUSSED + SAVED | voiceovers.md |
| Images | DISCUSSED + SAVED | images.md |
| Video Generation | DISCUSSED + SAVED | video-generation.md |
| Editing / Music | DISCUSSED + SAVED | editing-music.md |
| Publishing | DISCUSSED + SAVED | publishing.md |
| Research Board | DISCUSSED + SAVED | research-board.md |
| Channel Builder | DISCUSSED + SAVED | channel-builder.md |
| Style System | DISCUSSED + SAVED | style-system.md |
| Projects / Wizard | DISCUSSED + SAVED | projects-wizard.md |
| Auth (Cognito) | DISCUSSED + SAVED | auth.md |
| Settings | DISCUSSED + SAVED | settings.md |
| Analytics | DISCUSSED + SAVED | analytics.md |
| Billing (Stripe) | DISCUSSED + SAVED | billing.md |
| Admin | DISCUSSED + SAVED | admin.md |
| Global Media Library | DISCUSSED + SAVED | media-library.md |
| Standalone Generator | DISCUSSED + SAVED | standalone-generator.md |
| Notifications System | DISCUSSED + SAVED | notifications.md |
| Platform Systems (Cross-Cutting) | DISCUSSED + SAVED | platform-systems.md |
| Social Competitor Tracker | DISCUSSED + SAVED (Phase 2 — Coming Soon) | architecture.md |

**All modules discussed and saved. Ready for blueprint when user says "go."**

---

## QUICK REFERENCE: WHAT TO DO WHEN

| Situation | What Claude Does |
|-----------|-----------------|
| New session starts | Read MASTER_RULES.md → Read all memory files → Report current status |
| User makes a decision | Save it to the correct memory file immediately |
| Module discussion complete | Save module spec → Update modules tracker → Ask about next module |
| User says "go" on spec | Write the full blueprint from all memory files |
| Coding session starts | /clear → Load context → Follow Session Discipline |
| Tests fail | Fix implementation (NOT tests). Max 2 attempts, then ask user |
| Feature complete | Full test suite → Manual test prompt → Move to next feature |
| Every 3 features | Full codebase audit |
| User seems confused | Explain in simpler language. Offer examples |
| Spec gap found | Ask the user. Don't guess. Save the answer |
| Context getting stale | Warn the user. Recommend /clear |
| Something breaks | Be honest. Explain what happened. Offer options |
