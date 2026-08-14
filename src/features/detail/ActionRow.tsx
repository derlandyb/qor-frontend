import { useState } from "react";
import { Icon } from "../../components/icons/Icon";
import type { Event } from "../../types/event";

interface ActionRowProps {
  event: Event;
}

// DETAIL-002/005 — Save and Share are the two prominent, equal-weight primary actions; the
// ticket link (already server-omitted once a banner is active) is a small secondary text link
// that follows them in DOM order, not a third same-weight button.
export function ActionRow({ event }: ActionRowProps) {
  const [isFavorited, setIsFavorited] = useState(Boolean(event.isFavorited));
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setShareStatus("Link copiado!");
      window.setTimeout(() => setShareStatus(null), 3000);
    });
  };

  return (
    <div className="action-row">
      <div className="action-row__primary">
        <button
          type="button"
          className="action-row__button"
          aria-pressed={isFavorited}
          aria-label="Favoritar"
          onClick={() => setIsFavorited((current) => !current)}
        >
          <Icon name="favorite" />
          <span className="label-md">Favoritar</span>
        </button>
        <button
          type="button"
          className="action-row__button"
          aria-label="Compartilhar"
          onClick={handleShare}
        >
          <Icon name="share" />
          <span className="label-md">Compartilhar</span>
        </button>
      </div>

      {shareStatus && (
        <p role="status" className="action-row__share-status caption">
          {shareStatus}
        </p>
      )}

      {event.ticketUrl && (
        <a className="action-row__ticket-link caption" href={event.ticketUrl}>
          Comprar Ingresso
        </a>
      )}
    </div>
  );
}
