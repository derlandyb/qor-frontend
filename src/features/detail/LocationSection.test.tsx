import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeVenue } from "../../test/factories";
import { LocationSection } from "./LocationSection";

describe("LocationSection", () => {
  it("given coordinates when rendered then a static map image and Ver no mapa link are shown", () => {
    const venue = makeVenue({
      staticMapUrl: "https://maps.example/static.png",
      address: "Praia da Costa, Vila Velha",
      latitude: -20.33,
      longitude: -40.29,
    });
    const { container } = render(<LocationSection venue={venue} />);

    expect(container.querySelector(".location-section__map")).toHaveAttribute(
      "src",
      venue.staticMapUrl,
    );
    expect(screen.getByText(venue.address!)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver no mapa/i })).toHaveAttribute(
      "href",
      `https://maps.google.com/?q=${venue.latitude},${venue.longitude}`,
    );
  });

  it("given only an address when rendered then no map image or link is shown", () => {
    const venue = makeVenue({ address: "Rua Sete de Setembro, 100" });
    render(<LocationSection venue={venue} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver no mapa/i })).not.toBeInTheDocument();
    expect(screen.getByText(venue.address!)).toBeInTheDocument();
  });

  it("given neither coordinates nor address nor contact info when rendered then nothing is shown", () => {
    const venue = makeVenue({ address: null, staticMapUrl: null });
    const { container } = render(<LocationSection venue={venue} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("given venue contact info when rendered then phone email and social links are clickable", () => {
    const venue = makeVenue({
      contactPhone: "+55 27 99999-0000",
      contactEmail: "contato@venue.com",
      socialLinks: { instagram: "https://instagram.com/venue" },
    });
    render(<LocationSection venue={venue} />);

    expect(screen.getByRole("link", { name: /\+55 27 99999-0000/ })).toHaveAttribute(
      "href",
      "tel:+55 27 99999-0000",
    );
    expect(screen.getByRole("link", { name: /contato@venue\.com/ })).toHaveAttribute(
      "href",
      "mailto:contato@venue.com",
    );
    expect(screen.getByRole("link", { name: /instagram/i })).toHaveAttribute(
      "href",
      "https://instagram.com/venue",
    );
  });
});
