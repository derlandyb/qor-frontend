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

## `map` (`WEB-MAP-01`, 2026-08-14)

- Unit/component (Vitest + RTL): **167** total (up from 119). New coverage: `src/features/filters/FilterProvider`
  (the filter state lifted above the Feed+Map route pair, per `map/design.md`'s filter-state-lifetime
  decision — `EventFeedPage` now reads it via `useFilterContext()` instead of owning
  `useUrlSyncedFilters()` itself), `src/api/mapApi`, `src/features/map/*` (`useMapMarkers`,
  `viewportState`'s pure `deriveViewportState`, `geojson`, `MapPage`, `MarkerPreviewCard`,
  `ClusterListPanel`, `useDialogFocus`).
- UI/e2e (Playwright): **12** total (up from 8) — `e2e/map.spec.ts` (2, matching `WEB-MAP-01`'s
  named tests), plus the existing `feed.spec.ts` (2), `event-detail.spec.ts` (2), and
  `search-and-filters.spec.ts` (4). Mocks `GET /api/events/map` and `GET /api/filter-options/*`
  via `page.route(...)` — no live backend required.
- `make coverage` passes (≥80% lines/branches/functions/statements): 97.73% stmts / 89.74% branch
  / 93.75% funcs / 97.73% lines.
- **Review fixes** (`react-pr-reviewer`, PR #4): `FilterProvider` was originally mounted around the
  entire route tree instead of just the Feed+Map pair the design doc calls for — unrelated routes
  (event details, favorites, profile) were paying for its `/api/filter-options/*` fetches for no
  reason. Rescoped via a `FeedAndMapLayout` route element wrapping only `/` and `/mapa`, covered by
  a new `App.test.tsx` case asserting no filter-options request fires when opening `/perfil`.
  `MarkerPreviewCard`/`ClusterListPanel` (`role="dialog"`, not `aria-modal` since the map stays
  interactive underneath) also had no keyboard way in or out — only the mouse-only close button
  worked. Added a shared `useDialogFocus` hook: moves focus into the panel on open, wires Escape to
  the same `onClose` the close button uses, and restores focus to the tapped marker/cluster on
  close.
- Clustering is entirely Mapbox GL JS's own responsibility (its built-in `cluster: true` GeoJSON
  source, internally Supercluster) — this codebase only builds the GeoJSON feature collection
  (`geojson.ts`) and reacts to `click`/`moveend` events. `viewportState.ts`'s `deriveViewportState`
  is the one piece of state-derivation logic that _is_ app code (mirroring Mobile's equivalent
  unit-testable surface per `map/design.md`'s Testing Strategy) — it distinguishes an "empty
  viewport" (markers exist elsewhere) from "zero filter results" (no markers anywhere, filters
  active, offers "Limpar filtros").
- `mapbox-gl` needs mocking in Vitest/jsdom (no WebGL) — `MapPage.test.tsx` mocks the module with a
  fake `Map` class that records registered `on(event[, layer], handler)` callbacks and a fake
  `GeoJSONSource`, letting tests simulate `load`/`moveend`/cluster-and-marker `click` events
  directly without a real WebGL context.
- `mapboxgl.Map`'s constructor throws **synchronously** (not just an async `error` event) when
  `VITE_MAPBOX_TOKEN` is missing/invalid — confirmed by manually running the real dev server
  without a token, which crashed the whole `/mapa` route with no error boundary. The `vi.mock`
  fake `Map` never threw, so the unit suite alone didn't catch this; fixed by wrapping the
  `new mapboxgl.Map(...)` call in try/catch and treating a failure the same as MAP-007/012's
  "tiles/provider unavailable" case (full-panel retry, rest of the app stays reachable). A
  regression test drives the fake `Map`'s constructor to throw to cover this path.
- Since markers only exist inside Mapbox's own canvas (no DOM per-marker list, per
  `map/design.md`), there's no non-visual equivalent for screen-reader users or for e2e assertions
  — added a `sr-only` marker-count status announcement (global `.sr-only` utility class, reused
  from the same pattern as `.skip-link`) that both e2e tests in `map.spec.ts` assert on instead of
  Mapbox's own canvas/pixel output; real Mapbox network calls (`*.mapbox.com`) are blocked via
  `page.route` so the e2e suite never depends on network access or a real token.

## `auth` (`WEB-AUTH-01`, 2026-08-15)

- Unit/component (Vitest + RTL): **212** total (up from 167). New coverage: `src/auth/*`
  (`tokenStore`, `AuthContext`/`useAuth`, `AuthOverlay`, `GoogleSignInButton`,
  `useGoogleIdentityServices`, `GatedActionProvider`/`useGatedAction`, `ResetPasswordPage`),
  `src/api/authApi`, `httpClient`'s new token-injection branch, `src/hooks/useDialogFocus`
  (relocated from `src/features/map/`, now a second consumer alongside `MarkerPreviewCard`/
  `ClusterListPanel`, and given its own dedicated test file for the first time), and
  `EventCard`'s newly-gated favorite button.
