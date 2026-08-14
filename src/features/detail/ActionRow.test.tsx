import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeEvent } from "../../test/factories";
import { ActionRow } from "./ActionRow";

describe("ActionRow", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("given an anonymous visitor when opening event details then save and share precede the ticket link", () => {
    const event = makeEvent({ ticketUrl: "https://example.com/tickets" });
    render(<ActionRow event={event} />);

    const buttons = screen.getAllByRole("button").map((el) => el.getAttribute("aria-label"));
    const ticketLink = screen.getByRole("link", { name: /comprar ingresso/i });

    expect(buttons).toEqual(["Favoritar", "Compartilhar"]);
    const container = ticketLink.closest(".action-row");
    expect(container).not.toBeNull();
    const allNodes = Array.from(container!.querySelectorAll("button, a"));
    const ticketIndex = allNodes.indexOf(ticketLink);
    expect(ticketIndex).toBe(allNodes.length - 1);
  });

  it("given no ticket url when rendered then no ticket link is shown", () => {
    const event = makeEvent({ ticketUrl: null });
    render(<ActionRow event={event} />);

    expect(screen.queryByRole("link", { name: /comprar ingresso/i })).not.toBeInTheDocument();
  });

  it("given a click on share when clicked then the URL is copied and a confirmation is shown", async () => {
    const event = makeEvent();
    render(<ActionRow event={event} />);

    await userEvent.click(screen.getByRole("button", { name: /compartilhar/i }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    expect(await screen.findByRole("status")).toHaveTextContent(/link copiado/i);
  });

  it("given a click on favoritar when clicked then the pressed state toggles", async () => {
    const event = makeEvent();
    render(<ActionRow event={event} />);

    const saveButton = screen.getByRole("button", { name: /favoritar/i });
    expect(saveButton).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(saveButton);

    expect(saveButton).toHaveAttribute("aria-pressed", "true");
  });
});
