import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedSearch, type UseDebouncedSearchResult } from "../search/useDebouncedSearch";
import type { ArtistOption, DateBucket, FilterState } from "../../types/filters";
import { useFilters, type UseFiltersResult } from "./useFilters";

const DATE_BUCKET_VALUES: DateBucket[] = ["hoje", "amanha", "fim_de_semana", "proxima_semana"];

function parseInitialFilterState(params: URLSearchParams): FilterState {
  const dateBucketParam = params.get("date_bucket");
  const dateBucket = DATE_BUCKET_VALUES.includes(dateBucketParam as DateBucket)
    ? (dateBucketParam as DateBucket)
    : null;

  const genresParam = params.get("genres");
  const genres = genresParam ? new Set(genresParam.split(",").filter(Boolean)) : new Set<string>();

  const artistId = params.get("artist_id");
  const artistName = params.get("artist_name");
  const artist: ArtistOption | null = artistId
    ? { id: artistId, name: artistName ?? artistId }
    : null;

  return {
    dateBucket,
    city: params.get("city"),
    genres,
    artist,
  };
}

// Wraps useFilters + useDebouncedSearch with React Router's useSearchParams so a shared/
// bookmarked filtered URL restores the exact same feed (filters/tasks.md's "state is
// URL/restorable on Web"). Genres round-trip as a comma-joined ?genres= param in the visible
// URL, translated to repeated genres[] keys only when useFilteredFeed calls fetchEventFeed.
export function useUrlSyncedFilters(): {
  search: UseDebouncedSearchResult;
  filters: UseFiltersResult;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialized = useRef(false);
  const [initialFilterState] = useState<FilterState>(() => parseInitialFilterState(searchParams));
  const [initialQuery] = useState<string>(() => searchParams.get("q") ?? "");

  const search = useDebouncedSearch(initialQuery);
  const filters = useFilters(initialFilterState);

  useEffect(() => {
    // Skip the very first run unconditionally — otherwise a bookmarked/shared filtered URL
    // triggers a redundant setSearchParams rewriting the URL to the same string it already had.
    if (!initialized.current) {
      initialized.current = true;
      return;
    }

    const next = new URLSearchParams();
    if (search.query.trim() !== "") next.set("q", search.query.trim());
    if (filters.state.dateBucket) next.set("date_bucket", filters.state.dateBucket);
    if (filters.state.city) next.set("city", filters.state.city);
    if (filters.state.genres.size > 0)
      next.set("genres", Array.from(filters.state.genres).sort().join(","));
    if (filters.state.artist) {
      next.set("artist_id", filters.state.artist.id);
      next.set("artist_name", filters.state.artist.name);
    }

    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.query, filters.state]);

  return { search, filters };
}
