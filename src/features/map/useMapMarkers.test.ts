import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeEvent } from "../../test/factories";
import { emptyFilterState } from "../../types/filters";
import type { UseFiltersResult } from "../filters/useFilters";
import { useMapMarkers } from "./useMapMarkers";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function makeFilters(overrides: Partial<UseFiltersResult> = {}): UseFiltersResult {
  return {
    state: emptyFilterState,
    genreOptions: { status: "loaded", options: [] },
    artistOptions: { status: "loaded", options: [] },
    selectDateBucket: vi.fn(),
    selectCity: vi.fn(),
    toggleGenre: vi.fn(),
    selectArtist: vi.fn(),
    removeChip: vi.fn(),
    clearAll: vi.fn(),
    asChips: () => [],
    reload: vi.fn(),
    ...overrides,
  };
}

describe("useMapMarkers", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given mount when markers load then state transitions from loading to loaded", async () => {
    const event = makeEvent();
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: [event] }));

    const { result } = renderHook(() => useMapMarkers(makeFilters()));

    expect(result.current.state.status).toBe("loading");

    await waitFor(() => expect(result.current.state.status).toBe("loaded"));
    expect(result.current.state).toMatchObject({ status: "loaded", markers: [event] });
  });

  it("given a failed request when markers are fetched then state transitions to error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useMapMarkers(makeFilters()));

    await waitFor(() => expect(result.current.state.status).toBe("error"));
  });

  it("given a filter state change when markers are already loaded then it re-fetches exactly once", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: [] }));

    const { result, rerender } = renderHook(({ filters }) => useMapMarkers(filters), {
      initialProps: { filters: makeFilters() },
    });

    await waitFor(() => expect(result.current.state.status).toBe("loaded"));
    expect(fetch).toHaveBeenCalledTimes(1);

    rerender({ filters: makeFilters({ state: { ...emptyFilterState, city: "Vitória" } }) });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const [url] = vi.mocked(fetch).mock.calls[1];
    expect(String(url)).toContain(`city=${encodeURIComponent("Vitória")}`);
  });

  it("given the same filter state across re-renders when nothing changed then it does not re-fetch", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: [] }));

    const filters = makeFilters();
    const { result, rerender } = renderHook(({ f }) => useMapMarkers(f), {
      initialProps: { f: filters },
    });

    await waitFor(() => expect(result.current.state.status).toBe("loaded"));
    expect(fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      rerender({ f: filters });
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
