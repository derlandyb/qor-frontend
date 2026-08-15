import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeEvent } from "../test/factories";
import { fetchMapMarkers } from "./mapApi";

describe("fetchMapMarkers", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given no params when markers are fetched then GET /api/events/map is called with no query string", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));

    await fetchMapMarkers();

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain("/api/events/map");
    expect(String(url)).not.toContain("cursor");
    expect(String(url)).not.toContain("q=");
  });

  it("given filter params when markers are fetched then they are sent as query params", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));

    await fetchMapMarkers({
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

  it("given a successful response when markers are fetched then the data array is returned unwrapped", async () => {
    const event = makeEvent();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: [event] }), { status: 200 }),
    );

    const result = await fetchMapMarkers();

    expect(result).toEqual({ data: [event] });
  });

  it("given a failed response when markers are fetched then the error propagates", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({}), { status: 500 }));

    await expect(fetchMapMarkers()).rejects.toThrow();
  });
});
