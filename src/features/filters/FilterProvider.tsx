import { createContext, useContext, type ReactNode } from "react";
import type { UseDebouncedSearchResult } from "../search/useDebouncedSearch";
import type { UseFiltersResult } from "./useFilters";
import { useUrlSyncedFilters } from "./useUrlSyncedFilters";

export interface FilterContextValue {
  search: UseDebouncedSearchResult;
  filters: UseFiltersResult;
}

const FilterContext = createContext<FilterContextValue | null>(null);

// Lifted above the Feed (/) + Map (/mapa) route pair — map/design.md's "filter-state lifetime"
// Tech Decision — a single useUrlSyncedFilters() instance shared by both routes so switching
// between them preserves the visitor's active filters/search (MAP-003 AC2) instead of resetting
// on every route change.
export function FilterProvider({ children }: { children: ReactNode }) {
  const value = useUrlSyncedFilters();
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilterContext(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
}
