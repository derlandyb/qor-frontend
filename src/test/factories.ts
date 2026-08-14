import type { Event, Venue } from "../types/event";

export function makeVenue(overrides: Partial<Venue> = {}): Venue {
  return {
    id: "venue-1",
    name: "Cine Teatro Glória",
    imageUrl: null,
    city: "Vila Velha",
    address: null,
    latitude: null,
    longitude: null,
    verificationStatus: "verified",
    ...overrides,
  };
}

export function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "event-1",
    title: "Noite do Rock Capixaba",
    coverImageUrl: null,
    startDateTime: "2026-08-14T22:00:00-03:00",
    venue: makeVenue(),
    city: "Vila Velha",
    price: { isFree: false, min: 40, max: 40, currency: "BRL" },
    ageRating: null,
    genres: ["rock"],
    ticketUrl: null,
    status: "published",
    ...overrides,
  };
}
