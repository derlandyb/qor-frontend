import { Icon } from "../../components/icons/Icon";

interface StatusBannerProps {
  status: "cancelled" | "finished";
}

// DETAIL-007/008 — a full-width, non-dismissible banner, first child above the hero.
// Presence (event.bannerStatus != null) is decided by the caller, not this component.
export function StatusBanner({ status }: StatusBannerProps) {
  if (status === "cancelled") {
    return (
      <div className="status-banner status-banner--cancelled" role="alert">
        <Icon name="cancel" />
        <span className="label-md">Evento cancelado</span>
      </div>
    );
  }

  return (
    <div className="status-banner status-banner--finished" role="status">
      <Icon name="event_busy" />
      <span className="label-md">Este evento já aconteceu</span>
    </div>
  );
}
