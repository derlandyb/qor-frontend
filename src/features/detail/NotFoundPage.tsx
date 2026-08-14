// DETAIL-009 — terminal, non-retry-capable state, distinct from ErrorState (which is
// retry-capable for network/server errors). An unknown/internal-only event id lands here.
export function NotFoundPage() {
  return (
    <section className="not-found-page">
      <h2 className="headline-lg">Evento não encontrado</h2>
      <p className="body-lg">Este evento não existe ou não está mais disponível.</p>
    </section>
  );
}
