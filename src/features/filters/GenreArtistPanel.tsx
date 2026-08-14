import type { ReactNode } from "react";
import type { ArtistOption } from "../../types/filters";
import type { OptionsState, UseFiltersResult } from "./useFilters";

interface GenreArtistPanelProps {
  filters: UseFiltersResult;
}

function OptionListSection<T>({
  title,
  optionsState,
  renderPill,
}: {
  title: string;
  optionsState: OptionsState<T>;
  renderPill: (option: T, key: string) => ReactNode;
}) {
  if (optionsState.status === "loading") {
    return (
      <div className="genre-artist-panel__section">
        <h4 className="label-md">{title}</h4>
        <p className="caption" role="status">
          Carregando…
        </p>
      </div>
    );
  }

  if (optionsState.status === "error") {
    return (
      <div className="genre-artist-panel__section">
        <h4 className="label-md">{title}</h4>
        <p className="caption" role="alert">
          {optionsState.message}
        </p>
      </div>
    );
  }

  if (optionsState.options.length === 0) {
    return (
      <div className="genre-artist-panel__section">
        <h4 className="label-md">{title}</h4>
        <p className="caption genre-artist-panel__empty">Nada para filtrar ainda</p>
      </div>
    );
  }

  return (
    <div className="genre-artist-panel__section">
      <h4 className="label-md">{title}</h4>
      <div className="genre-artist-panel__pills">
        {optionsState.options.map((option, index) => renderPill(option, String(index)))}
      </div>
    </div>
  );
}

// Inline expandable panel (not a modal/bottom sheet, per filters/context.md's locked decision).
// Genre is multi-select (OR-combined server-side); artist is single-select, picker-only.
export function GenreArtistPanel({ filters }: GenreArtistPanelProps) {
  return (
    <div className="genre-artist-panel">
      <OptionListSection
        title="Gênero"
        optionsState={filters.genreOptions}
        renderPill={(genre, key) => (
          <button
            key={key}
            type="button"
            className="filter-pill"
            aria-pressed={filters.state.genres.has(genre)}
            onClick={() => filters.toggleGenre(genre)}
          >
            {genre}
          </button>
        )}
      />

      <OptionListSection
        title="Artista"
        optionsState={filters.artistOptions}
        renderPill={(artist: ArtistOption, key) => (
          <button
            key={key}
            type="button"
            className="filter-pill"
            aria-pressed={filters.state.artist?.id === artist.id}
            onClick={() =>
              filters.selectArtist(filters.state.artist?.id === artist.id ? null : artist)
            }
          >
            {artist.name}
          </button>
        )}
      />
    </div>
  );
}
