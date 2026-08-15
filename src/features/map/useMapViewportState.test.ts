import { describe, expect, it } from "vitest";
import { makeEvent, makeVenue } from "../../test/factories";
import { deriveViewportState, type Bounds } from "./useMapViewportState";

const GRANDE_VITORIA_BOUNDS: Bounds = { north: -19.9, south: -20.5, east: -40.1, west: -40.5 };
const OUTSIDE_BOUNDS: Bounds = { north: 10, south: 5, east: 10, west: 5 };

function markerAt(lat: number, lng: number) {
  return makeEvent({ venue: makeVenue({ latitude: lat, longitude: lng }) });
}

describe("deriveViewportState", () => {
  it("given markers inside the viewport when derived then it returns normal with the visible markers", () => {
    const inside = markerAt(-20.3, -40.3);
    const result = deriveViewportState([inside], false, GRANDE_VITORIA_BOUNDS);

    expect(result).toEqual({ status: "normal", visibleMarkers: [inside] });
  });

  it("given markers that exist but none fall in the current viewport when derived then it returns empty_viewport", () => {
    const farAway = markerAt(-20.3, -40.3);
    const result = deriveViewportState([farAway], false, OUTSIDE_BOUNDS);

    expect(result).toEqual({ status: "empty_viewport" });
  });

  it("given zero markers overall and active filters when derived then it returns no_filter_results with canClear", () => {
    const result = deriveViewportState([], true, GRANDE_VITORIA_BOUNDS);

    expect(result).toEqual({ status: "no_filter_results", canClear: true });
  });

  it("given zero markers overall and no active filters when derived then it returns empty_viewport", () => {
    const result = deriveViewportState([], false, GRANDE_VITORIA_BOUNDS);

    expect(result).toEqual({ status: "empty_viewport" });
  });

  it("given bounds not yet known (map still initializing) when derived then it returns normal with all markers", () => {
    const marker = markerAt(-20.3, -40.3);
    const result = deriveViewportState([marker], false, null);

    expect(result).toEqual({ status: "normal", visibleMarkers: [marker] });
  });

  it("given a marker with null coordinates when derived then it is excluded from the visible set", () => {
    const noCoords = makeEvent({ venue: makeVenue({ latitude: null, longitude: null }) });
    const result = deriveViewportState([noCoords], false, GRANDE_VITORIA_BOUNDS);

    expect(result).toEqual({ status: "empty_viewport" });
  });
});
