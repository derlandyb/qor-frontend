import type { AuthResponse, User } from "../auth/types";
import { apiFetch } from "./httpClient";

// RegisterRequest's `confirmed` rule requires password_confirmation on the wire even though the
// UI only ever collects one password field once client-side confirmation already matched it.
export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, password_confirmation: password }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
}

export async function logout(token: string): Promise<void> {
  await apiFetch<void>("/api/logout", { method: "POST" }, token);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch<void>("/api/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// api/routes/api.php's PasswordResetController@reset returns only a confirmation message
// (Laravel's PasswordBroker::reset() does not issue a Sanctum token) — the user logs in
// separately afterward, unlike auth/design.md's original "issues a fresh token" assumption.
// password_confirmation is required by ResetPasswordRequest's `confirmed` rule.
export async function resetPassword(
  token: string,
  email: string,
  password: string,
): Promise<void> {
  await apiFetch<void>("/api/password/reset", {
    method: "POST",
    body: JSON.stringify({ token, email, password, password_confirmation: password }),
  });
}

export async function fetchCurrentUser(token: string): Promise<User> {
  return apiFetch<User>("/api/user", {}, token);
}
