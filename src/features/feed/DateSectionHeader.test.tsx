import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DateSectionHeader } from "./DateSectionHeader";

describe("DateSectionHeader", () => {
  it("given a label when rendered then it is shown as a level-3 heading", () => {
    render(<DateSectionHeader label="Hoje" />);

    expect(screen.getByRole("heading", { level: 3, name: "Hoje" })).toBeInTheDocument();
  });
});
