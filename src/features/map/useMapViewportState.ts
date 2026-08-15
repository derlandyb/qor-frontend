import { useCallback, useState } from "react";
import type { Event } from "../../types/event";

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type ViewportState =
  | { status: "normal"; visibleMarkers: Event[] }
  | { status: "empty_viewport" }
  | { status: "no_filter_results"; canClear: true };

function isWithinBounds(event: Event, bounds: Bounds): boolean {
  const { latitude, longitude } = event.venue;
  if (latitude === null || longitude === null) return false;
  return (
    latitude <= bounds.north &&
    latitude >= bounds.south &&
    longitude <= bounds.east &&
    longitude >= bounds.west
  );
}

// Pure state-derivation mirroring Mobile's viewport/empty-state logic (Compose derivedStateOf /
// SwiftUI region-change handler, per map/design.md's consolidated Testing Strategy) — this is
// the layer's equivalent unit-testable surface, since actual marker/cluster geometry is Mapbox's
// own internals (Supercluster), not app code.
//
// bounds === null means the map hasn't reported a viewport yet (cold load, before the first
// `moveend`) — treat every marker as visible rather than flashing an empty state on mount.
export function deriveViewportState(
  markers: Event[],
  hasActiveFilters: boolean,
  bounds: Bounds | null,
): ViewportState {
  if (markers.length === 0) {
    return hasActiveFilters ? { status: "no_filter_results", canClear: true } : { status: "empty_viewport" };
  }

  if (bounds === null) {
    return { status: "normal", visibleMarkers: markers };
  }

  const visibleMarkers = markers.filter((event) => isWithinBounds(event, bounds));
  if (visibleMarkers.length === 0) {
    return { status: "empty_viewport" };
  }

  return { status: "normal", visibleMarkers };
}

export interface UseMapViewportStateResult {
  bounds: Bounds | null;
  setBounds: (bounds: Bounds) => void;
  state: (markers: Event[], hasActiveFilters: boolean) => ViewportState;
}

// Thin stateful wrapper around deriveViewportState — MapPage calls setBounds on the map's
// moveend event; the pure derivation above stays independently unit-testable without a Mapbox
// instance.
export function useMapViewportState(): UseMapViewportStateResult {
  const [bounds, setBoundsState] = useState<Bounds | null>(null);

  const setBounds = useCallback((next: Bounds) => setBoundsState(next), []);
  const state = useCallback(
    (markers: Event[], hasActiveFilters: boolean) =>
      deriveViewportState(markers, hasActiveFilters, bounds),
    [bounds],
  );

  return { bounds, setBounds, state };
}
