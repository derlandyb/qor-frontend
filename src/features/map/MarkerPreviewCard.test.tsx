import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { makeEvent } from "../../test/factories";
import { MarkerPreviewCard } from "./MarkerPreviewCard";

function renderCard(onClose = vi.fn()) {
  const event = makeEvent({ id: "e1", title: "Noite Sertaneja Premium" });
  render(
    <MemoryRouter>
      <MarkerPreviewCard event={event} onClose={onClose} />
    </MemoryRouter>,
  );
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
});
