// Falls back to "" (same-origin relative requests) rather than leaving this `undefined` —
// an unset env var would otherwise get template-literal-coerced into the literal string
// "undefined" and silently prefix every request path with it (e.g. "undefined/api/events").
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? `A requisição falhou com o status ${status}.`);
    this.status = status;
    this.body = body;
  }
}

// Every route this client called before `auth` (events/filters/map) is deliberately anonymous,
// per event-feed/design.md's Architecture Overview ("no Sanctum middleware sits in front of
// GET /api/events") — `token` stays optional and unset by default so those call sites are
// unaffected. `auth`'s AuthContext is the first caller to pass one.
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
