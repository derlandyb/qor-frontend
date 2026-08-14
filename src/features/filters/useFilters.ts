import { useCallback, useEffect, useState } from "react";
import { getArtistOptions, getGenreOptions } from "../../api/filterOptionsApi";
import type { ArtistOption, DateBucket, FilterState } from "../../types/filters";
import { emptyFilterState } from "../../types/filters";

export type OptionsState<T> =
  { status: "loading" } | { status: "loaded"; options: T[] } | { status: "error"; message: string };

export type FilterChip =
  | { type: "date"; bucket: DateBucket }
  | { type: "city"; city: string }
  | { type: "genre"; genres: Set<string> }
  | { type: "artist"; artist: ArtistOption };

export interface UseFiltersResult {
  state: FilterState;
  genreOptions: OptionsState<string>;
  artistOptions: OptionsState<ArtistOption>;
  selectDateBucket: (bucket: DateBucket | null) => void;
  selectCity: (city: string | null) => void;
  toggleGenre: (genre: string) => void;
  selectArtist: (artist: ArtistOption | null) => void;
  removeChip: (chip: FilterChip) => void;
  clearAll: () => void;
  asChips: () => FilterChip[];
  reload: (initial: FilterState) => void;
}

// Owns FilterState selection + fetches both option lists once on mount. Never re-fetches
// GET /api/events itself — useFilteredFeed is the sole fetcher (filters/design.md's
// fetch-ownership decision), this hook only owns selection state and the picker option lists.
export function useFilters(initialState: FilterState = emptyFilterState): UseFiltersResult {
  const [state, setState] = useState<FilterState>(initialState);
  const [genreOptions, setGenreOptions] = useState<OptionsState<string>>({ status: "loading" });
  const [artistOptions, setArtistOptions] = useState<OptionsState<ArtistOption>>({
    status: "loading",
  });

  const loadGenres = useCallback(() => {
    setGenreOptions({ status: "loading" });
    getGenreOptions()
      .then((options) => setGenreOptions({ status: "loaded", options }))
      .catch(() =>
        setGenreOptions({ status: "error", message: "Não foi possível carregar os gêneros." }),
      );
  }, []);

  const loadArtists = useCallback(() => {
    setArtistOptions({ status: "loading" });
    getArtistOptions()
      .then((options) => setArtistOptions({ status: "loaded", options }))
      .catch(() =>
        setArtistOptions({ status: "error", message: "Não foi possível carregar os artistas." }),
      );
  }, []);

  useEffect(() => {
    loadGenres();
    loadArtists();
  }, [loadGenres, loadArtists]);

  const selectDateBucket = useCallback((bucket: DateBucket | null) => {
    setState((current) => ({ ...current, dateBucket: bucket }));
  }, []);

  const selectCity = useCallback((city: string | null) => {
    setState((current) => ({ ...current, city }));
  }, []);

  const toggleGenre = useCallback((genre: string) => {
    setState((current) => {
      const next = new Set(current.genres);
      if (next.has(genre)) {
        next.delete(genre);
      } else {
        next.add(genre);
      }
      return { ...current, genres: next };
    });
  }, []);

  const selectArtist = useCallback((artist: ArtistOption | null) => {
    setState((current) => ({ ...current, artist }));
  }, []);

  const removeChip = useCallback((chip: FilterChip) => {
    setState((current) => {
      switch (chip.type) {
        case "date":
          return { ...current, dateBucket: null };
        case "city":
          return { ...current, city: null };
        case "genre":
          return { ...current, genres: new Set() };
        case "artist":
          return { ...current, artist: null };
      }
    });
  }, []);

  const clearAll = useCallback(() => {
    setState(emptyFilterState);
  }, []);

  const asChips = useCallback((): FilterChip[] => {
    const chips: FilterChip[] = [];
    if (state.dateBucket) chips.push({ type: "date", bucket: state.dateBucket });
    if (state.city) chips.push({ type: "city", city: state.city });
    if (state.genres.size > 0) chips.push({ type: "genre", genres: state.genres });
    if (state.artist) chips.push({ type: "artist", artist: state.artist });
    return chips;
  }, [state]);

  return {
    state,
    genreOptions,
    artistOptions,
    selectDateBucket,
    selectCity,
    toggleGenre,
    selectArtist,
    removeChip,
    clearAll,
    asChips,
    reload: setState,
  };
}
