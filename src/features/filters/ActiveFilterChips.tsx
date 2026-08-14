import { chipLabel } from "./filterChipLabel";
import type { FilterChip } from "./useFilters";

interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onRemove: (chip: FilterChip) => void;
  onClearAll: () => void;
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
