import type { Event } from "../../types/event";
import { EventCard } from "../feed/EventCard";
import { useDialogFocus } from "./useDialogFocus";

interface ClusterListPanelProps {
  events: Event[];
  onClose: () => void;
}

// List-on-tap surface for a cluster marker or a multi-event venue marker (MAP-004/010) — no
// Stitch screen exists for this surface (map/design.md's documented gap), built from its prose
// spec: a scrollable list of mini-cards over the dimmed map, matching the "Mapa de Eventos"
// overlay card's rounded-lg/pill visual language. Reuses EventCard.tsx unchanged, each already a
// full link into its own detail page (MAP-004/010's "tappable into its own preview/detail").
// useDialogFocus moves focus in on open, wires Escape to onClose, and restores focus to the
// tapped cluster/venue marker on close.
export function ClusterListPanel({ events, onClose }: ClusterListPanelProps) {
  const dialogRef = useDialogFocus<HTMLDivElement>(onClose);

  return (
    <div
      className="map-cluster-list"
      role="dialog"
      aria-label={`${events.length} eventos nesta área`}
      tabIndex={-1}
      ref={dialogRef}
    >
      <div className="map-cluster-list__header">
        <h3 className="headline-sm">{events.length} eventos nesta área</h3>
        <button
          type="button"
          className="map-cluster-list__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <ul className="card-list map-cluster-list__items" role="list">
        {events.map((event) => (
          <li key={event.id}>
            <EventCard event={event} />
          </li>
        ))}
      </ul>
    </div>
  );
}
