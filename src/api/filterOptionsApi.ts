import type { ArtistOption } from "../types/filters";
import { apiFetch } from "./httpClient";

interface GenreOptionsResponse {
  data: string[];
}

interface ArtistOptionsResponse {
  data: ArtistOption[];
}

export async function getGenreOptions(): Promise<string[]> {
  const response = await apiFetch<GenreOptionsResponse>("/api/filter-options/genres");
  return response.data;
}

export async function getArtistOptions(): Promise<ArtistOption[]> {
  const response = await apiFetch<ArtistOptionsResponse>("/api/filter-options/artists");
  return response.data;
}
