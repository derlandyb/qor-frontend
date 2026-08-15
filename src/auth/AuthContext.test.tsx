import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthContext";
import { clearToken, readStoredToken, saveToken } from "./tokenStore";
import { useAuth } from "./useAuth";

const USER = { id: 1, name: "Ana", email: "ana@example.com" };

function Probe() {
  const { user, isAuthenticated, isLoading, login, register, loginWithGoogle, logout } = useAuth();
  return (
    <div>
      <span data-testid="status">{isLoading ? "loading" : isAuthenticated ? "in" : "out"}</span>
      <span data-testid="user">{user?.name ?? ""}</span>
      <button onClick={() => login("ana@example.com", "senha123").catch(() => undefined)}>login</button>
      <button onClick={() => register("Ana", "ana@example.com", "senha123").catch(() => undefined)}>
        register
      </button>
      <button onClick={() => loginWithGoogle("id-token").catch(() => undefined)}>google</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  afterEach(() => {
    clearToken();
    vi.unstubAllGlobals();
  });

  it("given valid credentials when logging in then the user and token are stored", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: USER, token: "tok" }), { status: 200 })),
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText("login"));
    });

    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(readStoredToken()).toBe("tok");
  });

  it("given a successful registration then the session is adopted without a second login call", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: USER, token: "tok" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText("register"));
    });

    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("given a Google id token when signing in then the session is adopted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: USER, token: "tok" }), { status: 200 })),
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText("google"));
    });

    expect(await screen.findByText("Ana")).toBeInTheDocument();
  });

  it("given wrong credentials when logging in then a generic error is thrown and no session is stored", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 })),
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText("login"));
    });

    expect(screen.getByTestId("status")).toHaveTextContent("out");
    expect(readStoredToken()).toBeNull();
  });

  it("given a stored token on mount then the session resumes silently via GET /api/user", async () => {
    saveToken("tok");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(USER), { status: 200 })));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("status")).toHaveTextContent("loading");
    expect(await screen.findByText("Ana")).toBeInTheDocument();
  });

  it("given an invalid stored token on mount then it is cleared", async () => {
    saveToken("stale");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await screen.findByText("out");
    expect(readStoredToken()).toBeNull();
  });

  it("given an authenticated session when logging out then the token is cleared client-side", async () => {
    saveToken("tok");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(USER), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await screen.findByText("Ana");

    fireEvent.click(screen.getByText("logout"));

    expect(screen.getByTestId("status")).toHaveTextContent("out");
    expect(readStoredToken()).toBeNull();
  });
});
