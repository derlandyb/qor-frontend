import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("given the retry button when clicked then onRetry is called", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("given inline is true when rendered then the compact inline variant class is applied", () => {
    render(<ErrorState onRetry={() => {}} inline />);

    expect(screen.getByRole("alert")).toHaveClass("feed-state--inline");
  });
});
