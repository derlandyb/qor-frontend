import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GenreArtistPanel } from "./GenreArtistPanel";
import { useFilters } from "./useFilters";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function Harness() {
  const filters = useFilters();
  return <GenreArtistPanel filters={filters} />;
}

describe("GenreArtistPanel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given loaded genre and artist options when rendered then pills are shown for each", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        if (String(url).includes("genres"))
          return Promise.resolve(jsonResponse({ data: ["Rock", "Samba"] }));
        return Promise.resolve(jsonResponse({ data: [{ id: "a1", name: "Jorge & Mateus" }] }));
      }),
    );

    render(<Harness />);

    expect(await screen.findByRole("button", { name: "Rock" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jorge & Mateus" })).toBeInTheDocument();
  });

  it("given a genre pill when clicked twice then it toggles selection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        if (String(url).includes("genres"))
          return Promise.resolve(jsonResponse({ data: ["Rock"] }));
        return Promise.resolve(jsonResponse({ data: [] }));
      }),
    );

    render(<Harness />);

    const rockPill = await screen.findByRole("button", { name: "Rock" });
    await userEvent.click(rockPill);
    expect(rockPill).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(rockPill);
    expect(rockPill).toHaveAttribute("aria-pressed", "false");
  });

  it("given an empty genre option list when loaded then a disabled nada para filtrar message is shown", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        if (String(url).includes("genres")) return Promise.resolve(jsonResponse({ data: [] }));
        return Promise.resolve(jsonResponse({ data: [] }));
      }),
    );

    render(<Harness />);

    await waitFor(() => expect(screen.getAllByText(/nada para filtrar ainda/i)).toHaveLength(2));
  });

  it("given the genre options fetch fails when loaded then an inline error is shown", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        if (String(url).includes("genres")) return Promise.resolve(jsonResponse({}, 500));
        return Promise.resolve(jsonResponse({ data: [] }));
      }),
    );

    render(<Harness />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/não foi possível carregar/i);
  });
});
