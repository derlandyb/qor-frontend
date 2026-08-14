import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("given rendering when the event does not exist then it shows a not-found message with no retry action", () => {
    render(<NotFoundPage />);

    expect(screen.getByRole("heading", { name: /evento não encontrado/i })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
