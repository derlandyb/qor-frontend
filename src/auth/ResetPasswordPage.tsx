import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "./useAuth";
import "./auth.css";

// AUTH-006 AC1's actual token-submission step — reached only via the link the emailed
// ResetPassword notification sends, so it's a routed page (no session exists yet to gate),
// unlike AuthOverlay's in-place reset-request/reset-sent modes.
export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const isValidLink = token !== "" && email !== "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await resetPassword(token, email, password);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-overlay__dialog auth-overlay__dialog--static">
        <h1 className="auth-overlay__title headline-md">Redefinir senha</h1>
        {success ? (
          <div className="auth-overlay__confirmation">
            <p className="body-lg">Senha redefinida com sucesso.</p>
            <Link className="btn btn--primary" to="/">
              Ir para o início
            </Link>
          </div>
        ) : !isValidLink ? (
          <div className="auth-overlay__confirmation">
            <p className="auth-overlay__error" role="alert">
              Este link de redefinição é inválido. Solicite um novo.
            </p>
            <Link className="btn btn--secondary" to="/">
              Ir para o início
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <p className="auth-overlay__error" role="alert">
                {error}
              </p>
            )}
            <label className="auth-form__label" htmlFor="reset-password-new">
              Nova senha
            </label>
            <input
              id="reset-password-new"
              className="auth-form__input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              Redefinir senha
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
