import type { DateBucket } from "../types/filters";
import type { Event } from "../types/event";
import { apiFetch } from "./httpClient";

export interface FetchMapMarkersParams {
  dateBucket?: DateBucket;
  city?: string;
  genres?: string[];
  artistId?: string;
}

export interface MapMarkersResponse {
  data: Event[];
}

// GET /api/events/map, mirroring api/app/Http/Controllers/Api/MapController@index — reuses
// filters' date_bucket/city/genres[]/artist_id params verbatim, but deliberately excludes q
// (map/spec.md's Out of Scope) and cursor/limit (map's endpoint is unpaginated, see
// map/design.md's Tech Decisions — pagination would corrupt clustering counts).
export async function fetchMapMarkers(
  params: FetchMapMarkersParams = {},
): Promise<MapMarkersResponse> {
  const search = new URLSearchParams();
  if (params.dateBucket) search.set("date_bucket", params.dateBucket);
  if (params.city) search.set("city", params.city);
  params.genres?.forEach((genre) => search.append("genres[]", genre));
  if (params.artistId) search.set("artist_id", params.artistId);

  const query = search.toString();
  return apiFetch<MapMarkersResponse>(`/api/events/map${query ? `?${query}` : ""}`);
}
