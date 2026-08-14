import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeEvent } from "../../test/factories";
import { useEventFeed } from "./useEventFeed";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("useEventFeed", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given a successful initial fetch when the feed loads then events are grouped and loading clears", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ data: [makeEvent({ id: "1" })], next_cursor: null }),
    );

    const { result } = renderHook(() => useEventFeed());

    expect(result.current.isLoadingInitial).toBe(true);

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false));

    expect(result.current.groupedEvents).toHaveLength(1);
    expect(result.current.endReached).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("given a failed initial fetch when the feed loads then an initial error is set", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useEventFeed());

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false));

    expect(result.current.error).toBe("initial");
    expect(result.current.groupedEvents).toEqual([]);
  });

  it("given retry after an initial error when called then it refetches from the start", async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(jsonResponse({ data: [makeEvent({ id: "1" })], next_cursor: null }));

    const { result } = renderHook(() => useEventFeed());

    await waitFor(() => expect(result.current.error).toBe("initial"));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.groupedEvents).toHaveLength(1);
  });

  it("given a page with a next cursor when the feed loads then endReached is false", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ data: [makeEvent({ id: "1" })], next_cursor: "cursor-2" }),
    );

    const { result } = renderHook(() => useEventFeed());

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false));

    expect(result.current.endReached).toBe(false);
  });
});
