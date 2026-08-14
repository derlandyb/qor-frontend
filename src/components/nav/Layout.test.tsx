import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Layout } from "./Layout";

describe("Layout", () => {
  it("given children when rendered then they appear inside the main landmark", () => {
    render(
      <MemoryRouter>
        <Layout>
          <p>Conteúdo da página</p>
        </Layout>
      </MemoryRouter>,
    );

    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo da página");
  });

  it("given the page when rendered then a skip link to the main content is present", () => {
    render(
      <MemoryRouter>
        <Layout>
          <p>Conteúdo</p>
        </Layout>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /pular para o conteúdo/i })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });
});
