import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthContext";
import { ResetPasswordPage } from "./ResetPasswordPage";
import { clearToken } from "./tokenStore";

function renderPage(query = "?token=reset-token&email=ana%40example.com") {
  return render(
    <MemoryRouter initialEntries={[`/reset-password${query}`]}>
      <AuthProvider>
        <ResetPasswordPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("ResetPasswordPage", () => {
  afterEach(() => {
    clearToken();
    vi.unstubAllGlobals();
  });

  it("given a valid reset token and email in the URL when a new password is submitted then a success confirmation is shown", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ message: "ok" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    renderPage();

    await userEvent.type(screen.getByLabelText("Nova senha"), "novaSenha1");
    await userEvent.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(await screen.findByText("Senha redefinida com sucesso.")).toBeInTheDocument();
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({
      token: "reset-token",
      email: "ana@example.com",
      password: "novaSenha1",
      password_confirmation: "novaSenha1",
    });
  });

  it("given an expired or invalid token when submitted then a friendly error is shown", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ message: "invalid" }), { status: 422 })),
    );
    renderPage();

    await userEvent.type(screen.getByLabelText("Nova senha"), "novaSenha1");
    await userEvent.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Link expirado, solicite um novo.");
  });
});
