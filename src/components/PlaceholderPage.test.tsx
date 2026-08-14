import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlaceholderPage } from "./PlaceholderPage";

describe("PlaceholderPage", () => {
  it("given a title when rendered then it is shown as the page heading", () => {
    render(<PlaceholderPage title="Mapa" />);

    expect(screen.getByRole("heading", { name: "Mapa" })).toBeInTheDocument();
  });
});
