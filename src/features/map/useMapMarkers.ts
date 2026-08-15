import { useCallback, useEffect, useState } from "react";
import { fetchMapMarkers } from "../../api/mapApi";
import type { Event } from "../../types/event";
import type { FilterState } from "../../types/filters";
import type { UseFiltersResult } from "../filters/useFilters";

export type MapMarkersState =
  | { status: "loading" }
  | { status: "loaded"; markers: Event[]; filters: FilterState }
  | { status: "error"; message: string };

export interface UseMapMarkersResult {
  state: MapMarkersState;
  retry: () => void;
}

// The web equivalent of Mobile's MapQueryViewModel — combines the (shared, lifted) filter state
// with GET /api/events/map into a single fetch, mirroring useFilteredFeed's fetch-ownership
// pattern but without a search-query input (map excludes free-text search, per spec.md's Out of
// Scope). Re-fetches whenever the filter state changes, whether the change originated on this
// screen or on the Feed screen before switching routes (both read the same FilterProvider).
export function useMapMarkers(filters: UseFiltersResult): UseMapMarkersResult {
  const [state, setState] = useState<MapMarkersState>({ status: "loading" });
  const [retryNonce, setRetryNonce] = useState(0);
  const retry = useCallback(() => setRetryNonce((n) => n + 1), []);

  const { dateBucket, city, artist } = filters.state;
  // Set has no referential equality across renders — derive a stable string key so the effect
  // only re-fires on an actual genre-selection change, matching useFilteredFeed's approach.
  const genresKey = Array.from(filters.state.genres).sort().join(",");
  const genres = genresKey === "" ? [] : genresKey.split(",");

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchMapMarkers({
      dateBucket: dateBucket ?? undefined,
      city: city ?? undefined,
      genres: genres.length > 0 ? genres : undefined,
      artistId: artist?.id,
    })
      .then(({ data }) => {
        if (cancelled) return;
        setState({ status: "loaded", markers: data, filters: filters.state });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "map_markers_failed",
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateBucket, city, genresKey, artist?.id, retryNonce]);

  return { state, retry };
}
