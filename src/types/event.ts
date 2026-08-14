// Canonical Event/Venue/Promoter types — mirrors the backend's EventResource/VenueResource
// (api/app/Http/Resources/{EventResource,VenueResource}.php) field-for-field, per
// .specs/features/event-feed/design.md. Every later web feature importing Event/Venue/Promoter
// types should import from here rather than redefining them.

export interface Event {
  id: string;
  title: string;
  coverImageUrl: string | null; // null -> render placeholder, never omitted
  startDateTime: string; // ISO 8601
  venue: Venue;
  city: string;
  price: Price | null; // null (key omitted by the API) -> price row omitted entirely
  ageRating: AgeRating | null; // null (key omitted by the API) -> badge omitted entirely
  genres: string[];
  ticketUrl: string | null;
  status: EventStatus;
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
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  verificationStatus: VerificationStatus;
}

export interface Promoter {
  id: string;
  name: string;
  imageUrl: string | null;
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
