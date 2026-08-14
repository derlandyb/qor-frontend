import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TopNav } from "./TopNav";

describe("TopNav", () => {
  it("given the home route when rendered then Início is the active link", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <TopNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /início/i })).toHaveClass("top-nav__link--active");
  });

  it("given the brand link when rendered then it points to the home route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <TopNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Qual o Rock?" })).toHaveAttribute("href", "/");
  });
});
