import type { Event } from "../../types/event";

export interface MarkerFeatureProperties {
  eventId: string;
}

export interface MarkerPointFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: MarkerFeatureProperties;
}

export interface MarkerFeatureCollection {
  type: "FeatureCollection";
  features: MarkerPointFeature[];
}

// Pure GeoJSON construction, independently unit-testable without a real mapboxgl.Map instance.
// Events with missing/invalid venue coordinates are already excluded server-side
// (Event::hasVenueCoordinates), but this stays defensive rather than assuming that invariant.
export function buildMarkerFeatureCollection(events: Event[]): MarkerFeatureCollection {
  const features = events
    .filter((event) => event.venue.latitude !== null && event.venue.longitude !== null)
    .map((event) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [event.venue.longitude as number, event.venue.latitude as number] as [
          number,
          number,
        ],
      },
      properties: { eventId: event.id },
    }));

  return { type: "FeatureCollection", features };
}
