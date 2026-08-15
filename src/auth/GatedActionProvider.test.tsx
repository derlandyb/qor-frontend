import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthContext";
import { GatedActionProvider } from "./GatedActionProvider";
import { clearToken, saveToken } from "./tokenStore";
import { useGatedAction } from "./useGatedAction";

const USER = { id: 1, name: "Ana", email: "ana@example.com" };

function GatedButton({ onRun }: { onRun: () => void }) {
  const gate = useGatedAction();
  return <button onClick={() => gate(onRun)}>favoritar</button>;
}

function renderWithProvider(onRun: () => void) {
  return render(
    <AuthProvider>
      <GatedActionProvider>
        <GatedButton onRun={onRun} />
      </GatedActionProvider>
    </AuthProvider>,
  );
}

describe("GatedActionProvider / useGatedAction", () => {
  afterEach(() => {
    clearToken();
    vi.unstubAllGlobals();
  });

  it("given an anonymous visitor when a gated action is attempted then the auth overlay opens without navigation", async () => {
    const onRun = vi.fn();
    renderWithProvider(onRun);

    await userEvent.click(screen.getByRole("button", { name: "favoritar" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onRun).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe("/");
  });

  it("given successful contextual login when the overlay closes then the original action runs", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ user: USER, token: "tok" }), { status: 200 }),
        ),
    );
    const onRun = vi.fn();
    renderWithProvider(onRun);

    await userEvent.click(screen.getByRole("button", { name: "favoritar" }));
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onRun).toHaveBeenCalledOnce();
  });

  it("given an authenticated visitor when a gated action is attempted then it runs immediately without opening the overlay", async () => {
    saveToken("tok");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(USER), { status: 200 })),
    );
    const onRun = vi.fn();
    renderWithProvider(onRun);

    await screen.findByRole("button", { name: "favoritar" });
    await userEvent.click(screen.getByRole("button", { name: "favoritar" }));

    expect(onRun).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("given the overlay is open when dismissed then the action is discarded and never runs", async () => {
    const onRun = vi.fn();
    renderWithProvider(onRun);

    await userEvent.click(screen.getByRole("button", { name: "favoritar" }));
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onRun).not.toHaveBeenCalled();
  });
});
