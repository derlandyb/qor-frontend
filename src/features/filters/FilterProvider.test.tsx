import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilterProvider, useFilterContext } from "./FilterProvider";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function mockOptionsFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: RequestInfo | URL) => {
      if (String(url).includes("genres")) return Promise.resolve(jsonResponse({ data: [] }));
      return Promise.resolve(jsonResponse({ data: [] }));
    }),
  );
}

function CityReader({ testId }: { testId: string }) {
  const { filters } = useFilterContext();
  return (
    <div data-testid={testId}>
      <span data-testid={`${testId}-city`}>{filters.state.city ?? "none"}</span>
      <button type="button" onClick={() => filters.selectCity("Vitória")}>
        Selecionar Vitória
      </button>
    </div>
  );
}

function ConsumerWithoutProvider() {
  useFilterContext();
  return null;
}

describe("FilterProvider", () => {
  beforeEach(() => {
    mockOptionsFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given a consumer outside FilterProvider when useFilterContext is called then it throws", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<ConsumerWithoutProvider />)).toThrow(
      /useFilterContext must be used within a FilterProvider/,
    );

    consoleError.mockRestore();
  });

  it("given two consumers under one FilterProvider when one updates a filter then both see the same shared state", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <FilterProvider>
          <CityReader testId="a" />
          <CityReader testId="b" />
        </FilterProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("a-city")).toHaveTextContent("none");
    expect(screen.getByTestId("b-city")).toHaveTextContent("none");

    await act(async () => {
      screen.getAllByRole("button", { name: /selecionar vitória/i })[0].click();
    });

    expect(screen.getByTestId("a-city")).toHaveTextContent("Vitória");
    expect(screen.getByTestId("b-city")).toHaveTextContent("Vitória");
  });
});
