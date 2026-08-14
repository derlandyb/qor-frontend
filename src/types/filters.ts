export type DateBucket = "hoje" | "amanha" | "fim_de_semana" | "proxima_semana";

export interface ArtistOption {
  id: string;
  name: string;
}

export interface FilterState {
  dateBucket: DateBucket | null; // single-select
  city: string | null; // single-select, one of the 4 named cities
  genres: Set<string>; // multi-select, OR-combined server-side
  artist: ArtistOption | null; // single-select, picker-only (no free text)
}

export const emptyFilterState: FilterState = {
  dateBucket: null,
  city: null,
  genres: new Set(),
  artist: null,
};

export function isFilterStateEmpty(state: FilterState): boolean {
  return (
    state.dateBucket === null &&
    state.city === null &&
    state.genres.size === 0 &&
    state.artist === null
  );
}
