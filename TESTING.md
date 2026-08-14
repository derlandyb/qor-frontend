# Testing — qor-frontend

Vitest + React Testing Library for unit/component tests, Playwright for UI/e2e tests. All commands
run inside the project's Docker image (see `Makefile` / `Dockerfile`) — nothing is installed on
the host.

## `event-feed` (`WEB-FEED-01`, 2026-08-14)

- Unit/component (Vitest + RTL): **44** total. Coverage: `src/api/{httpClient,eventsApi}`,
  `src/features/feed/*` (`EventCard`, `DateSectionHeader`, `EmptyState`, `ErrorState`,
  `EventFeedPage`, `useEventFeed`, `dateGrouping`), `src/components/{icons/Icon,PlaceholderPage}`,
  `src/components/nav/*` (`TopNav`, `BottomNav`, `Layout`), `src/App`.
- UI/e2e (Playwright): **2** total — `e2e/feed.spec.ts`, matching `WEB-FEED-01`'s two named
  tests. Mocks `GET /api/events` via `page.route(/\/api\/events(\?.*)?$/, ...)` — no live backend
  required. (A plain glob like `"**/api/events**"` also matches the `/src/api/eventsApi.ts`
  module script and breaks the app; the regex anchors the match to the end of the path or a `?`.)
- `make coverage` passes (≥80% lines/branches/functions/statements): 97.29% stmts / 87.61% branch
  / 100% funcs / 97.29% lines.
- Verified end-to-end against the real `api` service (not just mocks): with
  `VITE_API_BASE_URL=http://localhost:8080` in `frontend/.env`, `docker compose up frontend`
  correctly rendered a real seeded event from the live database, grouped under its local-date
  header, single-column on mobile, 3-column grid on desktop.

## Notable fixes found only by testing across environments

- `groupEventsByDate` originally derived an event's date via `new Date(iso).getFullYear()/
getMonth()/getDate()`, which re-interprets the ISO instant in the _runtime's_ timezone. Passed
  on the host (America/Sao_Paulo-ish local clock) but failed inside the Docker image (UTC),
  shifting evening Brazil-time events onto the next UTC day. Fixed by reading the date directly
  from the ISO string's own `-03:00`-offset date component instead of round-tripping through
  `Date`'s local getters; "Hoje"/"Amanhã" labels use `Intl.DateTimeFormat` pinned to
  `America/Sao_Paulo` so they're correct regardless of the container/browser's own timezone.
- `httpClient.ts`'s `API_BASE_URL` fell back to JS `undefined`, which template-literal-coerces to
  the literal string `"undefined"` and silently prefixed every request path
  (`"undefined/api/events"`) whenever `VITE_API_BASE_URL` wasn't set. Fixed with `?? ""` so an
  unset env var produces a clean same-origin relative request instead.

## Commands

- `make unit-tests` — `pnpm vitest run`
- `make ui-e2e-tests` — `pnpm playwright test`
- `make coverage` — `pnpm vitest run --coverage` (≥80% threshold)
- `make build` — `tsc --noEmit && vite build`
