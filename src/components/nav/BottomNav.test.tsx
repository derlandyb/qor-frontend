import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { BottomNav } from "./BottomNav";

describe("BottomNav", () => {
  it("given the home route when rendered then Início is the active item", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <BottomNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /início/i })).toHaveClass("bottom-nav__item--active");
  });

  it("given a non-home route when rendered then Início is not the active item", () => {
    render(
      <MemoryRouter initialEntries={["/mapa"]}>
        <BottomNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /início/i })).not.toHaveClass(
      "bottom-nav__item--active",
    );
    expect(screen.getByRole("link", { name: /mapa/i })).toHaveClass("bottom-nav__item--active");
  });

  it("given all five nav items when rendered then each is reachable as a link", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <BottomNav />
      </MemoryRouter>,
    );

    ["Início", "Explorar", "Mapa", "Favoritos", "Perfil"].forEach((label) => {
      expect(screen.getByRole("link", { name: new RegExp(label, "i") })).toBeInTheDocument();
    });
  });
});
