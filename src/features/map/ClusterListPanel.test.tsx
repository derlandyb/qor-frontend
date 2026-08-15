import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { makeEvent } from "../../test/factories";
import { ClusterListPanel } from "./ClusterListPanel";

describe("ClusterListPanel", () => {
  it("given a cluster of events when the list opens then every event is listed", () => {
    const events = [
      makeEvent({ id: "1", title: "Show A" }),
      makeEvent({ id: "2", title: "Show B" }),
      makeEvent({ id: "3", title: "Show C" }),
    ];

    render(
      <MemoryRouter>
        <ClusterListPanel events={events} onClose={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/3 eventos nesta área/i)).toBeInTheDocument();
    expect(screen.getByText("Show A")).toBeInTheDocument();
    expect(screen.getByText("Show B")).toBeInTheDocument();
    expect(screen.getByText("Show C")).toBeInTheDocument();
  });

  it("given the list is open when the close control is activated then onClose is called", async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <ClusterListPanel events={[makeEvent()]} onClose={onClose} />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: /fechar/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("given the list opens then focus moves into the dialog", () => {
    render(
      <MemoryRouter>
        <ClusterListPanel events={[makeEvent()]} onClose={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("given the list is open when Escape is pressed then onClose is called", async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <ClusterListPanel events={[makeEvent()]} onClose={onClose} />
      </MemoryRouter>,
    );

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("given a marker was focused when the list opens and then closes then focus returns to the marker", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "marker";
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(
      <MemoryRouter>
        <ClusterListPanel events={[makeEvent()]} onClose={vi.fn()} />
      </MemoryRouter>,
    );
    expect(trigger).not.toHaveFocus();

    unmount();

    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("given an event in the list when its card link is present then it points at that event's own detail page", () => {
    const events = [makeEvent({ id: "42", title: "Show Único" })];

    render(
      <MemoryRouter>
        <ClusterListPanel events={events} onClose={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /show único/i })).toHaveAttribute(
      "href",
      "/eventos/42",
    );
  });
});
