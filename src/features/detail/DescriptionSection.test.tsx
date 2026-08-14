import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionSection } from "./DescriptionSection";

describe("DescriptionSection", () => {
  it("given a long description when rendered then it shows in full with no truncation", () => {
    const longText = "A".repeat(600);
    render(<DescriptionSection description={longText} />);

    const paragraph = screen.getByText(longText);
    expect(paragraph).toBeInTheDocument();
    expect(paragraph.className).not.toMatch(/line-clamp/);
  });

  it("given no description when rendered then nothing is shown", () => {
    const { container } = render(<DescriptionSection description={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
