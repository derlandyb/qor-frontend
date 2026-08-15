import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AuthOverlay } from "./AuthOverlay";
import { GatedActionContext } from "./GatedActionContext";
import { useAuth } from "./useAuth";

// Web equivalent of Mobile's GatedActionCoordinator (AUTH-004 AC2/AC3, AUTH-007). Mounted once,
// app-wide (unlike the Feed/Map-scoped FilterProvider), since a gated action can be triggered
// from any route — auth/design.md's useGatedAction is only a thin per-call-site hook; this
// provider is what actually owns the single AuthOverlay instance and the pending action.
export function GatedActionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const pendingActionRef = useRef<(() => unknown) | null>(null);

  const gate = useCallback(
    <T,>(action: () => T | Promise<T>) => {
      if (isAuthenticated) {
        void action();
        return;
      }
      pendingActionRef.current = action;
      setIsOverlayOpen(true);
    },
    [isAuthenticated],
  );

  const handleSuccess = useCallback(() => {
    setIsOverlayOpen(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (action) void action();
  }, []);

  const handleDismiss = useCallback(() => {
    // AUTH-007: dismissal is a no-op — the captured action is discarded silently, never run.
    pendingActionRef.current = null;
    setIsOverlayOpen(false);
  }, []);

  const value = useMemo(() => ({ gate }), [gate]);

  return (
    <GatedActionContext.Provider value={value}>
      {children}
      {isOverlayOpen && (
        <AuthOverlay initialMode="login" onSuccess={handleSuccess} onDismiss={handleDismiss} />
      )}
    </GatedActionContext.Provider>
  );
}
