import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { makeEvent } from "../../test/factories";
import { EventCard } from "./EventCard";

describe("EventCard", () => {
  it("given an event with a cover image when rendered then the image is shown, not a placeholder", () => {
    const { container } = render(
      <EventCard event={makeEvent({ coverImageUrl: "https://example.com/cover.jpg" })} />,
    );

    // alt="" is intentional (decorative photo, accessible name comes from the card link's own
    // aria-label) so this isn't queryable by role="img" — query the element directly instead.
    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("given an event with no cover image when rendered then a neutral placeholder is shown, never a broken image", () => {
    const { container } = render(<EventCard event={makeEvent({ coverImageUrl: null })} />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("given a free event when rendered then it shows Gratuito, never R$0", () => {
    render(
      <EventCard
        event={makeEvent({ price: { isFree: true, min: null, max: null, currency: "BRL" } })}
      />,
    );

    expect(screen.getByText("Gratuito")).toBeInTheDocument();
    expect(screen.queryByText(/R\$\s*0/)).not.toBeInTheDocument();
  });

  it("given an event with no price when rendered then the price row is omitted entirely", () => {
    render(<EventCard event={makeEvent({ price: null })} />);

    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
    expect(screen.queryByText("Gratuito")).not.toBeInTheDocument();
  });

  it("given an event with no age rating when rendered then no badge is shown", () => {
    render(<EventCard event={makeEvent({ ageRating: null })} />);

    expect(screen.queryByLabelText(/Classificação indicativa/)).not.toBeInTheDocument();
  });

  it("given an event with an age rating when rendered then the badge is shown", () => {
    render(<EventCard event={makeEvent({ ageRating: "16" })} />);

    expect(screen.getByLabelText("Classificação indicativa 16 anos")).toHaveTextContent("16");
  });

  it("given the favorite button when clicked then it toggles pressed state", async () => {
    const user = userEvent.setup();
    render(<EventCard event={makeEvent()} />);

    const favoriteButton = screen.getByRole("button", { name: /favoritar/i });
    expect(favoriteButton).toHaveAttribute("aria-pressed", "false");

    await user.click(favoriteButton);

    expect(favoriteButton).toHaveAttribute("aria-pressed", "true");
  });

  it("given an event when rendered then the card links to its detail route", () => {
    render(<EventCard event={makeEvent({ id: "42" })} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/eventos/42");
  });
});
