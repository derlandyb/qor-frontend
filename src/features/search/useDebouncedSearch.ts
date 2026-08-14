import { useEffect, useState } from "react";

const MIN_QUERY_LENGTH = 2; // Agent's Discretion — smallest threshold that meaningfully narrows results
const DEBOUNCE_MS = 300; // Agent's Discretion — headroom inside PRD §25's <1s budget while feeling live

export interface UseDebouncedSearchResult {
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string | null;
}

// Debounce + minimum-length guard only — no fetch. useFilteredFeed is the sole fetcher that
// consumes debouncedQuery, so search and filters never race against the same endpoint
// (search/design.md's fetch-ownership amendment, 2026-08-11).
export function useDebouncedSearch(initialQuery = ""): UseDebouncedSearchResult {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState<string | null>(
    initialQuery.trim().length >= MIN_QUERY_LENGTH ? initialQuery.trim() : null,
  );

  useEffect(() => {
    const trimmed = query.trim();
    const handle = window.setTimeout(() => {
      setDebouncedQuery(trimmed === "" || trimmed.length < MIN_QUERY_LENGTH ? null : trimmed);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [query]);

  return { query, setQuery, debouncedQuery };
}
