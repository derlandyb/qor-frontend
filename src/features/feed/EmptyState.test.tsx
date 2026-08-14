import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("given zero events when rendered then a friendly status message is shown", () => {
    render(<EmptyState />);

    expect(screen.getByRole("status")).toHaveTextContent(/nenhum evento publicado/i);
  });
});
