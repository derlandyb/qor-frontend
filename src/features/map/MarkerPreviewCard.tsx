import type { Event } from "../../types/event";
import { EventCard } from "../feed/EventCard";
import { useDialogFocus } from "../../hooks/useDialogFocus";

interface MarkerPreviewCardProps {
  event: Event;
  onClose: () => void;
}

// Floating panel docked over the map on a single-marker tap (MAP-002/009) — reuses EventCard.tsx
// unchanged plus an explicit "Ver detalhes" link, matching the Stitch "Mapa de Eventos" reference.
// The map stays visible/interactive underneath; dismissing this must not move the camera
// (MAP-009 AC3) — MapPage owns that by only ever changing selection state here, never the map's
// center/zoom. useDialogFocus moves focus in on open, wires Escape to onClose, and restores focus
// to the tapped marker on close — this panel isn't aria-modal, but still needs those affordances.
export function MarkerPreviewCard({ event, onClose }: MarkerPreviewCardProps) {
  const dialogRef = useDialogFocus<HTMLDivElement>(onClose);

  return (
    <div
      className="map-marker-preview"
      role="dialog"
      aria-label={event.title}
      tabIndex={-1}
      ref={dialogRef}
    >
      <button
        type="button"
        className="map-marker-preview__close"
        aria-label="Fechar"
        onClick={onClose}
      >
        ×
      </button>
      <EventCard event={event} />
      <a className="map-marker-preview__details-link body-lg" href={`/eventos/${event.id}`}>
        Ver detalhes
      </a>
    </div>
  );
}
