import { useCallback, useEffect, useState } from "react";
import { fetchEventFeed } from "../../api/eventsApi";
import type { Event } from "../../types/event";
import type { UseDebouncedSearchResult } from "../search/useDebouncedSearch";
import type { FilterChip, UseFiltersResult } from "./useFilters";

export type FilteredFeedState =
  | { status: "inactive" }
  | { status: "loading" }
  | { status: "results"; events: Event[] }
  // Carries the active chips/query so the no-results view can name them (FILTER-006 AC2),
  // mirroring Mobile's FeedResultsUiState.NoResults(activeFilters, q).
  | { status: "no-results"; chips: FilterChip[]; q: string }
  | { status: "error"; message: string };

export interface UseFilteredFeedResult {
  state: FilteredFeedState;
  retry: () => void;
}

// The sole fetcher combining search's debounced query with filters' selection state into one
// GET /api/events call — search and filters always coexist inline on the Feed, so a single
// coordinator avoids two independently-fetching hooks racing/double-fetching the same endpoint
// (search/design.md + filters/design.md's fetch-ownership amendment, 2026-08-11).
export function useFilteredFeed(
  search: UseDebouncedSearchResult,
  filters: UseFiltersResult,
): UseFilteredFeedResult {
  const [state, setState] = useState<FilteredFeedState>({ status: "inactive" });
  const [retryNonce, setRetryNonce] = useState(0);
  const retry = useCallback(() => setRetryNonce((n) => n + 1), []);

  const q = search.debouncedQuery ?? "";
  const { dateBucket, city, artist } = filters.state;
  // Set has no referential equality across renders — derive a stable string key so the effect
  // only re-fires on an actual genre-selection change, not on every parent render.
  const genresKey = Array.from(filters.state.genres).sort().join(",");
  const genres = genresKey === "" ? [] : genresKey.split(",");

  useEffect(() => {
    const isActive =
      q !== "" || dateBucket !== null || city !== null || genresKey !== "" || artist !== null;

    if (!isActive) {
      setState({ status: "inactive" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    fetchEventFeed({
      q: q || undefined,
      dateBucket: dateBucket ?? undefined,
      city: city ?? undefined,
      genres: genres.length > 0 ? genres : undefined,
      artistId: artist?.id,
    })
      .then((page) => {
        if (cancelled) return;
        setState(
          page.data.length === 0
            ? { status: "no-results", chips: filters.asChips(), q }
            : { status: "results", events: page.data },
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "filtered_feed_failed",
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, dateBucket, city, genresKey, artist?.id, retryNonce]);

  return { state, retry };
}
