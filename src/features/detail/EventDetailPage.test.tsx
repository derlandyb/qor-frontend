import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeEvent } from "../../test/factories";
import { EventDetailPage } from "./EventDetailPage";

function renderAtId(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/eventos/${id}`]}>
      <Routes>
        <Route path="/eventos/:id" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("EventDetailPage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given an anonymous visitor when opening event details then save and share precede the ticket link", async () => {
    const event = makeEvent({ id: "1", ticketUrl: "https://example.com/tickets" });
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: event }));

    renderAtId("1");

    expect(await screen.findByRole("heading", { name: event.title })).toBeInTheDocument();

    const buttons = screen.getAllByRole("button").map((el) => el.getAttribute("aria-label"));
    expect(buttons).toEqual(["Favoritar", "Compartilhar"]);
    expect(screen.getByRole("link", { name: /comprar ingresso/i })).toBeInTheDocument();
  });

  it("given a shared cancelled event when its URL opens then the cancelled banner is visible", async () => {
    const event = makeEvent({ id: "1", bannerStatus: "cancelled", ticketUrl: null });
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: event }));

    renderAtId("1");

    expect(await screen.findByRole("alert")).toHaveTextContent(/evento cancelado/i);
    expect(screen.queryByRole("link", { name: /comprar ingresso/i })).not.toBeInTheDocument();
  });

  it("given an unknown event id when opened then the not-found page is shown", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "not found" }, 404));

    renderAtId("missing");

    expect(
      await screen.findByRole("heading", { name: /evento não encontrado/i }),
    ).toBeInTheDocument();
  });

  it("given a server error when opened then a retry-capable error state is shown", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "server error" }, 500));

    renderAtId("1");

    expect(await screen.findByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
