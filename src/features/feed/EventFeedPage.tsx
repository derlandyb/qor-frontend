import { ActiveFilterChips } from "../filters/ActiveFilterChips";
import { FilterBar } from "../filters/FilterBar";
import { formatActiveFiltersSummary } from "../filters/filterChipLabel";
import { useFilteredFeed } from "../filters/useFilteredFeed";
import { useUrlSyncedFilters } from "../filters/useUrlSyncedFilters";
import { SearchBar } from "../search/SearchBar";
import { DateSectionHeader } from "./DateSectionHeader";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { EventCard } from "./EventCard";
import "../filters/filters.css";
import "../search/search.css";
import "./feed.css";
import { useEventFeed } from "./useEventFeed";

export function EventFeedPage() {
  const { search, filters } = useUrlSyncedFilters();
  const { state: filteredFeedState, retry: retryFilteredFeed } = useFilteredFeed(search, filters);

  // Called unconditionally (hooks rule) — its infinite-scroll fetch keeps running harmlessly
  // in the background even while a filtered/searched view is showing, so clearing search and
  // filters snaps straight back to its exact, never-touched, already-loaded state.
  const { groupedEvents, isLoadingInitial, isLoadingMore, error, endReached, sentinelRef, retry } =
    useEventFeed();

  const handleClearAll = () => {
    filters.clearAll();
    search.setQuery("");
  };

  const searchAndFilters = (
    <>
      <SearchBar
        value={search.query}
        onChange={search.setQuery}
        onClear={() => search.setQuery("")}
      />
      <FilterBar filters={filters} />
      <ActiveFilterChips
        chips={filters.asChips()}
        onRemove={filters.removeChip}
        onClearAll={handleClearAll}
      />
    </>
  );

  if (filteredFeedState.status !== "inactive") {
    return (
      <section className="feed" aria-labelledby="feed-heading">
        <h2 id="feed-heading" className="headline-lg feed__heading">
          O que tá rolando?
        </h2>
        {searchAndFilters}

        {filteredFeedState.status === "loading" && <p role="status">Carregando eventos…</p>}

        {filteredFeedState.status === "no-results" && (
          <div className="feed-state" role="status">
            <p className="body-lg">
              Nenhum evento encontrado para{" "}
              {formatActiveFiltersSummary(filteredFeedState.chips, filteredFeedState.q)}.
            </p>
            <button type="button" className="feed-state__retry" onClick={handleClearAll}>
              Limpar filtros
            </button>
          </div>
        )}

        {filteredFeedState.status === "error" && <ErrorState onRetry={retryFilteredFeed} />}

        {filteredFeedState.status === "results" && (
          <ul className="card-list" role="list">
            {filteredFeedState.events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (isLoadingInitial) {
    return (
      <section className="feed" aria-labelledby="feed-heading">
        <h2 id="feed-heading" className="headline-lg feed__heading">
          O que tá rolando?
        </h2>
        {searchAndFilters}
        <p role="status">Carregando eventos…</p>
      </section>
    );
  }

  if (error === "initial") {
    return (
      <section className="feed" aria-labelledby="feed-heading">
        <h2 id="feed-heading" className="headline-lg feed__heading">
          O que tá rolando?
        </h2>
        {searchAndFilters}
        <ErrorState onRetry={retry} />
      </section>
    );
  }

  return (
    <section className="feed" aria-labelledby="feed-heading">
      <h2 id="feed-heading" className="headline-lg feed__heading">
        O que tá rolando?
      </h2>
      {searchAndFilters}

      {groupedEvents.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {groupedEvents.map((group) => (
            <div className="date-group" key={group.dateKey}>
              <DateSectionHeader label={group.label} />
              <ul className="card-list" role="list">
                {group.events.map((event) => (
                  <li key={event.id}>
                    <EventCard event={event} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {error === "inline" && <ErrorState onRetry={retry} inline />}
          {isLoadingMore && <p role="status">Carregando mais eventos…</p>}
          {!endReached && !error && <div className="feed-sentinel" ref={sentinelRef} />}
        </>
      )}
    </section>
  );
}
