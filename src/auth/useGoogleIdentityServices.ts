import { useEffect, useRef } from "react";

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

interface GoogleCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }): void;
          renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
        };
      };
    };
  }
}

// Loads the Google Identity Services JS SDK and renders its button into a ref'd container, per
// auth/design.md's Web Tech Decisions (both clients obtain an ID token client-side first, then
// POST it to the one shared /api/auth/google endpoint). A blank clientId is a deliberate no-op —
// dev/test/CI never depend on a real Google client id (mirrors map/design.md's missing-Mapbox-
// token guard pattern) — so GoogleSignInButton simply renders nothing until one is configured.
export function useGoogleIdentityServices(
  clientId: string,
  onCredential: (idToken: string) => void,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    function render() {
      if (cancelled || !containerRef.current || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential),
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
      });
    }

    if (window.google) {
      render();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SCRIPT_SRC}"]`,
    );
    const script = existingScript ?? document.createElement("script");
    if (!existingScript) {
      script.src = GSI_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);

    return () => {
      cancelled = true;
      script.removeEventListener("load", render);
    };
  }, [clientId, onCredential]);

  return { containerRef, isConfigured: Boolean(clientId) };
}
