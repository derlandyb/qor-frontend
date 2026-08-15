import { describe, expect, it } from "vitest";
import { makeEvent, makeVenue } from "../../test/factories";
import { buildMarkerFeatureCollection } from "./geojson";

describe("buildMarkerFeatureCollection", () => {
  it("given events with valid coordinates when built then each becomes a Point feature carrying the event id", () => {
    const event = makeEvent({ id: "e1", venue: makeVenue({ latitude: -20.3, longitude: -40.3 }) });

    const collection = buildMarkerFeatureCollection([event]);

    expect(collection.type).toBe("FeatureCollection");
    expect(collection.features).toHaveLength(1);
    expect(collection.features[0]).toMatchObject({
      type: "Feature",
      geometry: { type: "Point", coordinates: [-40.3, -20.3] },
      properties: { eventId: "e1" },
    });
  });

  it("given an event with null coordinates when built then it is omitted", () => {
    const event = makeEvent({ venue: makeVenue({ latitude: null, longitude: null }) });

    const collection = buildMarkerFeatureCollection([event]);

    expect(collection.features).toHaveLength(0);
  });
});
