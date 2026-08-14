import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUrlSyncedFilters } from "./useUrlSyncedFilters";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function wrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
  };
}

describe("useUrlSyncedFilters", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        if (String(url).includes("filter-options"))
          return Promise.resolve(jsonResponse({ data: [] }));
        return Promise.resolve(jsonResponse({ data: [], next_cursor: null }));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given a URL with filter params when mounted then filter state is seeded from the URL", () => {
    const { result } = renderHook(() => useUrlSyncedFilters(), {
      wrapper: wrapper("/?date_bucket=fim_de_semana&city=Vit%C3%B3ria&genres=Rock,Samba&q=forro"),
    });

    expect(result.current.filters.state.dateBucket).toBe("fim_de_semana");
    expect(result.current.filters.state.city).toBe("Vitória");
    expect(result.current.filters.state.genres.has("Rock")).toBe(true);
    expect(result.current.filters.state.genres.has("Samba")).toBe(true);
    expect(result.current.search.query).toBe("forro");
  });

  it("given no URL params when mounted then filter state starts empty", () => {
    const { result } = renderHook(() => useUrlSyncedFilters(), { wrapper: wrapper("/") });

    expect(result.current.filters.state.dateBucket).toBeNull();
    expect(result.current.filters.state.city).toBeNull();
    expect(result.current.filters.state.genres.size).toBe(0);
    expect(result.current.search.query).toBe("");
  });

  it("given a URL with a comma-joined genres param when parsed then each genre is preserved individually", async () => {
    const { result } = renderHook(() => useUrlSyncedFilters(), {
      wrapper: wrapper("/?genres=Rock,MPB,Samba"),
    });

    await waitFor(() =>
      expect(Array.from(result.current.filters.state.genres).sort()).toEqual([
        "MPB",
        "Rock",
        "Samba",
      ]),
    );
  });
});
