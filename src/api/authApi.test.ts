import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchCurrentUser,
  login,
  loginWithGoogle,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
} from "./authApi";

const USER = { id: 1, name: "Ana", email: "ana@example.com" };

function jsonBody(init: RequestInit | undefined): unknown {
  return JSON.parse(String(init?.body));
}

describe("authApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given valid details when registering then password_confirmation is sent and the session is returned", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ user: USER, token: "tok" }), { status: 200 }),
    );

    const result = await register("Ana", "ana@example.com", "senha123");

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(jsonBody(init)).toMatchObject({ password: "senha123", password_confirmation: "senha123" });
    expect(result).toEqual({ user: USER, token: "tok" });
  });

  it("given valid credentials when logging in then the session is returned", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ user: USER, token: "tok" }), { status: 200 }),
    );

    const result = await login("ana@example.com", "senha123");

    expect(result).toEqual({ user: USER, token: "tok" });
  });

  it("given a Google id token when signing in then it is sent as id_token", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ user: USER, token: "tok" }), { status: 200 }),
    );

    await loginWithGoogle("google-id-token");

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(jsonBody(init)).toEqual({ id_token: "google-id-token" });
  });

  it("given a token when logging out then it is sent as a bearer header", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

    await logout("tok");

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer tok");
  });

  it("given an email when a reset is requested then no error is thrown regardless of match", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "ok" }), { status: 200 }),
    );

    await expect(requestPasswordReset("ana@example.com")).resolves.toBeUndefined();
  });

  it("given a reset token and new password when resetting then password_confirmation is sent and no session is assumed", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Senha redefinida com sucesso." }), { status: 200 }),
    );

    const result = await resetPassword("reset-token", "ana@example.com", "novaSenha1");

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(jsonBody(init)).toEqual({
      token: "reset-token",
      email: "ana@example.com",
      password: "novaSenha1",
      password_confirmation: "novaSenha1",
    });
    expect(result).toBeUndefined();
  });

  it("given a stored token when fetching the current user then the raw user is returned", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(USER), { status: 200 }));

    const user = await fetchCurrentUser("tok");

    expect(user).toEqual(USER);
    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer tok");
  });
});
