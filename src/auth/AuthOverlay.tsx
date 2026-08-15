import { useState, type FormEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useDialogFocus } from "../hooks/useDialogFocus";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "./useAuth";
import "./auth.css";

export type AuthOverlayMode = "login" | "signup";
type Step = "login" | "signup" | "signup-success" | "reset-request" | "reset-sent";

interface AuthOverlayProps {
  initialMode: AuthOverlayMode;
  onSuccess: () => void;
  onDismiss: () => void;
}

// The contextual gated-action login/signup surface (AUTH-004) — portal-rendered over the current
// route, no React Router navigation occurs, so "without navigating away from the surface they
// were on" holds literally, not just visually. Reuses the same five Stitch screens Mobile's
// AuthPrompt cites (auth/design.md); no new screen was generated for the compact web variant —
// this approximates them with the existing tokens.css styling instead, per that same design
// decision applied to Mobile's modal presentation.
export function AuthOverlay({ initialMode, onSuccess, onDismiss }: AuthOverlayProps) {
  const { register, login, loginWithGoogle, requestPasswordReset } = useAuth();
  const [step, setStep] = useState<Step>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogRef = useDialogFocus<HTMLDivElement>(onDismiss);

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignupSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      setStep("signup-success");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleCredential(idToken: string) {
    setError(null);
    try {
      await loginWithGoogle(idToken);
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleResetRequestSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setStep("reset-sent");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) onDismiss();
  }

  const title =
    step === "signup"
      ? "Criar conta"
      : step === "signup-success"
        ? "Bem-vindo!"
        : step === "reset-request"
          ? "Recuperar senha"
          : step === "reset-sent"
            ? "Verifique seu e-mail"
            : "Entrar";

  return createPortal(
    <div className="auth-overlay" onMouseDown={handleBackdropClick}>
      <div
        className="auth-overlay__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={dialogRef}
      >
        <button
          type="button"
          className="auth-overlay__close"
          aria-label="Fechar"
          onClick={onDismiss}
        >
          ×
        </button>
        <h2 className="auth-overlay__title headline-md">{title}</h2>

        {error && (
          <p className="auth-overlay__error" role="alert">
            {error}
          </p>
        )}

        {step === "login" && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label className="auth-form__label" htmlFor="auth-email">
              E-mail
            </label>
            <input
              id="auth-email"
              className="auth-form__input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label className="auth-form__label" htmlFor="auth-password">
              Senha
            </label>
            <input
              id="auth-password"
              className="auth-form__input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              Entrar
            </button>
            <div className="auth-overlay__links">
              <button
                type="button"
                className="auth-overlay__link"
                onClick={() => setStep("reset-request")}
              >
                Esqueceu a senha?
              </button>
              <button
                type="button"
                className="auth-overlay__link"
                onClick={() => setStep("signup")}
              >
                Criar conta
              </button>
            </div>
            <GoogleSignInButton onCredential={handleGoogleCredential} />
          </form>
        )}

        {step === "signup" && (
          <form className="auth-form" onSubmit={handleSignupSubmit}>
            <label className="auth-form__label" htmlFor="auth-name">
              Nome
            </label>
            <input
              id="auth-name"
              className="auth-form__input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <label className="auth-form__label" htmlFor="auth-signup-email">
              E-mail
            </label>
            <input
              id="auth-signup-email"
              className="auth-form__input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label className="auth-form__label" htmlFor="auth-signup-password">
              Senha
            </label>
            <input
              id="auth-signup-password"
              className="auth-form__input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              Criar conta
            </button>
            <div className="auth-overlay__links">
              <button type="button" className="auth-overlay__link" onClick={() => setStep("login")}>
                Já tenho conta
              </button>
            </div>
            <GoogleSignInButton onCredential={handleGoogleCredential} />
          </form>
        )}

        {step === "signup-success" && (
          <div className="auth-overlay__confirmation">
            <p className="body-lg">Conta criada com sucesso! Preparando tudo para você...</p>
            <button type="button" className="btn btn--primary" onClick={onSuccess}>
              Continuar
            </button>
          </div>
        )}

        {step === "reset-request" && (
          <form className="auth-form" onSubmit={handleResetRequestSubmit}>
            <label className="auth-form__label" htmlFor="auth-reset-email">
              E-mail
            </label>
            <input
              id="auth-reset-email"
              className="auth-form__input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              Enviar link de recuperação
            </button>
            <div className="auth-overlay__links">
              <button type="button" className="auth-overlay__link" onClick={() => setStep("login")}>
                Voltar para o login
              </button>
            </div>
          </form>
        )}

        {step === "reset-sent" && (
          <div className="auth-overlay__confirmation">
            <p className="body-lg">Se esse e-mail existir, enviamos um link de recuperação.</p>
            <button type="button" className="btn btn--secondary" onClick={() => setStep("login")}>
              Voltar para o login
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
