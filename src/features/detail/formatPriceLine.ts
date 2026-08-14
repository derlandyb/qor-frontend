import type { Price } from "../../types/event";

// TS port of event-details/design.md's PriceLineFormatter (TICKET-002) — four cases, one place.
export function formatPriceLine(price: Price | null): string {
  if (price === null) return "Preço não informado";
  if (price.isFree) return "Gratuito";
  const lowest = price.min ?? price.max;
  if (lowest === null) return "Preço não informado";
  return `A partir de R$ ${lowest.toFixed(0)}`;
}
