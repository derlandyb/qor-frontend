import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../auth/AuthContext";
import { GatedActionProvider } from "../../auth/GatedActionProvider";
import { makeEvent } from "../../test/factories";
import { FilterProvider } from "../filters/FilterProvider";
import { EventFeedPage } from "./EventFeedPage";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function renderPage(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <GatedActionProvider>
          <FilterProvider>
            <EventFeedPage />
          </FilterProvider>
        </GatedActionProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function mockDefaultFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
      return Promise.resolve(jsonResponse({ data: [], next_cursor: null }));
    }),
  );
}

describe("EventFeedPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given an anonymous visitor when the feed loads then it renders upcoming events soonest first", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
        return Promise.resolve(
          jsonResponse({
            data: [
              makeEvent({
                id: "1",
                title: "Show das 19h",
                startDateTime: "2026-08-14T19:00:00-03:00",
              }),
              makeEvent({
                id: "2",
                title: "Show das 22h",
                startDateTime: "2026-08-14T22:00:00-03:00",
              }),
            ],
            next_cursor: null,
          }),
        );
      }),
    );

    renderPage();

    const firstCard = await screen.findByText("Show das 19h");
    const secondCard = await screen.findByText("Show das 22h");

    expect(
      firstCard.compareDocumentPosition(secondCard) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("given an anonymous visitor when the feed loads then no login or location prompt is shown", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
        return Promise.resolve(jsonResponse({ data: [makeEvent()], next_cursor: null }));
      }),
    );

    renderPage();

    await screen.findByText(makeEvent().title);

    expect(screen.queryByText(/entrar|login|permitir localização/i)).not.toBeInTheDocument();
  });

  it("given zero published upcoming events when the feed loads then a friendly empty state is shown", async () => {
    mockDefaultFetch();

    renderPage();

    expect(await screen.findByText(/nenhum evento publicado/i)).toBeInTheDocument();
  });

  it("given the feed's data request fails when the feed loads then a retry-capable error state is shown", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
        return Promise.reject(new Error("network error"));
      }),
    );

    renderPage();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it("given a visitor when typing a query then matching event cards replace the feed after debounce", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
        if (u.includes("q=forro")) {
          return Promise.resolve(
            jsonResponse({
              data: [makeEvent({ id: "9", title: "Forró na Praça" })],
              next_cursor: null,
            }),
          );
        }
        return Promise.resolve(
          jsonResponse({ data: [makeEvent({ id: "1", title: "Rock Night" })], next_cursor: null }),
        );
      }),
    );

    renderPage();
    await screen.findByText("Rock Night");

    await userEvent.type(screen.getByRole("searchbox"), "forro");

    expect(await screen.findByText("Forró na Praça", {}, { timeout: 2000 })).toBeInTheDocument();
    expect(screen.queryByText("Rock Night")).not.toBeInTheDocument();
  });

  it("given a visitor when search has no matches then an explicit no-results message is shown", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
        if (u.includes("q=zzzz"))
          return Promise.resolve(jsonResponse({ data: [], next_cursor: null }));
        return Promise.resolve(jsonResponse({ data: [], next_cursor: null }));
      }),
    );

    renderPage();

    await userEvent.type(screen.getByRole("searchbox"), "zzzz");

    expect(
      await screen.findByText(/nenhum evento encontrado para "zzzz"/i, {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it("given a visitor when clearing filters then the unfiltered chronological feed returns", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
        if (u.includes("city="))
          return Promise.resolve(jsonResponse({ data: [], next_cursor: null }));
        return Promise.resolve(
          jsonResponse({ data: [makeEvent({ id: "1", title: "Rock Night" })], next_cursor: null }),
        );
      }),
    );

    renderPage();
    await screen.findByText("Rock Night");

    await userEvent.click(screen.getByRole("button", { name: "Vitória" }));
    await screen.findByText(/nenhum evento encontrado para Vitória/i, {}, { timeout: 2000 });

    const clearButtons = screen.getAllByRole("button", { name: /limpar filtros/i });
    await userEvent.click(clearButtons[0]);

    expect(await screen.findByText("Rock Night")).toBeInTheDocument();
  });

  it("given a visitor when filters are combined then the URL-restored feed matches them", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
        return Promise.resolve(
          jsonResponse({
            data: [makeEvent({ id: "1", title: "Restaurado da URL" })],
            next_cursor: null,
          }),
        );
      }),
    );

    renderPage("/?date_bucket=fim_de_semana&city=Vit%C3%B3ria");

    expect(await screen.findByText("Restaurado da URL")).toBeInTheDocument();
    const calls = vi.mocked(fetch).mock.calls.map((call) => String(call[0]));
    expect(
      calls.some((url) => url.includes("date_bucket=fim_de_semana") && url.includes("city=")),
    ).toBe(true);
  });
});
