import { useState } from "react";
import { CITIES, DATE_BUCKETS } from "./dateBuckets";
import { GenreArtistPanel } from "./GenreArtistPanel";
import type { UseFiltersResult } from "./useFilters";

interface FilterBarProps {
  filters: UseFiltersResult;
}

// Always-visible date/city preset chips + a "Filtros" toggle expanding the genre/artist panel
// inline (not a modal/bottom sheet) — per filters/context.md's locked entry-point decision.
export function FilterBar({ filters }: FilterBarProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="filter-bar">
      <div className="filter-bar__presets">
        {DATE_BUCKETS.map((bucket) => (
          <button
            key={bucket.value}
            type="button"
            className="filter-pill"
            aria-pressed={filters.state.dateBucket === bucket.value}
            onClick={() =>
              filters.selectDateBucket(
                filters.state.dateBucket === bucket.value ? null : bucket.value,
              )
            }
          >
            {bucket.label}
          </button>
        ))}

        {CITIES.map((city) => (
          <button
            key={city}
            type="button"
            className="filter-pill"
            aria-pressed={filters.state.city === city}
            onClick={() => filters.selectCity(filters.state.city === city ? null : city)}
          >
            {city}
          </button>
        ))}

        <button
          type="button"
          className="filter-pill filter-bar__toggle"
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((open) => !open)}
        >
          Filtros
        </button>
      </div>

      {panelOpen && <GenreArtistPanel filters={filters} />}
    </div>
  );
}
