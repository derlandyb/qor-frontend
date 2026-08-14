import { DateSectionHeader } from "./DateSectionHeader";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { EventCard } from "./EventCard";
import "./feed.css";
import { useEventFeed } from "./useEventFeed";

export function EventFeedPage() {
  const { groupedEvents, isLoadingInitial, isLoadingMore, error, endReached, sentinelRef, retry } =
    useEventFeed();

  if (isLoadingInitial) {
    return (
      <section className="feed" aria-labelledby="feed-heading">
        <h2 id="feed-heading" className="headline-lg feed__heading">
          O que tá rolando?
        </h2>
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
        <ErrorState onRetry={retry} />
      </section>
    );
  }

  return (
    <section className="feed" aria-labelledby="feed-heading">
      <h2 id="feed-heading" className="headline-lg feed__heading">
        O que tá rolando?
      </h2>

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
