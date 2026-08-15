import { useState } from "react";
import { Icon } from "../../components/icons/Icon";
import { useGatedAction } from "../../auth/useGatedAction";
import type { Event } from "../../types/event";

interface EventCardProps {
  event: Event;
}

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

function isLiveNow(event: Event): boolean {
  const start = new Date(event.startDateTime).getTime();
  const now = Date.now();
  const threeHours = 3 * 60 * 60 * 1000;
  return now >= start && now < start + threeHours;
}

function formatPrice(event: Event): string | null {
  if (!event.price) return null;
  if (event.price.isFree) return "Gratuito";
  if (event.price.min === null) return null;
  return `R$ ${event.price.min.toFixed(0)}`;
}

export function EventCard({ event }: EventCardProps) {
  // Cosmetic toggle only — favorites' real add/remove/persist behavior belongs to the
  // (not-yet-built) `favorites` feature, which will replace this local setState with a real
  // API call inside the same gate. Gating it behind useGatedAction is `auth`'s job (AUTH-004):
  // an anonymous tap must prompt login before anything toggles.
  const [isFavorited, setIsFavorited] = useState(Boolean(event.isFavorited));
  const gate = useGatedAction();

  const time = TIME_FORMATTER.format(new Date(event.startDateTime));
  const price = formatPrice(event);
  const live = isLiveNow(event);

  return (
    <article className="event-card">
      <a
        className="event-card__link"
        href={`/eventos/${event.id}`}
        aria-label={`${event.title}, ${time}`}
      >
        <div
          className={
            event.coverImageUrl
              ? "event-card__media"
              : "event-card__media event-card__media--placeholder"
          }
        >
          {event.coverImageUrl ? (
            <img className="event-card__image" src={event.coverImageUrl} alt="" />
          ) : (
            <Icon name="music_note" className="event-card__placeholder-icon" />
          )}
          {live && <span className="event-card__live-badge label-md">AO VIVO AGORA</span>}
          <div className="event-card__scrim" />
          <div className="event-card__overlay">
            <span className="event-card__date label-md">{time}</span>
            {price && (
              <span
                className={
                  event.price?.isFree
                    ? "event-card__price event-card__price--free label-md"
                    : "event-card__price label-md"
                }
              >
                {price}
              </span>
            )}
          </div>
        </div>
        <div className="event-card__body">
          <h4 className="event-card__title body-lg">{event.title}</h4>
          <p className="event-card__meta caption">
            <Icon name="location_on" />
            {event.venue.name} · {event.city}
          </p>
          <div className="event-card__footer">
            {event.ageRating && (
              <span
                className="age-rating-badge caption"
                aria-label={`Classificação indicativa ${event.ageRating === "L" ? "livre" : `${event.ageRating} anos`}`}
              >
                {event.ageRating}
              </span>
            )}
          </div>
        </div>
      </a>
      <div className="event-card__affordances">
        <button
          className="icon-affordance icon-affordance--favorite"
          type="button"
          aria-pressed={isFavorited}
          aria-label={`Favoritar ${event.title}`}
          onClick={() => gate(() => setIsFavorited((current) => !current))}
        >
          <Icon name="favorite" />
        </button>
        <button
          className="icon-affordance"
          type="button"
          aria-label={`Compartilhar ${event.title}`}
        >
          <Icon name="share" />
        </button>
      </div>
    </article>
  );
}
