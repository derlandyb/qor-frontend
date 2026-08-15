import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeEvent } from "../../test/factories";
import { renderWithProviders } from "../../test/renderWithProviders";
import { clearToken, saveToken } from "../../auth/tokenStore";
import { EventCard } from "./EventCard";

afterEach(() => {
  clearToken();
  vi.unstubAllGlobals();
});

describe("EventCard", () => {
  it("given an event with a cover image when rendered then the image is shown, not a placeholder", () => {
    const { container } = renderWithProviders(
      <EventCard event={makeEvent({ coverImageUrl: "https://example.com/cover.jpg" })} />,
    );

    // alt="" is intentional (decorative photo, accessible name comes from the card link's own
    // aria-label) so this isn't queryable by role="img" — query the element directly instead.
    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("given an event with no cover image when rendered then a neutral placeholder is shown, never a broken image", () => {
    const { container } = renderWithProviders(
      <EventCard event={makeEvent({ coverImageUrl: null })} />,
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("given a free event when rendered then it shows Gratuito, never R$0", () => {
    renderWithProviders(
      <EventCard
        event={makeEvent({ price: { isFree: true, min: null, max: null, currency: "BRL" } })}
      />,
    );

    expect(screen.getByText("Gratuito")).toBeInTheDocument();
    expect(screen.queryByText(/R\$\s*0/)).not.toBeInTheDocument();
  });

  it("given an event with no price when rendered then the price row is omitted entirely", () => {
    renderWithProviders(<EventCard event={makeEvent({ price: null })} />);

    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
    expect(screen.queryByText("Gratuito")).not.toBeInTheDocument();
  });

  it("given an event with no age rating when rendered then no badge is shown", () => {
    renderWithProviders(<EventCard event={makeEvent({ ageRating: null })} />);

    expect(screen.queryByLabelText(/Classificação indicativa/)).not.toBeInTheDocument();
  });

  it("given an event with an age rating when rendered then the badge is shown", () => {
    renderWithProviders(<EventCard event={makeEvent({ ageRating: "16" })} />);

    expect(screen.getByLabelText("Classificação indicativa 16 anos")).toHaveTextContent("16");
  });

  it("given an anonymous visitor when the favorite button is clicked then the auth overlay opens and the state is unchanged", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EventCard event={makeEvent()} />);

    const favoriteButton = screen.getByRole("button", { name: /favoritar/i });
    expect(favoriteButton).toHaveAttribute("aria-pressed", "false");

    await user.click(favoriteButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(favoriteButton).toHaveAttribute("aria-pressed", "false");
  });

  it("given an authenticated visitor when the favorite button is clicked then it toggles pressed state immediately", async () => {
    saveToken("tok");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, name: "Ana", email: "ana@example.com" }), {
          status: 200,
        }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<EventCard event={makeEvent()} />);

    const favoriteButton = await screen.findByRole("button", { name: /favoritar/i });
    await user.click(favoriteButton);

    await waitFor(() => expect(favoriteButton).toHaveAttribute("aria-pressed", "true"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("given an event when rendered then the card links to its detail route", () => {
    renderWithProviders(<EventCard event={makeEvent({ id: "42" })} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/eventos/42");
  });
});
