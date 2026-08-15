import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeEvent } from "../../test/factories";
import { renderWithProviders } from "../../test/renderWithProviders";
import { MarkerPreviewCard } from "./MarkerPreviewCard";

function renderCard(onClose = vi.fn()) {
  const event = makeEvent({ id: "e1", title: "Noite Sertaneja Premium" });
  renderWithProviders(<MarkerPreviewCard event={event} onClose={onClose} />);
  return { event, onClose };
}

describe("MarkerPreviewCard", () => {
  it("given a single event when the marker preview opens then it shows the event's card fields and a details link", () => {
    renderCard();

    expect(screen.getByText("Noite Sertaneja Premium")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver detalhes/i })).toHaveAttribute(
      "href",
      "/eventos/e1",
    );
  });

  it("given the preview is open when the close control is activated then onClose is called", async () => {
    const { onClose } = renderCard();

    await userEvent.click(screen.getByRole("button", { name: /fechar/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("given the preview opens then focus moves into the dialog", () => {
    renderCard();

    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("given the preview is open when Escape is pressed then onClose is called", async () => {
    const { onClose } = renderCard();

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("given a marker was focused when the preview opens and then closes then focus returns to the marker", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "marker";
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = renderWithProviders(
      <MarkerPreviewCard event={makeEvent({ id: "e1" })} onClose={vi.fn()} />,
    );
    expect(trigger).not.toHaveFocus();

    unmount();

    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
