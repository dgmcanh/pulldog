# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint via Next.js
npm run clean     # Run cleanup script
```

There is no test suite configured.

## Environment

Requires a `.env.local` file with:

```
SECRET=<random string used to encrypt tokens stored in cookies>
```

## Architecture

**Pulldog** is a unified pull request dashboard for GitHub and GitLab, built with Next.js 15 App Router, React 19, and TypeScript.

### Stack

- **Next.js 15** App Router — routing, Server Components, Server Actions
- **Mantine 8** — UI component library and form handling
- **TanStack React Query 5** — client-side server state
- **Zod** — schema validation for forms and API data
- **Octokit** — GitHub REST API client
- **Axios** — HTTP client for GitLab API
- **Tailwind CSS 4** — utility styling
- **CryptoJS** — token encryption before cookie storage

### Data Flow

```
Cookie (encrypted accounts)
  → Server Action (decrypt + call Git provider)
  → Git Provider abstraction (GitHub or GitLab)
  → Server Component renders initial data
  → React Query hydrates for client-side refresh
```

### Key Directories

- `src/app/` — Next.js routes. `(pulls)` is a route group for the main board.
- `src/features/` — Feature modules (`pull-board`, `account`). Each contains components, `actions.ts` (Server Actions), and `schema.ts` (Zod types).
- `src/lib/git-provider/` — Git provider abstraction. `index.ts` exposes a `getProvider("github" | "gitlab")` factory. `github/` uses Octokit; `gitlab/` uses Axios.
- `src/lib/react-query/` — Query client config and provider.
- `src/lib/ui/` — Shared layout components (`PageRoot`, `PageHeader`, `PageContent`).
- `src/lib/crypto.ts` — `encrypt()` / `decrypt()` utilities for token storage.
- `src/env.ts` — Typed environment variable access.

### State Management

State lives in two places:

1. **Cookies** (server-side): encrypted `accounts` list and `board-filters` preferences
2. **React Query** (client-side): server state synchronization after hydration

There is no Redux, Zustand, or other client state library.

### Git Provider Abstraction

To support both GitHub and GitLab with a common interface:

- `src/lib/git-provider/schema.ts` defines shared types (`GitUser`, `GitRepository`, `PullRequest`, etc.)
- `src/lib/git-provider/index.ts` exports `getProvider(type)` factory
- Each provider implements the same interface independently

### Adding a New Git Provider

1. Create `src/lib/git-provider/<name>/` with the provider implementation
2. Implement the `GitProvider` interface from `schema.ts`
3. Register it in the `getProvider` factory in `index.ts`
