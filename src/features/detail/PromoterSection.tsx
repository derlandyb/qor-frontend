import { Icon } from "../../components/icons/Icon";
import type { Promoter } from "../../types/event";

interface PromoterSectionProps {
  promoter: Promoter;
}

// PROMOTER-001 extension — verified badge iff verificationStatus === 'verified'; social links
// individually omitted per-key rather than dropping the whole card when one is missing.
export function PromoterSection({ promoter }: PromoterSectionProps) {
  return (
    <section className="promoter-section">
      <h3 className="headline-md">Organizador</h3>
      <div className="promoter-section__card">
        <div className="promoter-section__avatar">
          {promoter.imageUrl ? (
            <img src={promoter.imageUrl} alt="" />
          ) : (
            <Icon name="person" className="promoter-section__avatar-icon" />
          )}
        </div>
        <div className="promoter-section__info">
          <p className="promoter-section__name body-lg">
            {promoter.name}
            {promoter.verificationStatus === "verified" && (
              <Icon name="verified" className="promoter-section__verified" />
            )}
          </p>
          {promoter.socialLinks &&
            Object.entries(promoter.socialLinks).map(([platform, url]) => (
              <a
                key={platform}
                className="promoter-section__social-link caption"
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                {platform}
              </a>
            ))}
        </div>
      </div>
    </section>
  );
}
