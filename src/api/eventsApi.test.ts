import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchEventFeed } from "./eventsApi";

describe("fetchEventFeed", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given a successful response when the feed is fetched then next_cursor is mapped to nextCursor", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: [], next_cursor: "abc123" }), { status: 200 }),
    );

    const page = await fetchEventFeed();

    expect(page).toEqual({ data: [], nextCursor: "abc123" });
  });

  it("given a cursor when the feed is fetched then it is sent as a query param", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: [], next_cursor: null }), { status: 200 }),
    );

    await fetchEventFeed("abc123", 10);

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain("cursor=abc123");
    expect(String(url)).toContain("limit=10");
  });

  it("given no further pages when the feed is fetched then nextCursor is null", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: [], next_cursor: null }), { status: 200 }),
    );

    const page = await fetchEventFeed();

    expect(page.nextCursor).toBeNull();
  });
});
