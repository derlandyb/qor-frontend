import { DATE_BUCKETS } from "./dateBuckets";
import type { FilterChip } from "./useFilters";

interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onRemove: (chip: FilterChip) => void;
  onClearAll: () => void;
}

function chipLabel(chip: FilterChip): string {
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

// One chip per filter *type* (genres collapse to a single chip), each individually removable,
// plus a trailing "Limpar filtros" that also clears the search query — FILTER-006/010.
export function ActiveFilterChips({ chips, onRemove, onClearAll }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="active-filter-chips">
      {chips.map((chip) => (
        <span key={chip.type} className="active-filter-chips__chip">
          {chipLabel(chip)}
          <button
            type="button"
            aria-label={`Remover filtro ${chipLabel(chip)}`}
            onClick={() => onRemove(chip)}
          >
            ×
          </button>
        </span>
      ))}
      <button type="button" className="active-filter-chips__clear" onClick={onClearAll}>
        Limpar filtros
      </button>
    </div>
  );
}
