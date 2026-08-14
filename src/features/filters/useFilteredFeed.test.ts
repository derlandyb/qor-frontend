import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedSearch } from "../search/useDebouncedSearch";
import { useFilters } from "./useFilters";
import { useFilteredFeed } from "./useFilteredFeed";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function useCombined() {
  const search = useDebouncedSearch();
  const filters = useFilters();
  const filteredFeed = useFilteredFeed(search, filters);
  return { search, filters, filteredFeed };
}

// Real timers throughout (not fake) — @testing-library's waitFor polls via setTimeout
// internally and hangs against fake timers unless every advance is manually driven, which
// would make these tests brittle. A real 300ms wait is cheap enough for a unit suite.
function waitOutDebounce() {
  return act(() => new Promise((resolve) => setTimeout(resolve, 320)));
}

describe("useFilteredFeed", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes("filter-options/genres")) return Promise.resolve(jsonResponse({ data: [] }));
        if (u.includes("filter-options/artists"))
          return Promise.resolve(jsonResponse({ data: [] }));
        return Promise.resolve(jsonResponse({ data: [], next_cursor: null }));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given no search or filters when rendered then state is inactive", () => {
    const { result } = renderHook(() => useCombined());

    expect(result.current.filteredFeed.state).toEqual({ status: "inactive" });
  });

  it("given a debounced query when it resolves then results are fetched", async () => {
    vi.mocked(fetch).mockImplementation((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
      return Promise.resolve(
        jsonResponse({ data: [{ id: "1", title: "Rock Night" }], next_cursor: null }),
      );
    });

    const { result } = renderHook(() => useCombined());

    act(() => result.current.search.setQuery("rock"));
    await waitOutDebounce();

    await waitFor(() => expect(result.current.filteredFeed.state.status).toBe("results"));
  });

  it("given a query with zero matches when resolved then state is no-results and carries the query", async () => {
    const { result } = renderHook(() => useCombined());

    act(() => result.current.search.setQuery("zzzz"));
    await waitOutDebounce();

    await waitFor(() => expect(result.current.filteredFeed.state.status).toBe("no-results"));
    const state = result.current.filteredFeed.state;
    if (state.status !== "no-results") throw new Error("expected no-results state");
    expect(state.q).toBe("zzzz");
    expect(state.chips).toEqual([]);
  });

  it("given zero matches for an active filter selection when resolved then no-results carries the active chips", async () => {
    vi.mocked(fetch).mockImplementation((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
      return Promise.resolve(jsonResponse({ data: [], next_cursor: null }));
    });

    const { result } = renderHook(() => useCombined());

    act(() => result.current.filters.selectCity("Vitória"));

    await waitFor(() => expect(result.current.filteredFeed.state.status).toBe("no-results"));
    const state = result.current.filteredFeed.state;
    if (state.status !== "no-results") throw new Error("expected no-results state");
    expect(state.chips).toEqual([{ type: "city", city: "Vitória" }]);
  });

  it("given a fetch failure when it rejects then state is error", async () => {
    vi.mocked(fetch).mockImplementation((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
      return Promise.reject(new Error("network down"));
    });

    const { result } = renderHook(() => useCombined());

    act(() => result.current.search.setQuery("rock"));
    await waitOutDebounce();

    await waitFor(() => expect(result.current.filteredFeed.state.status).toBe("error"));
  });

  it("given only a filter selection (no search) when applied then results are fetched", async () => {
    vi.mocked(fetch).mockImplementation((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
      return Promise.resolve(jsonResponse({ data: [{ id: "1" }], next_cursor: null }));
    });

    const { result } = renderHook(() => useCombined());

    act(() => result.current.filters.selectCity("Vitória"));

    await waitFor(() => expect(result.current.filteredFeed.state.status).toBe("results"));
  });

  it("given the events endpoint is called when a genre selection changes then it fires exactly once per distinct genre set, not per render", async () => {
    const eventsCalls: string[] = [];
    vi.mocked(fetch).mockImplementation((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
      eventsCalls.push(u);
      return Promise.resolve(jsonResponse({ data: [{ id: "1" }], next_cursor: null }));
    });

    const { result, rerender } = renderHook(() => useCombined());

    act(() => result.current.filters.toggleGenre("Rock"));
    await waitFor(() => expect(result.current.filteredFeed.state.status).toBe("results"));

    const callsAfterFirstToggle = eventsCalls.length;

    // Re-rendering without changing selection must not trigger another fetch.
    rerender();
    rerender();

    expect(eventsCalls.length).toBe(callsAfterFirstToggle);
  });
});
