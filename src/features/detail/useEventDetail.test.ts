import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeEvent } from "../../test/factories";
import { useEventDetail } from "./useEventDetail";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("useEventDetail", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given a successful fetch when the event loads then status becomes loaded", async () => {
    const event = makeEvent({ id: "event-1" });
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: event }));

    const { result } = renderHook(() => useEventDetail("event-1"));

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("loaded"));
    expect(result.current.event).toEqual(event);
  });

  it("given a 404 response when the event loads then status becomes not-found", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "not found" }, 404));

    const { result } = renderHook(() => useEventDetail("missing"));

    await waitFor(() => expect(result.current.status).toBe("not-found"));
    expect(result.current.event).toBeNull();
  });

  it("given a server error when the event loads then status becomes error and retry re-fetches", async () => {
    const event = makeEvent({ id: "event-1" });
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ message: "server error" }, 500))
      .mockResolvedValueOnce(jsonResponse({ data: event }));

    const { result } = renderHook(() => useEventDetail("event-1"));

    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe("loaded"));
    expect(result.current.event).toEqual(event);
  });
});
