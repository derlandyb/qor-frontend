import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFilters } from "./useFilters";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("useFilters", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        if (String(url).includes("genres"))
          return Promise.resolve(jsonResponse({ data: ["Rock", "Samba"] }));
        return Promise.resolve(jsonResponse({ data: [{ id: "a1", name: "Jorge & Mateus" }] }));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given mount when option lists load then both resolve to loaded", async () => {
    const { result } = renderHook(() => useFilters());

    await waitFor(() => expect(result.current.genreOptions.status).toBe("loaded"));
    await waitFor(() => expect(result.current.artistOptions.status).toBe("loaded"));
  });

  it("given toggleGenre when called twice for the same genre then it adds then removes", () => {
    const { result } = renderHook(() => useFilters());

    act(() => result.current.toggleGenre("Rock"));
    expect(result.current.state.genres.has("Rock")).toBe(true);

    act(() => result.current.toggleGenre("Rock"));
    expect(result.current.state.genres.has("Rock")).toBe(false);
  });

  it("given selectCity called twice when replaced then only the latest value is kept", () => {
    const { result } = renderHook(() => useFilters());

    act(() => result.current.selectCity("Vitória"));
    act(() => result.current.selectCity("Serra"));

    expect(result.current.state.city).toBe("Serra");
  });

  it("given removeChip for one type when called then only that type clears", () => {
    const { result } = renderHook(() => useFilters());

    act(() => result.current.selectCity("Vitória"));
    act(() => result.current.selectDateBucket("hoje"));
    act(() => result.current.removeChip({ type: "city", city: "Vitória" }));

    expect(result.current.state.city).toBeNull();
    expect(result.current.state.dateBucket).toBe("hoje");
  });

  it("given clearAll when called then every filter resets", () => {
    const { result } = renderHook(() => useFilters());

    act(() => result.current.selectCity("Vitória"));
    act(() => result.current.toggleGenre("Rock"));
    act(() => result.current.clearAll());

    expect(result.current.state.city).toBeNull();
    expect(result.current.state.genres.size).toBe(0);
  });

  it("given multiple active filters when asChips is called then genres collapse to one chip", () => {
    const { result } = renderHook(() => useFilters());

    act(() => result.current.toggleGenre("Rock"));
    act(() => result.current.toggleGenre("Samba"));
    act(() => result.current.selectCity("Vitória"));

    const chips = result.current.asChips();
    expect(chips).toHaveLength(2);
    expect(chips.find((c) => c.type === "genre")).toBeDefined();
  });

  it("given the genre options fetch fails when loaded then genreOptions becomes an error state", async () => {
    vi.mocked(fetch).mockReset();
    vi.mocked(fetch).mockImplementation((url: RequestInfo | URL) => {
      if (String(url).includes("genres")) return Promise.resolve(jsonResponse({}, 500));
      return Promise.resolve(jsonResponse({ data: [] }));
    });

    const { result } = renderHook(() => useFilters());

    await waitFor(() => expect(result.current.genreOptions.status).toBe("error"));
  });
});
