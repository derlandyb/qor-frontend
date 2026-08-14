interface ErrorStateProps {
  onRetry: () => void;
  inline?: boolean;
}

// FEED-010 — a retry-capable error state, never a blank or frozen screen. `inline` renders the
// compact mid-scroll variant (a batch-fetch failure at the list's end, per FEED-006) instead of
// the full-page initial-load variant.
export function ErrorState({ onRetry, inline = false }: ErrorStateProps) {
  return (
    <div className={inline ? "feed-state feed-state--inline" : "feed-state"} role="alert">
      <p className="body-lg">Não foi possível carregar os eventos.</p>
      <button className="feed-state__retry" type="button" onClick={onRetry}>
        Tentar novamente
      </button>
    </div>
  );
}
