import { Icon } from "../../components/icons/Icon";

// FEED-008 — zero Published upcoming events anywhere: a friendly explanation, never a blank screen.
export function EmptyState() {
  return (
    <div className="feed-state" role="status">
      <Icon name="music_note" />
      <p className="body-lg">Nenhum evento publicado ainda por aqui.</p>
      <p className="caption">Volte em breve — a agenda da Grande Vitória está sempre mudando.</p>
    </div>
  );
}
