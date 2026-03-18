# Build Workflow & Best Practices

## Session Discipline
1. Start fresh — /clear at beginning of each coding session
2. Load context — Read spec + current task file
3. Small batch — 1-2 components per session (5-20 files max)
4. Tests must pass — No commit without passing tests
5. Review the diff — User reviews every change
6. Update progress — Mark done in task file
7. Save and exit — Before context gets stale
8. If corrected twice on same issue → /clear and restart with better prompt

## Project Structure
```
CLAUDE.md              — Build/test/lint commands, code style, forbidden patterns
architecture.md        — Master spec (the comprehensive blueprint)
tasks/
  [feature]-plan.md    — What we're building
  [feature]-context.md — Key files, decisions, dependencies
  [feature]-progress.md — Checklist of work items
```

## Build Order (Dependencies)
1. Auth (Cognito)
2. Account + DynamoDB base
3. Channel CRUD
4. Style model
5. Niche Finder (core search + scoring)
6. Research Board
7. Channel Builder + AI Style Generation
8. Scripts (GPT-4o)
9. Voiceovers (ElevenLabs)
10. Images (fal.ai)
11. Video Generation (fal.ai)
12. Editing (FFmpeg on Fargate)
13. Publishing (YouTube OAuth)
14. SEO + Analytics
15. Billing (Stripe)
16. Settings + Admin

## Key Rules
- Feature-by-feature in vertical slices (model + API + UI + tests)
- Git repo from day one, every feature gets a branch
- Tests written alongside implementation, never after
- Integration tests over unit tests (no heavy mocking)
- Pre-commit hooks block if tests fail
- Spec-driven: 1 iteration with spec = 8 without
- Never let Claude improvise architecture — spec is the source of truth

## Known Claude Code Failure Modes to Guard Against
- Context amnesia after long sessions → /clear aggressively
- Hallucinating files/APIs → always verify against spec
- Claiming "done" prematurely → tests must pass
- Modifying tests to pass instead of fixing code → review test diffs carefully
- Quick hacks over proper architecture → enforce spec compliance
- Ignoring CLAUDE.md in long sessions → keep CLAUDE.md lean and critical
