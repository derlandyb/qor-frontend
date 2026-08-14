import { Icon } from "../../components/icons/Icon";
import type { Venue } from "../../types/event";

interface LocationSectionProps {
  venue: Venue;
}

// DETAIL-004 — static map image when coordinates exist, address-only text when only an address
// exists, whole section omitted when neither exists. Also renders venue contact info as real
// clickable controls (tel:/mailto:/social links) so a future analytics pass has a click target
// for venue_contact_clicked (flagged gap, STATE.md Todos) — no handler wired here.
export function LocationSection({ venue }: LocationSectionProps) {
  const hasMap = venue.staticMapUrl !== null;
  const hasAddress = venue.address !== null;
  const hasContact =
    venue.contactPhone !== null || venue.contactEmail !== null || venue.socialLinks !== null;

  if (!hasMap && !hasAddress && !hasContact) return null;

  return (
    <section className="location-section">
      <h3 className="headline-md">Local</h3>

      {hasMap && (
        <img className="location-section__map" src={venue.staticMapUrl ?? undefined} alt="" />
      )}

      {hasAddress && <p className="body-md">{venue.address}</p>}

      {hasMap && venue.latitude !== null && venue.longitude !== null && (
        <a
          className="location-section__maps-link caption"
          href={`https://maps.google.com/?q=${venue.latitude},${venue.longitude}`}
          target="_blank"
          rel="noreferrer"
        >
          Ver no mapa
        </a>
      )}

      {hasContact && (
        <div className="location-section__contact">
          {venue.contactPhone && (
            <a
              className="location-section__contact-link caption"
              href={`tel:${venue.contactPhone}`}
            >
              <Icon name="call" />
              {venue.contactPhone}
            </a>
          )}
          {venue.contactEmail && (
            <a
              className="location-section__contact-link caption"
              href={`mailto:${venue.contactEmail}`}
            >
              <Icon name="mail" />
              {venue.contactEmail}
            </a>
          )}
          {venue.socialLinks &&
            Object.entries(venue.socialLinks).map(([platform, url]) => (
              <a
                key={platform}
                className="location-section__contact-link caption"
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                {platform}
              </a>
            ))}
        </div>
      )}
    </section>
  );
}
