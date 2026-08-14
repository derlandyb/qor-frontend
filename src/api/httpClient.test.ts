import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "./httpClient";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given a request when it is made then no Authorization header is sent", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await apiFetch("/api/events");

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.has("Authorization")).toBe(false);
  });

  it("given a JSON body when a request is made then a content-type header is set", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("null", { status: 200 }));

    await apiFetch("/api/example", { method: "POST", body: JSON.stringify({ a: 1 }) });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("given a FormData body when a request is made then no content-type header is set", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("null", { status: 200 }));

    await apiFetch("/api/example", { method: "POST", body: new FormData() });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("given a 204 response when a request is made then undefined is returned", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiFetch("/api/example")).resolves.toBeUndefined();
  });

  it("given an error response when a request is made then an ApiError with the parsed body is thrown", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Erro", errors: { field: ["obrigatório"] } }), {
        status: 422,
      }),
    );

    await expect(apiFetch("/api/example")).rejects.toMatchObject({
      status: 422,
      body: { message: "Erro", errors: { field: ["obrigatório"] } },
    });
  });

  it("given a non-JSON error response when a request is made then ApiError falls back to a generic message", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("not json", { status: 500 }));

    let error: ApiError | null = null;
    try {
      await apiFetch("/api/example");
    } catch (err) {
      error = err as ApiError;
    }

    expect(error).toBeInstanceOf(ApiError);
    expect(error?.message).toBe("A requisição falhou com o status 500.");
  });
});
