# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

pnpm, not npm — the lockfile is `pnpm-lock.yaml`. Node 24 (pinned by Volta).

```bash
pnpm dev            # Development server
pnpm build          # Production build
pnpm lint           # ESLint via `next lint`
pnpm test           # Vitest, single run
pnpm test:watch     # Vitest, watch mode
pnpm clean          # Delete .next, node_modules and empty dirs
pnpm exec tsc --noEmit                      # Typecheck — no script for it
pnpm exec vitest run src/lib/cache.test.ts  # One test file
```

Tests are Vitest, in `*.test.ts` files next to the code they cover. They run in
the default node environment with no network — provider responses are fixtures.
`@/` resolves to `src/` in both Next.js and Vitest.

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
  → Server Component renders page 1
  → React Query useInfiniteQuery calls the Server Action for later pages
```

The board paginates by repository (20 per account per page); each repo's open
pulls come with it.

Filters are split by cost. `starred` and `byMe` change what the providers are
asked for, so they live in the React Query key and refetch from page 1 (and
flipping back hits the cache). `empty` only hides repos already fetched, so the
board applies it in the browser for free — the server returns empty repos and
never filters them out. Pages therefore arrive uneven: the infinite-scroll
sentinel stays mounted while `hasMore` is true, so a page filtered down to
nothing loads the next one instead of stalling.

`getBoardData` takes its filters as arguments rather than reading the cookie,
so a refetch can't race the cookie write; the cookie only seeds the first
server render. Results are memoized by `src/lib/cache.ts` (60s per board page,
1h per `getCurrentUser`), keyed by a hash of the token — never the token
itself. The cache is in-process, which suits a single instance.

### Key Directories

- `src/app/` — Next.js routes. `(pulls)` is a route group for the main board.
- `src/features/` — Feature modules (`pull-board`, `account`). Each contains components, `actions.ts` (Server Actions), and `schema.ts` (Zod types).
- `src/lib/git-provider/` — Git provider abstraction. `index.ts` exposes a `getProvider("github" | "gitlab")` factory. `github/` uses Octokit; `gitlab/` uses Axios.
- `src/lib/react-query/` — Query client config and provider.
- `src/lib/ui/` — Shared layout components (`PageRoot`, `PageHeader`, `PageContent`).
- `src/lib/crypto.ts` — `encrypt()` / `decrypt()` utilities for token storage.
- `src/lib/cache.ts` — in-process TTL memo for provider reads.
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

Sorting, filtering and pagination are provider API parameters, not post-fetch
work — see `ListReposOptions` / `ListPullRequestsOptions`. Two things can't be:
GitHub has no author parameter on `pulls.list`, so `authorLogin` is applied to
the fetched page inside the provider; and no API filters repos by "has open
pulls", so the `empty` filter stays in the board action.

`listPullRequestsForRepos` is an optional batch hook. GitHub implements it with
one GraphQL query aliasing `repository(owner:, name:)` per repo — a page costs 1
request instead of ~20. It deliberately avoids `viewer.repositories`, whose
`ownerAffiliations` default silently omits organization repos. It returns
entries only for repos it resolved, so callers fall back to `listPullRequests`
per repo for anything missing (partial GraphQL errors, providers without the
hook). GitLab has no implementation and takes the per-project path.

### Adding a New Git Provider

1. Create `src/lib/git-provider/<name>/` with the provider implementation
2. Implement the `GitProvider` interface from `schema.ts`
3. Register it in the `getProvider` factory in `index.ts`
