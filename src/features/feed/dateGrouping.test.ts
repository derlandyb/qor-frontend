import { describe, expect, it, vi, afterEach } from "vitest";
import { makeEvent } from "../../test/factories";
import { groupEventsByDate } from "./dateGrouping";

describe("groupEventsByDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("given events on today and tomorrow when grouped then they are labelled Hoje and Amanhã", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-14T10:00:00-03:00"));

    const events = [
      makeEvent({ id: "1", startDateTime: "2026-08-14T22:00:00-03:00" }),
      makeEvent({ id: "2", startDateTime: "2026-08-15T19:00:00-03:00" }),
    ];

    const groups = groupEventsByDate(events);

    expect(groups.map((g) => g.label)).toEqual(["Hoje", "Amanhã"]);
  });

  it("given multiple events on the same date when grouped then they share one group in list order", () => {
    const events = [
      makeEvent({ id: "1", startDateTime: "2026-08-20T19:00:00-03:00" }),
      makeEvent({ id: "2", startDateTime: "2026-08-20T22:00:00-03:00" }),
    ];

    const groups = groupEventsByDate(events);

    expect(groups).toHaveLength(1);
    expect(groups[0].events.map((e) => e.id)).toEqual(["1", "2"]);
  });

  it("given an empty list when grouped then no groups are returned", () => {
    expect(groupEventsByDate([])).toEqual([]);
  });
});
