import { useParams } from "react-router-dom";
import { ErrorState } from "../feed/ErrorState";
import { Icon } from "../../components/icons/Icon";
import { ActionRow } from "./ActionRow";
import "./detail.css";
import { DescriptionSection } from "./DescriptionSection";
import { formatPriceLine } from "./formatPriceLine";
import { LocationSection } from "./LocationSection";
import { NotFoundPage } from "./NotFoundPage";
import { PromoterSection } from "./PromoterSection";
import { StatusBanner } from "./StatusBanner";
import { useEventDetail } from "./useEventDetail";

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});
const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { status, event, retry } = useEventDetail(id ?? "");

  if (status === "loading") {
    return (
      <section className="detail-page">
        <p role="status">Carregando evento…</p>
      </section>
    );
  }

  if (status === "not-found") {
    return <NotFoundPage />;
  }

  if (status === "error" || event === null) {
    return (
      <section className="detail-page">
        <ErrorState onRetry={retry} />
      </section>
    );
  }

  return (
    <article className="detail-page">
      {event.bannerStatus && <StatusBanner status={event.bannerStatus} />}

      <div className="detail-page__hero">
        {event.coverImageUrl ? (
          <img className="detail-page__hero-image" src={event.coverImageUrl} alt="" />
        ) : (
          <div className="detail-page__hero-image detail-page__hero-image--placeholder">
            <Icon name="music_note" />
          </div>
        )}
        <div className="detail-page__hero-content">
          <h1 className="display-lg">{event.title}</h1>
          <p className="body-md">
            {event.venue.name} · {event.city}
          </p>
          <p className="detail-page__date-price caption">
            {DATE_FORMATTER.format(new Date(event.startDateTime))} ·{" "}
            {TIME_FORMATTER.format(new Date(event.startDateTime))} · {formatPriceLine(event.price)}
          </p>
        </div>
      </div>

      <ActionRow event={event} />
      <DescriptionSection description={event.description} />
      <LocationSection venue={event.venue} />
      {event.promoter && <PromoterSection promoter={event.promoter} />}
    </article>
  );
}
