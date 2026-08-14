import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBanner } from "./StatusBanner";

describe("StatusBanner", () => {
  it("given a cancelled event when rendered then it shows the cancelled message as an alert", () => {
    render(<StatusBanner status="cancelled" />);

    expect(screen.getByRole("alert")).toHaveTextContent(/evento cancelado/i);
  });

  it("given a finished event when rendered then it shows the finished message", () => {
    render(<StatusBanner status="finished" />);

    expect(screen.getByRole("status")).toHaveTextContent(/já aconteceu/i);
  });
});
