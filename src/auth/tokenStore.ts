const STORAGE_KEY = "qor-frontend.token";

export function readStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}
