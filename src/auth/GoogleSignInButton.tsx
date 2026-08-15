import { useGoogleIdentityServices } from "./useGoogleIdentityServices";

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const { containerRef, isConfigured } = useGoogleIdentityServices(CLIENT_ID, onCredential);

  if (!isConfigured) return null;

  return (
    <div className="auth-form__google" ref={containerRef} data-testid="google-signin-button" />
  );
}
