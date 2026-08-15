import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  fetchCurrentUser,
  login as apiLogin,
  loginWithGoogle as apiLoginWithGoogle,
  logout as apiLogout,
  register as apiRegister,
  requestPasswordReset as apiRequestPasswordReset,
  resetPassword as apiResetPassword,
} from "../api/authApi";
import { ApiError } from "../api/httpClient";
import { clearToken, readStoredToken, saveToken } from "./tokenStore";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /**
   * True from mount until a stored token has been resolved against GET /api/user (or
   * immediately false if there's no stored token) — mirrors qor-admin's AuthContext, so
   * consumers waiting on session-resume don't briefly see isAuthenticated:false right after
   * a hard navigation/reload.
   */
  isLoading: boolean;
  register(name: string, email: string, password: string): Promise<void>;
  login(email: string, password: string): Promise<void>;
  loginWithGoogle(idToken: string): Promise<void>;
  logout(): void;
  requestPasswordReset(email: string): Promise<void>;
  /** Does not adopt a session — api/password/reset only returns a confirmation message,
   * it does not issue a Sanctum token (unlike design.md's original assumption). The caller
   * logs in separately afterward. */
  resetPassword(resetToken: string, email: string, password: string): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DUPLICATE_EMAIL_MESSAGE = "Este e-mail já está cadastrado — entrar em vez disso?";
const WRONG_CREDENTIALS_MESSAGE = "E-mail ou senha incorretos.";
const NETWORK_ERROR_MESSAGE = "Algo deu errado, tente novamente.";

function friendlyAuthError(error: unknown, wrongCredentialsMessage: string): Error {
  if (error instanceof ApiError) {
    if (error.status === 422 && error.body?.errors?.email) {
      return new Error(DUPLICATE_EMAIL_MESSAGE);
    }
    if (error.status === 401) {
      return new Error(wrongCredentialsMessage);
    }
    return new Error(error.body?.message ?? NETWORK_ERROR_MESSAGE);
  }
  return new Error(NETWORK_ERROR_MESSAGE);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => readStoredToken() !== null);

  useEffect(() => {
    const storedToken = readStoredToken();
    if (storedToken === null) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    fetchCurrentUser(storedToken)
      .then((resolvedUser) => {
        if (cancelled) return;
        setUser(resolvedUser);
      })
      .catch(() => {
        if (!cancelled) {
          // Stored token is no longer valid — clear it rather than leaving a stale
          // isAuthenticated:true with no way to ever populate `user`.
          clearToken();
          setToken(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Intentionally runs once on mount only — login()/register()/loginWithGoogle() populate
    // `user` directly for the rest of the session, they don't need this effect to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adoptSession = useCallback((sessionUser: User, sessionToken: string) => {
    saveToken(sessionToken);
    setToken(sessionToken);
    setUser(sessionUser);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const response = await apiRegister(name, email, password);
        adoptSession(response.user, response.token);
      } catch (error) {
        throw friendlyAuthError(error, WRONG_CREDENTIALS_MESSAGE);
      }
    },
    [adoptSession],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await apiLogin(email, password);
        adoptSession(response.user, response.token);
      } catch (error) {
        throw friendlyAuthError(error, WRONG_CREDENTIALS_MESSAGE);
      }
    },
    [adoptSession],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      try {
        const response = await apiLoginWithGoogle(idToken);
        adoptSession(response.user, response.token);
      } catch (error) {
        throw friendlyAuthError(error, NETWORK_ERROR_MESSAGE);
      }
    },
    [adoptSession],
  );

  const logout = useCallback(() => {
    if (token) {
      // Best-effort — the session is cleared client-side regardless of whether this
      // Sanctum-token invalidation call succeeds.
      apiLogout(token).catch(() => undefined);
    }
    clearToken();
    setToken(null);
    setUser(null);
  }, [token]);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      await apiRequestPasswordReset(email);
    } catch {
      // AUTH-006 AC2: the backend already returns a neutral response for both a matching and
      // a non-matching email — a network-level failure is the only way this can throw, and it
      // gets the same generic retry-affordance treatment as every other network error.
      throw new Error(NETWORK_ERROR_MESSAGE);
    }
  }, []);

  const resetPassword = useCallback(async (resetToken: string, email: string, password: string) => {
    try {
      await apiResetPassword(resetToken, email, password);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        throw new Error("Link expirado, solicite um novo.");
      }
      throw new Error(NETWORK_ERROR_MESSAGE);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: token !== null,
      isLoading,
      register,
      login,
      loginWithGoogle,
      logout,
      requestPasswordReset,
      resetPassword,
    }),
    [
      user,
      token,
      isLoading,
      register,
      login,
      loginWithGoogle,
      logout,
      requestPasswordReset,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
