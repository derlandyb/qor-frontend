// Canonical Event/Venue/Promoter types — mirrors the backend's EventResource/VenueResource
// (api/app/Http/Resources/{EventResource,VenueResource}.php) field-for-field, per
// .specs/features/event-feed/design.md. Every later web feature importing Event/Venue/Promoter
// types should import from here rather than redefining them.

export interface Event {
  id: string;
  title: string;
  description: string | null; // NEW (DETAIL-006) — always full text when present, detail endpoint only
  coverImageUrl: string | null; // null -> render placeholder, never omitted
  startDateTime: string; // ISO 8601
  endDateTime: string | null; // NEW — detail endpoint only
  venue: Venue;
  city: string;
  price: Price | null; // null (key omitted by the API) -> price row omitted entirely
  ageRating: AgeRating | null; // null (key omitted by the API) -> badge omitted entirely
  genres: string[];
  ticketUrl: string | null; // absent once bannerStatus != null (server-omitted)
  status: EventStatus;
  bannerStatus: "cancelled" | "finished" | null; // NEW — computed server-side, detail endpoint only
  promoter: Promoter | null; // NEW — primary promoter, detail endpoint only
  isFavorited?: boolean; // only present when the request carried an authenticated session
}

export interface Price {
  isFree: boolean;
  min: number | null;
  max: number | null;
  currency: string;
}

export interface Venue {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string | null; // NEW
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  staticMapUrl: string | null; // NEW (DETAIL-004) — null => address text only, no map element
  contactPhone: string | null; // NEW
  contactEmail: string | null; // NEW
  socialLinks: Record<string, string> | null; // NEW
  verificationStatus: VerificationStatus;
}

export interface Promoter {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string | null; // NEW
  socialLinks: Record<string, string> | null; // NEW — keys "instagram"/"whatsapp"
  contactPhone: string | null; // NEW
  contactEmail: string | null; // NEW
  verificationStatus: VerificationStatus;
}

export type EventStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "published"
  | "changes_requested"
  | "cancelled"
  | "finished";

export type VerificationStatus = "unverified" | "pending_review" | "verified";

export type AgeRating = "L" | "10" | "12" | "14" | "16" | "18";
