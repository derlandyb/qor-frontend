import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseDialogFocusOptions {
  /**
   * True for a real aria-modal dialog (e.g. AuthOverlay) — Tab/Shift+Tab is constrained to the
   * dialog's own focusable elements so a keyboard user can't tab out into the page behind the
   * backdrop. False (default) for the map's non-modal floating panels (MarkerPreviewCard,
   * ClusterListPanel), which deliberately leave the map underneath still reachable.
   */
  trapFocus?: boolean;
}

// Shared focus-management behavior for floating dialog/overlay panels: move focus in on open,
// close on Escape, and restore focus to whatever triggered it once the panel unmounts. Started
// as map-only (MarkerPreviewCard/ClusterListPanel, both role="dialog" but not aria-modal since
// the map stays interactive underneath, per MAP-002/009); `auth`'s AuthOverlay is a second,
// genuinely aria-modal consumer, hence the opt-in `trapFocus`.
export function useDialogFocus<T extends HTMLElement>(
  onClose: () => void,
  { trapFocus = false }: UseDialogFocusOptions = {},
) {
  const dialogRef = useRef<T | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    return () => {
      previouslyFocused.current?.focus();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (trapFocus && event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        } else if (!dialog.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, trapFocus]);

  return dialogRef;
}
