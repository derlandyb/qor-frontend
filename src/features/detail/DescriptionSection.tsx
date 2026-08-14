interface DescriptionSectionProps {
  description: string | null;
}

// DETAIL-006 — full, untruncated description, no expand/collapse control, ever.
export function DescriptionSection({ description }: DescriptionSectionProps) {
  if (!description) return null;

  return (
    <section className="description-section">
      <h3 className="headline-md">Sobre o Evento</h3>
      <p className="body-md">{description}</p>
    </section>
  );
}
