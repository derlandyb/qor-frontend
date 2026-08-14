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

## `event-details` + `search` + `filters` (`WEB-DETAIL-01`, `WEB-SEARCH-01`, `WEB-FILTER-01`, 2026-08-14)

- Unit/component (Vitest + RTL): **119** total (up from 44). New coverage: `src/features/detail/*`
  (`useEventDetail`, `StatusBanner`, `ActionRow`, `DescriptionSection`, `LocationSection`,
  `PromoterSection`, `NotFoundPage`, `formatPriceLine`, `EventDetailPage`), `src/features/search/*`
  (`useDebouncedSearch`, `SearchBar`), `src/features/filters/*` (`useFilters`, `useFilteredFeed`,
  `useUrlSyncedFilters`, `FilterBar`, `GenreArtistPanel`, `ActiveFilterChips`),
  `src/api/{eventsApi,filterOptionsApi}` extensions, and `EventFeedPage`'s new search/filter
  composition branches.
- UI/e2e (Playwright): **8** total (up from 2) — `e2e/event-detail.spec.ts` (2, matching
  `WEB-DETAIL-01`'s named tests) and `e2e/search-and-filters.spec.ts` (4, matching
  `WEB-SEARCH-01`'s and `WEB-FILTER-01`'s combined named tests), plus the existing `feed.spec.ts`
  (2). All mock `GET /api/events`, `GET /api/events/{id}`, and `GET /api/filter-options/*` via
  `page.route(...)` — no live backend required.
- `make coverage` passes (≥80% lines/branches/functions/statements): 97.99% stmts / 90.06% branch
  / 96.82% funcs / 97.99% lines.
- `fetchEventFeed` moved from positional `(cursor?, limit)` params to a single options object
  (`{ cursor?, limit?, q?, dateBucket?, city?, genres?, artistId? }`) to carry `search`'s and
  `filters`' additive query params — `useEventFeed.ts`'s one call site updated in the same commit,
  its existing tests passed unmodified.
- `useFilteredFeed` is the sole component that calls `fetchEventFeed` for the combined
  search+filter result list, per both features' design docs' fetch-ownership amendment — avoids
  `search`'s debounce and `filters`' selection state racing into two separate requests against the
  same endpoint. `FilterState.genres` (a `Set`, no referential equality across renders) is reduced
  to a sorted, joined string for the effect's dependency array so a genre toggle re-fetches exactly
  once, not once per parent render (covered by an explicit test).
- "Limpar filtros" clears both filter chips and the search query, fully restoring the untouched
  feed — a deliberate product decision (confirmed with the user) resolving a wording mismatch
  between the design docs' "search clears independently" Error Handling Strategy and this task's
  required test name, which reads as implying a full reset.
- Filter/search state round-trips through the URL via React Router's `useSearchParams`
  (`useUrlSyncedFilters`) — genres serialize as a single comma-joined `?genres=` param for a
  readable bookmarkable URL, translated to repeated `genres[]` keys only where `fetchEventFeed`
  needs them.

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
- `useFilteredFeed.test.ts`'s debounce-triggering tests initially used `vi.useFakeTimers()` +
  `waitFor(...)`, which hung indefinitely: RTL's `waitFor` polls via a real `setTimeout` internally
  and never observes a manually-driven fake clock. Fixed by using real timers and a real ~320ms
  wait instead — cheap enough for a unit suite and avoids the trap entirely.

## Commands

- `make unit-tests` — `pnpm vitest run`
- `make ui-e2e-tests` — `pnpm playwright test`
- `make coverage` — `pnpm vitest run --coverage` (≥80% threshold)
- `make build` — `tsc --noEmit && vite build`