- UI/e2e (Playwright): **12** total (up from 10) — `e2e/auth.spec.ts` (2, matching `WEB-AUTH-01`'s
  named tests), run against the Feed page's real favorite button (the one concrete gated-action
  call site in the app today — see below). Mocks `GET /api/events` and `POST /api/login` via
  `page.route(...)` — no live backend required.
- `make coverage` passes (≥80% lines/branches/functions/statements): 97.13% stmts / 89.09% branch
  / 93.27% funcs / 97.13% lines (pre-review-fix baseline; unchanged materially by the fixes below).
- **Backend contract deviations from `auth/design.md`**, confirmed against the already-merged
  `api` code rather than the design doc's literal snippets: (1) `PasswordResetController@reset`
  returns only a confirmation message — Laravel's `PasswordBroker::reset()` doesn't issue a
  session token — so `resetPassword()` no longer auto-adopts a session; the user logs in
  separately afterward, unlike design.md's "issues a fresh Sanctum token" assumption; (2)
  `RegisterRequest`/`ResetPasswordRequest` both require `password_confirmation` on the wire
  (Laravel's `confirmed` rule) even though the UI only collects one password field — `authApi.ts`
  sends the same value twice rather than adding a second confirm-password input, since no AUTH
  requirement asks for one; (3) session-resume uses the plain `GET /api/user` route (returns the
  raw `User` row) rather than `/api/admin/me`'s `{user, mustChangePassword}` envelope — that
  route is admin-only, and the consumer `User` model has no `mustChangePassword` concept.
- **Deliberate scope decision**: `EventCard`'s existing cosmetic favorite toggle (added during
  `event-feed`, explicitly stubbed pending the not-yet-built `favorites` feature) is now gated
  behind the new `useGatedAction()` hook — the one concrete call site needed to exercise
  `WEB-AUTH-01`'s two named tests against a real page instead of a synthetic test harness.
  Authenticated behavior is unchanged (local `setState`, no API call yet); anonymous clicks now
  open `AuthOverlay` first and replay the toggle on success. `favorites` will replace the local
  `setState` with a real API call inside the same gate.
- `GatedActionProvider` is mounted once, app-wide, in `App.tsx` (unlike the Feed/Map-scoped
  `FilterProvider`) since a gated action can originate from any route. Any test that renders
  `EventCard` (directly, or transitively via `EventFeedPage`/`MarkerPreviewCard`/
  `ClusterListPanel`) now needs both `AuthProvider` and `GatedActionProvider` in its tree —
  centralized in a new `src/test/renderWithProviders.tsx` helper rather than duplicated per file.
- Google Sign-In (`GoogleSignInButton`/`useGoogleIdentityServices`) only loads the Google
  Identity Services script and renders its button when `VITE_GOOGLE_CLIENT_ID` is configured —
  mirroring `map`'s missing-Mapbox-token guard pattern — so dev/test/CI never depend on a real
  Google client id or network access. This repo's `.env.example`/`.env` leave it blank by
  default; the "unconfigured" test path needs no env stubbing since it matches that default
  exactly.
- `.btn`/`.btn--primary`/`.btn--secondary` were ported from `design-system/preview/styles.css`
  into `src/styles/global.css` on this feature's first need for a generic CTA button — no prior
  feature needed one (`EventCard`/`filters`/`search` all use their own bespoke controls).
- **Review fixes** (`react-pr-reviewer`, PR #5): `AuthOverlay` declared `aria-modal="true"` but
  `useDialogFocus` (built for the map's non-modal floating panels, which deliberately leave the
  map interactive underneath) never trapped Tab/Shift+Tab — a keyboard user could tab straight
  out of the dialog into the page behind the backdrop. `useDialogFocus` gained an opt-in
  `trapFocus` option (cycles Tab/Shift+Tab within the dialog's own focusable elements; the map's
  two call sites are unaffected, still `trapFocus: false` by default), and `AuthOverlay` now also
  locks `<body>` scroll while mounted. Covered by three new tests (two on `AuthOverlay`, one
  dedicated `useDialogFocus.test.tsx` covering both the trapped and untrapped paths — its first
  direct test file). Also fixed: `AuthOverlay`'s `handleGoogleCredential` was a new function
  identity every render (e.g. every keystroke in the email/password fields), which
  `useGoogleIdentityServices`' effect depends on — once a real `VITE_GOOGLE_CLIENT_ID` is
  configured, this would have re-run `google.accounts.id.initialize()`/`renderButton()` on every
  keystroke; wrapped in `useCallback`. `ResetPasswordPage` also gained an explicit invalid-link
  state (no `token`/`email` in the URL) instead of silently rendering a form that would only fail
  once submitted.

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
