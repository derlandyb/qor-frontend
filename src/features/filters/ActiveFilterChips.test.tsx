import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActiveFilterChips } from "./ActiveFilterChips";
import type { FilterChip } from "./useFilters";

describe("ActiveFilterChips", () => {
  it("given no active chips when rendered then nothing is shown", () => {
    const { container } = render(
      <ActiveFilterChips chips={[]} onRemove={vi.fn()} onClearAll={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("given active chips when a chip's remove button is clicked then onRemove fires with that chip", async () => {
    const onRemove = vi.fn();
    const chips: FilterChip[] = [{ type: "city", city: "Vitória" }];
    render(<ActiveFilterChips chips={chips} onRemove={onRemove} onClearAll={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /remover filtro vitória/i }));

    expect(onRemove).toHaveBeenCalledWith(chips[0]);
  });

  it("given active chips when Limpar filtros is clicked then onClearAll fires", async () => {
    const onClearAll = vi.fn();
    const chips: FilterChip[] = [{ type: "city", city: "Vitória" }];
    render(<ActiveFilterChips chips={chips} onRemove={vi.fn()} onClearAll={onClearAll} />);

    await userEvent.click(screen.getByRole("button", { name: /limpar filtros/i }));

    expect(onClearAll).toHaveBeenCalled();
  });

  it("given multiple selected genres when rendered as a chip then it collapses to a single chip with a count", () => {
    const chips: FilterChip[] = [{ type: "genre", genres: new Set(["Rock", "Samba"]) }];
    render(<ActiveFilterChips chips={chips} onRemove={vi.fn()} onClearAll={vi.fn()} />);

    expect(screen.getByText(/gêneros \(2\)/i)).toBeInTheDocument();
  });
});
