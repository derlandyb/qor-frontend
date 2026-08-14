import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilterBar } from "./FilterBar";
import { useFilters } from "./useFilters";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function Harness() {
  const filters = useFilters();
  return <FilterBar filters={filters} />;
}

describe("FilterBar", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        if (String(url).includes("genres"))
          return Promise.resolve(jsonResponse({ data: ["Rock"] }));
        return Promise.resolve(jsonResponse({ data: [{ id: "a1", name: "Jorge & Mateus" }] }));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given date and city preset chips when rendered then they are shown", () => {
    render(<Harness />);

    expect(screen.getByRole("button", { name: "Hoje" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vitória" })).toBeInTheDocument();
  });

  it("given the Filtros toggle when clicked then the genre/artist panel expands", async () => {
    render(<Harness />);

    expect(screen.queryByText(/gênero/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /filtros/i }));

    expect(await screen.findByText(/gênero/i)).toBeInTheDocument();
  });

  it("given the Filtros toggle when rendered then aria-controls references the expandable panel's id", async () => {
    render(<Harness />);

    const toggle = screen.getByRole("button", { name: /filtros/i });
    const controlsId = toggle.getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();

    await userEvent.click(toggle);

    expect(document.getElementById(controlsId!)).not.toBeNull();
  });

  it("given a date chip is already selected when clicked again then it deselects (single-select replace)", async () => {
    render(<Harness />);

    const hojeButton = screen.getByRole("button", { name: "Hoje" });
    await userEvent.click(hojeButton);
    expect(hojeButton).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(hojeButton);
    expect(hojeButton).toHaveAttribute("aria-pressed", "false");
  });
});
