import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useDialogFocus } from "./useDialogFocus";

function TrappedDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useDialogFocus<HTMLDivElement>(onClose, { trapFocus: true });
  return (
    <div ref={dialogRef} role="dialog" tabIndex={-1}>
      <button>first</button>
      <button>last</button>
    </div>
  );
}

function UntrappedDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useDialogFocus<HTMLDivElement>(onClose);
  return (
    <div ref={dialogRef} role="dialog" tabIndex={-1}>
      <button>only</button>
    </div>
  );
}

describe("useDialogFocus", () => {
  it("given trapFocus and focus on the last control when Tab is pressed then focus wraps to the first control", async () => {
    render(<TrappedDialog onClose={vi.fn()} />);

    screen.getByText("last").focus();
    await userEvent.tab();

    expect(screen.getByText("first")).toHaveFocus();
  });

  it("given trapFocus and focus on the first control when Shift+Tab is pressed then focus wraps to the last control", async () => {
    render(<TrappedDialog onClose={vi.fn()} />);

    screen.getByText("first").focus();
    await userEvent.tab({ shift: true });

    expect(screen.getByText("last")).toHaveFocus();
  });

  it("given trapFocus is not set when Tab is pressed then focus is left to the browser's default order", async () => {
    render(<UntrappedDialog onClose={vi.fn()} />);
    const outsideButton = document.createElement("button");
    outsideButton.textContent = "outside";
    document.body.appendChild(outsideButton);
    screen.getByText("only").focus();

    await userEvent.tab();

    expect(screen.getByText("outside")).toHaveFocus();
    outsideButton.remove();
  });
});
