import type { Event } from "../types/event";
import { apiFetch } from "./httpClient";

export interface EventFeedPage {
  data: Event[];
  nextCursor: string | null;
}

// Mirrors api/app/Http/Controllers/Api/EventController@index's { data, next_cursor } contract —
// the API's cursor field is snake_case; this is the one place that translates it to nextCursor
// so nothing downstream has to know about the wire format.
interface EventFeedResponse {
  data: Event[];
  next_cursor: string | null;
}

export async function fetchEventFeed(cursor?: string, limit = 20): Promise<EventFeedPage> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", String(limit));

  const response = await apiFetch<EventFeedResponse>(`/api/events?${params.toString()}`);

  return { data: response.data, nextCursor: response.next_cursor };
}
