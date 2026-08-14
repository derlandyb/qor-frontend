import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ data: [], next_cursor: null }), { status: 200 }),
        ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given a visitor when opening the app then the feed route renders", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: /o que tá rolando\?/i })).toBeInTheDocument();
  });

  it("given a visitor when opening the app then the primary nav is present", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("link", { name: /início/i }).length).toBeGreaterThan(0);
  });
});
