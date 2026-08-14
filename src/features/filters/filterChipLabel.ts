import { DATE_BUCKETS } from "./dateBuckets";
import type { FilterChip } from "./useFilters";

export function chipLabel(chip: FilterChip): string {
  switch (chip.type) {
    case "date":
      return DATE_BUCKETS.find((bucket) => bucket.value === chip.bucket)?.label ?? chip.bucket;
    case "city":
      return chip.city;
    case "genre":
      return `Gêneros (${chip.genres.size})`;
    case "artist":
      return chip.artist.name;
  }
}

// FILTER-006 AC2 — the no-results empty state must name the applied filters/query, not just
// say "esses filtros" generically. Mirrors Mobile's FeedResultsUiState.NoResults(activeFilters, q).
export function formatActiveFiltersSummary(chips: FilterChip[], q: string): string {
  const parts = chips.map(chipLabel);
  if (q.trim() !== "") parts.unshift(`"${q.trim()}"`);
  if (parts.length === 0) return "esses filtros";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
}
