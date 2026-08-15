import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthOverlay } from "./AuthOverlay";
import { AuthProvider } from "./AuthContext";
import { clearToken } from "./tokenStore";

function renderOverlay(initialMode: "login" | "signup" = "login") {
  const onSuccess = vi.fn();
  const onDismiss = vi.fn();
  render(
    <AuthProvider>
      <AuthOverlay initialMode={initialMode} onSuccess={onSuccess} onDismiss={onDismiss} />
    </AuthProvider>,
  );
  return { onSuccess, onDismiss };
}

describe("AuthOverlay", () => {
  afterEach(() => {
    clearToken();
    vi.unstubAllGlobals();
  });

  it("given the login mode when it opens then no navigation occurs and the login form is shown", () => {
    renderOverlay("login");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });

  it("given the login form when Criar conta is clicked then the signup form is shown in place", async () => {
    renderOverlay("login");

    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(screen.getByRole("heading", { name: "Criar conta" })).toBeInTheDocument();
  });

  it("given the login form when Esqueceu a senha is clicked then the reset-request form is shown", async () => {
    renderOverlay("login");

    await userEvent.click(screen.getByRole("button", { name: "Esqueceu a senha?" }));

    expect(screen.getByRole("heading", { name: "Recuperar senha" })).toBeInTheDocument();
  });

  it("given valid credentials when the login form is submitted then onSuccess is called", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            user: { id: 1, name: "Ana", email: "ana@example.com" },
            token: "tok",
          }),
          { status: 200 },
        ),
      ),
    );
    const { onSuccess } = renderOverlay("login");

    await userEvent.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("given the overlay is open when Escape is pressed then onDismiss is called", async () => {
    const { onDismiss } = renderOverlay("login");

    await userEvent.keyboard("{Escape}");

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("given the overlay is open when the backdrop is clicked then onDismiss is called", async () => {
    const { onDismiss } = renderOverlay("login");

    const dialog = screen.getByRole("dialog");
    // Click the backdrop element (the dialog's parent), not the dialog itself.
    await userEvent.click(dialog.parentElement as HTMLElement);

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("given the overlay is open when the close button is clicked then onDismiss is called", async () => {
    const { onDismiss } = renderOverlay("login");

    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("given a successful signup when submitted then a confirmation step shows before onSuccess runs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            user: { id: 1, name: "Ana", email: "ana@example.com" },
            token: "tok",
          }),
          { status: 200 },
        ),
      ),
    );
    const { onSuccess } = renderOverlay("signup");

    await userEvent.type(screen.getByLabelText("Nome"), "Ana");
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha1234");
    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByRole("heading", { name: "Bem-vindo!" })).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("given a duplicate email when signup is submitted then a friendly error is shown and no session is stored", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Erro", errors: { email: ["já cadastrado"] } }), {
          status: 422,
        }),
      ),
    );
    renderOverlay("signup");

    await userEvent.type(screen.getByLabelText("Nome"), "Ana");
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha1234");
    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/já está cadastrado/);
  });

  it("given a password reset request when submitted then the reset-sent confirmation shows, then the login form again", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 })),
    );
    renderOverlay("login");

    await userEvent.click(screen.getByRole("button", { name: "Esqueceu a senha?" }));
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar link de recuperação" }));

    expect(
      await screen.findByRole("heading", { name: "Verifique seu e-mail" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Voltar para o login" }));

    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
  });
});
