import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makePromoter } from "../../test/factories";
import { PromoterSection } from "./PromoterSection";

describe("PromoterSection", () => {
  it("given a verified promoter when rendered then the verified badge is shown", () => {
    const promoter = makePromoter({ verificationStatus: "verified" });
    render(<PromoterSection promoter={promoter} />);

    expect(screen.getByText(promoter.name)).toBeInTheDocument();
    const nameEl = screen.getByText(promoter.name);
    expect(nameEl.querySelector(".promoter-section__verified")).not.toBeNull();
  });

  it("given an unverified promoter when rendered then no verified badge is shown", () => {
    const promoter = makePromoter({ verificationStatus: "unverified" });
    render(<PromoterSection promoter={promoter} />);

    const nameEl = screen.getByText(promoter.name);
    expect(nameEl.querySelector(".promoter-section__verified")).toBeNull();
  });

  it("given a promoter with an image when rendered then the avatar image is shown", () => {
    const promoter = makePromoter({ imageUrl: "https://example.com/avatar.png" });
    const { container } = render(<PromoterSection promoter={promoter} />);

    expect(container.querySelector(".promoter-section__avatar img")).toHaveAttribute(
      "src",
      promoter.imageUrl,
    );
  });

  it("given only an instagram social link when rendered then only instagram is shown", () => {
    const promoter = makePromoter({ socialLinks: { instagram: "https://instagram.com/p" } });
    render(<PromoterSection promoter={promoter} />);

    expect(screen.getByRole("link", { name: /instagram/i })).toHaveAttribute(
      "href",
      "https://instagram.com/p",
    );
    expect(screen.queryByRole("link", { name: /whatsapp/i })).not.toBeInTheDocument();
  });
});
