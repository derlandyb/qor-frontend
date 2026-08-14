interface PlaceholderPageProps {
  title: string;
}

// Stand-in for routes not yet implemented (search/filters, map, favorites, auth) — keeps the
// nav's five destinations all navigable instead of 404ing, without building ahead of their
// own features.
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section>
      <h2 className="headline-lg">{title}</h2>
      <p className="body-lg">Em construção.</p>
    </section>
  );
}
