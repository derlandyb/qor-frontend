import { useCallback, useEffect, useState } from "react";
import { EventNotFoundError, fetchEventDetail } from "../../api/eventsApi";
import type { Event } from "../../types/event";

export type EventDetailStatus = "loading" | "loaded" | "not-found" | "error";

interface UseEventDetailResult {
  status: EventDetailStatus;
  event: Event | null;
  retry: () => void;
}

// Single-fetch, not paginated — mirrors useEventFeed's effect/retry shape without the
// infinite-scroll machinery event-feed needed. Not-found is terminal (DETAIL-009): retry only
// re-fetches on a network/server error, never on a confirmed-missing id.
export function useEventDetail(eventId: string): UseEventDetailResult {
  const [status, setStatus] = useState<EventDetailStatus>("loading");
  const [event, setEvent] = useState<Event | null>(null);

  const load = useCallback(() => {
    setStatus("loading");
    fetchEventDetail(eventId)
      .then((result) => {
        setEvent(result);
        setStatus("loaded");
      })
      .catch((error: unknown) => {
        setStatus(error instanceof EventNotFoundError ? "not-found" : "error");
      });
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  return { status, event, retry: load };
}
