export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

// Shared wire shape for /api/register, /api/login, /api/auth/google, and
// /api/password/reset — all four terminate in the same Sanctum token issuance
// (see auth/design.md's Backend Architecture Overview).
export interface AuthResponse {
  user: User;
  token: string;
}
