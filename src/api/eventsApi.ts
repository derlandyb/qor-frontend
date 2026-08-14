import type { DateBucket } from "../types/filters";
import type { Event } from "../types/event";
import { ApiError, apiFetch } from "./httpClient";

export interface EventFeedPage {
  data: Event[];
  nextCursor: string | null;
}

export interface FetchEventFeedParams {
  cursor?: string;
  limit?: number;
  q?: string;
  dateBucket?: DateBucket;
  city?: string;
  genres?: string[];
  artistId?: string;
}

// Mirrors api/app/Http/Controllers/Api/EventController@index's { data, next_cursor } contract —
// the API's cursor field is snake_case; this is the one place that translates it to nextCursor
// so nothing downstream has to know about the wire format.
interface EventFeedResponse {
  data: Event[];
  next_cursor: string | null;
}

export async function fetchEventFeed(params: FetchEventFeedParams = {}): Promise<EventFeedPage> {
  const search = new URLSearchParams();
  if (params.cursor) search.set("cursor", params.cursor);
  search.set("limit", String(params.limit ?? 20));
  if (params.q) search.set("q", params.q);
  if (params.dateBucket) search.set("date_bucket", params.dateBucket);
  if (params.city) search.set("city", params.city);
  params.genres?.forEach((genre) => search.append("genres[]", genre));
  if (params.artistId) search.set("artist_id", params.artistId);

  const response = await apiFetch<EventFeedResponse>(`/api/events?${search.toString()}`);

  return { data: response.data, nextCursor: response.next_cursor };
}

export class EventNotFoundError extends Error {
  constructor(readonly eventId: string) {
    super(`Evento não encontrado: ${eventId}`);
  }
}

interface EventDetailResponse {
  data: Event;
}

export async function fetchEventDetail(id: string): Promise<Event> {
  try {
    const response = await apiFetch<EventDetailResponse>(`/api/events/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new EventNotFoundError(id);
    }
    throw error;
  }
}
