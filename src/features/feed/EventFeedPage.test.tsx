import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeEvent } from "../../test/factories";
import { EventFeedPage } from "./EventFeedPage";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("EventFeedPage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given an anonymous visitor when the feed loads then it renders upcoming events soonest first", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        data: [
          makeEvent({ id: "1", title: "Show das 19h", startDateTime: "2026-08-14T19:00:00-03:00" }),
          makeEvent({ id: "2", title: "Show das 22h", startDateTime: "2026-08-14T22:00:00-03:00" }),
        ],
        next_cursor: null,
      }),
    );

    render(<EventFeedPage />);

    const firstCard = await screen.findByText("Show das 19h");
    const secondCard = await screen.findByText("Show das 22h");

    expect(
      firstCard.compareDocumentPosition(secondCard) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("given an anonymous visitor when the feed loads then no login or location prompt is shown", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: [makeEvent()], next_cursor: null }));

    render(<EventFeedPage />);

    await screen.findByText(makeEvent().title);

    expect(screen.queryByText(/entrar|login|permitir localização/i)).not.toBeInTheDocument();
  });

  it("given zero published upcoming events when the feed loads then a friendly empty state is shown", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: [], next_cursor: null }));

    render(<EventFeedPage />);

    expect(await screen.findByText(/nenhum evento publicado/i)).toBeInTheDocument();
  });

  it("given the feed's data request fails when the feed loads then a retry-capable error state is shown", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network error"));

    render(<EventFeedPage />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
