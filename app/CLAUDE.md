@AGENTS.md

# Faceless AI

SaaS platform for creating faceless YouTube videos. Next.js App Router + AWS (Cognito, DynamoDB, S3).

## Commands

```bash
pnpm dev              # Next.js dev server (port 3000)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm type-check       # TypeScript check (no emit)
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm db:setup         # Create DynamoDB Local tables
pnpm db:seed          # Seed dev data
```

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS v4 + shadcn/ui (new-york style)
- Zustand (global state) + TanStack Query (async state)
- React Hook Form + Zod (forms/validation)
- AWS Cognito (auth) + DynamoDB (database)
- pnpm (package manager)

## Code Style

- All components use TypeScript (.tsx/.ts)
- Use `@/` import alias for `src/`
- Server components by default; add `"use client"` only when needed
- Route Handlers in `src/app/api/[module]/route.ts`
- Business logic in `src/lib/` (never in components or route handlers directly)
- Types in `src/lib/types/` — shared between client and server
- Zustand stores in `src/stores/` — client-only global state
- TanStack Query hooks in `src/hooks/` — async data fetching
- Form components use React Hook Form + Zod schemas
- Use Sonner for toast notifications (`import { toast } from "sonner"`)
- Use `cn()` from `@/lib/utils` for conditional classNames

## Forbidden Patterns

- NEVER store tokens in localStorage (HttpOnly cookies only, managed by BFF)
- NEVER call Cognito directly from client-side code (all auth goes through Route Handlers)
- NEVER hardcode API keys or secrets in source code
- NEVER use `any` type — use `unknown` and narrow
- NEVER import server-only modules in client components
- NEVER mock database calls in integration tests — use DynamoDB Local
- NEVER modify existing tests to make them pass — fix the implementation
