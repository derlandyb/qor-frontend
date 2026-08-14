import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getArtistOptions, getGenreOptions } from "./filterOptionsApi";

describe("filterOptionsApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given a successful response when genre options are fetched then the data array is returned", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: ["Rock", "Samba"] }), { status: 200 }),
    );

    const genres = await getGenreOptions();

    expect(genres).toEqual(["Rock", "Samba"]);
  });

  it("given a successful response when artist options are fetched then the data array is returned", async () => {
    const artists = [{ id: "a1", name: "Jorge & Mateus" }];
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: artists }), { status: 200 }),
    );

    const result = await getArtistOptions();

    expect(result).toEqual(artists);
  });
});
