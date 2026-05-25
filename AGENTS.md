<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Faraday — AGENTS.md

Brand new project (created May 2026). No code yet.

**Goal:** Fullstack app to track content creator KPIs (followers, views, etc.), contact info, and display in a dashboard. Future: marketplace for brand-creator contracts/scouting.

## Key sources of truth

Design/spec docs live in `Faraday/`:
- `High Level Specs.md` — CRM, contract/project manager, and marketplace goals
- `Design Things to Add.md` — reminder list of pending features (dark mode, CSV upload, etc.)
- `project_definition.md` — reserved for a formal definition (currently empty)
- `agent_prompts.md` — prompts for the 5-agent development pipeline
- `tasks.md` (generated inside `Faraday/`) — ordered tasks with success criteria (created by Program Manager agent)
- `Faraday/docs/` — wiki-style documentation (created by Documentation agent)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5.2 + Django REST Framework |
| Frontend | Next.js 16 (App Router, TypeScript, Tailwind CSS) |
| Database | PostgreSQL 16 |
| ORM | Django ORM |
| Containerization | Docker Compose |

## Project Structure

```
faraday/
├── backend/           # Django project (Django 5.2 + DRF)
│   ├── settings.py    # Django settings (uses env vars for DB config)
│   ├── urls.py        # Root URL conf → includes api/
│   ├── manage.py      # Django CLI entry point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/          # Next.js 16 (consumes Django REST API)
│   ├── src/app/       # App Router pages
│   ├── package.json
│   └── next.config.ts
├── creators/          # Django app — all CRM models/views
│   ├── models.py      # Creator, SocialLink, Tag, Note
│   ├── serializers.py # DRF serializers
│   ├── views.py       # DRF ViewSets
│   └── admin.py
├── docker-compose.yml # PostgreSQL + backend services
├── .env               # Local env vars (gitignored)
├── .env.example       # Documented env vars
└── Faraday/           # Obsidian symlink — planning docs only
```

## Dev Commands

```bash
# Start PostgreSQL
docker compose up -d db

# Start Django backend
python3 backend/manage.py runserver  # → localhost:8000

# Start Next.js frontend (separate terminal)
npm run dev  # in frontend/ → localhost:3000

# Django migrations
python3 backend/manage.py makemigrations
python3 backend/manage.py migrate

# Admin panel
open http://localhost:8000/admin/
```

Populate this file as decisions are made — framework choice, directory layout, dev commands, conventions, and quirks.

## Next.js 16 conventions (breaking changes from prior versions)

Read `node_modules/next/dist/docs/` before writing any code. Key differences:

- **`params` and `searchParams` are Promises** — always `await` them in pages, layouts, route handlers. Never access synchronously.
- **`middleware.ts` is deprecated** — use `proxy.ts` at project root instead (export `proxy` function).
- **`GET` route handlers are NOT cached by default** — opt in with `dynamic = 'force-static'` or `use cache`.
- **`<Image preload>` replaces `<Image priority>`** — `priority` is deprecated.
- **`cookies()` and `headers()` must be awaited** — they are async in v16.
- **`PageProps`, `LayoutProps`, `RouteContext`** — globally available type helpers (no import needed) for route param inference.
- **`use cache` directive** — new caching mechanism; works with `cacheLife()` / `cacheTag()` from `next/cache`.
- **`proxy.ts` replaces `middleware.ts`** — `next.config` keys renamed: `skipProxyUrlNormalize`, `skipTrailingSlashRedirect`.

## Filesystem rules

Keep `Faraday/` exclusively for human-readable planning and documentation. Do not add anything to `Faraday/` without asking first — the only exceptions are task files (`tasks.md`) and wiki-style docs (`docs/`). No code, config, or generated artifacts belong there.

## Execution Heuristics

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
