import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon";

describe("Icon", () => {
  it("given a known icon name when rendered then an svg with that icon's markup is shown", () => {
    const { container } = render(<Icon name="favorite" />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.innerHTML).toContain("path");
  });

  it("given a custom className when rendered then it is appended to the default icon class", () => {
    const { container } = render(<Icon name="share" className="event-card__placeholder-icon" />);

    expect(container.querySelector("svg")?.getAttribute("class")).toBe(
      "icon event-card__placeholder-icon",
    );
  });
});
