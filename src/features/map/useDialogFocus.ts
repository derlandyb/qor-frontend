import { useEffect, useRef } from "react";

// Shared focus-management behavior for the map's floating overlay panels (MarkerPreviewCard,
// ClusterListPanel) — both are role="dialog" but not aria-modal (the map stays interactive
// underneath, per MAP-002/009), so this only owns the parts a modal-less dialog still needs:
// move focus in on open, close on Escape, and restore focus to whatever triggered it (the tapped
// marker/cluster) once the panel unmounts.
export function useDialogFocus<T extends HTMLElement>(onClose: () => void) {
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
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return dialogRef;
}
