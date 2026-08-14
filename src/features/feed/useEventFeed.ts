import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchEventFeed } from "../../api/eventsApi";
import type { Event } from "../../types/event";
import { groupEventsByDate, type DateGroup } from "./dateGrouping";

export type FeedError = "initial" | "inline";

interface UseEventFeedResult {
  groupedEvents: DateGroup[];
  isLoadingInitial: boolean;
  isLoadingMore: boolean;
  error: FeedError | null;
  endReached: boolean;
  sentinelRef: (node: HTMLDivElement | null) => void;
  retry: () => void;
}

export function useEventFeed(): UseEventFeedResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<FeedError | null>(null);
  const [endReached, setEndReached] = useState(false);

  const cursorRef = useRef<string | undefined>(undefined);
  const isFetchingRef = useRef(false);

  const loadPage = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const isInitial = cursorRef.current === undefined;
    if (isInitial) {
      setIsLoadingInitial(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const page = await fetchEventFeed({ cursor: cursorRef.current });
      setEvents((current) => (isInitial ? page.data : [...current, ...page.data]));
      cursorRef.current = page.nextCursor ?? undefined;
      setEndReached(page.nextCursor === null);
    } catch {
      setError(isInitial ? "initial" : "inline");
    } finally {
      isFetchingRef.current = false;
      setIsLoadingInitial(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPage();
    // Runs once on mount — loadPage's own identity is stable (useCallback, no deps).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Callback ref (not a plain useRef + useEffect pair) so the observer attaches/detaches
  // correctly even as the sentinel element mounts/unmounts across renders (e.g. it disappears
  // once endReached flips true).
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && !endReached && !isFetchingRef.current) {
          void loadPage();
        }
      });
      observerRef.current.observe(node);
    },
    [endReached, loadPage],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const groupedEvents = useMemo(() => groupEventsByDate(events), [events]);

  const retry = useCallback(() => {
    if (error === "initial") {
      cursorRef.current = undefined;
      setEvents([]);
    }
    void loadPage();
  }, [error, loadPage]);

  return { groupedEvents, isLoadingInitial, isLoadingMore, error, endReached, sentinelRef, retry };
}
