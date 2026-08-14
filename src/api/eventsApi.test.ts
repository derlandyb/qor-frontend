import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventNotFoundError, fetchEventDetail, fetchEventFeed } from "./eventsApi";
import { makeEvent } from "../test/factories";

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

    await fetchEventFeed({ cursor: "abc123", limit: 10 });

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

  it("given a search query when the feed is fetched then q is sent as a query param", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: [], next_cursor: null }), { status: 200 }),
    );

    await fetchEventFeed({ q: "forró" });

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain(`q=${encodeURIComponent("forró")}`);
  });

  it("given filter params when the feed is fetched then they are sent as query params", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: [], next_cursor: null }), { status: 200 }),
    );

    await fetchEventFeed({
      dateBucket: "fim_de_semana",
      city: "Vitória",
      genres: ["Rock", "Samba"],
      artistId: "artist-1",
    });

    const [url] = vi.mocked(fetch).mock.calls[0];
    const urlString = String(url);
    expect(urlString).toContain("date_bucket=fim_de_semana");
    expect(urlString).toContain(`city=${encodeURIComponent("Vitória")}`);
    expect(urlString).toContain("genres%5B%5D=Rock");
    expect(urlString).toContain("genres%5B%5D=Samba");
    expect(urlString).toContain("artist_id=artist-1");
  });
});

describe("fetchEventDetail", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given a successful response when an event is fetched then the data envelope is unwrapped", async () => {
    const event = makeEvent();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: event }), { status: 200 }),
    );

    const result = await fetchEventDetail(event.id);

    expect(result).toEqual(event);
  });

  it("given a 404 response when an event is fetched then EventNotFoundError is thrown", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Evento não encontrado." }), { status: 404 }),
    );

    await expect(fetchEventDetail("missing")).rejects.toBeInstanceOf(EventNotFoundError);
  });

  it("given a server error when an event is fetched then the original error propagates", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({}), { status: 500 }));

    await expect(fetchEventDetail("event-1")).rejects.not.toBeInstanceOf(EventNotFoundError);
  });
});
