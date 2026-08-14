import type { Event, Promoter, Venue } from "../types/event";

export function makeVenue(overrides: Partial<Venue> = {}): Venue {
  return {
    id: "venue-1",
    name: "Cine Teatro Glória",
    imageUrl: null,
    description: null,
    city: "Vila Velha",
    address: null,
    latitude: null,
    longitude: null,
    staticMapUrl: null,
    contactPhone: null,
    contactEmail: null,
    socialLinks: null,
    verificationStatus: "verified",
    ...overrides,
  };
}

export function makePromoter(overrides: Partial<Promoter> = {}): Promoter {
  return {
    id: "promoter-1",
    name: "Produções Capixaba",
    imageUrl: null,
    description: null,
    socialLinks: null,
    contactPhone: null,
    contactEmail: null,
    verificationStatus: "verified",
    ...overrides,
  };
}

export function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "event-1",
    title: "Noite do Rock Capixaba",
    description: null,
    coverImageUrl: null,
    startDateTime: "2026-08-14T22:00:00-03:00",
    endDateTime: null,
    venue: makeVenue(),
    city: "Vila Velha",
    price: { isFree: false, min: 40, max: 40, currency: "BRL" },
    ageRating: null,
    genres: ["rock"],
    ticketUrl: null,
    status: "published",
    bannerStatus: null,
    promoter: null,
    ...overrides,
  };
}
