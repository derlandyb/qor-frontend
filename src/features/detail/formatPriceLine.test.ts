import { describe, expect, it } from "vitest";
import { formatPriceLine } from "./formatPriceLine";

describe("formatPriceLine", () => {
  it("given no price when formatted then it reads Preço não informado", () => {
    expect(formatPriceLine(null)).toBe("Preço não informado");
  });

  it("given a free event when formatted then it reads Gratuito", () => {
    expect(formatPriceLine({ isFree: true, min: null, max: null, currency: "BRL" })).toBe(
      "Gratuito",
    );
  });

  it("given a single price when formatted then it reads A partir de R$", () => {
    expect(formatPriceLine({ isFree: false, min: 40, max: 40, currency: "BRL" })).toBe(
      "A partir de R$ 40",
    );
  });

  it("given a multi-tier price when formatted then it uses the lowest tier", () => {
    expect(formatPriceLine({ isFree: false, min: 30, max: 80, currency: "BRL" })).toBe(
      "A partir de R$ 30",
    );
  });

  it("given no min but a max when formatted then it falls back to max", () => {
    expect(formatPriceLine({ isFree: false, min: null, max: 50, currency: "BRL" })).toBe(
      "A partir de R$ 50",
    );
  });

  it("given a priced non-free event with no min or max when formatted then it reads Preço não informado", () => {
    expect(formatPriceLine({ isFree: false, min: null, max: null, currency: "BRL" })).toBe(
      "Preço não informado",
    );
  });
});
