import { describe, expect, it } from "vitest";
import { chipLabel, formatActiveFiltersSummary } from "./filterChipLabel";
import type { FilterChip } from "./useFilters";

describe("chipLabel", () => {
  it("given a date chip when labeled then it uses the bucket's display label", () => {
    expect(chipLabel({ type: "date", bucket: "fim_de_semana" })).toBe("Este fim de semana");
  });

  it("given a genre chip when labeled then it shows a count", () => {
    expect(chipLabel({ type: "genre", genres: new Set(["Rock", "Samba"]) })).toBe("Gêneros (2)");
  });
});

describe("formatActiveFiltersSummary", () => {
  it("given no active chips or query when formatted then it falls back to a generic phrase", () => {
    expect(formatActiveFiltersSummary([], "")).toBe("esses filtros");
  });

  it("given only a search query when formatted then it quotes the query", () => {
    expect(formatActiveFiltersSummary([], "zzzz")).toBe('"zzzz"');
  });

  it("given a single active filter when formatted then it names just that filter", () => {
    const chips: FilterChip[] = [{ type: "city", city: "Vitória" }];
    expect(formatActiveFiltersSummary(chips, "")).toBe("Vitória");
  });

  it("given multiple active filters and a query when formatted then it joins them with e", () => {
    const chips: FilterChip[] = [
      { type: "city", city: "Vitória" },
      { type: "date", bucket: "hoje" },
    ];
    expect(formatActiveFiltersSummary(chips, "rock")).toBe('"rock", Vitória e Hoje');
  });
});
