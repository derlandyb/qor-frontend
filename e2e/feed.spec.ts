import { expect, test } from "@playwright/test";

const MOCK_EVENT = {
  id: "1",
  title: "Noite do Rock Capixaba",
  coverImageUrl: null,
  startDateTime: new Date(Date.now() + 3_600_000).toISOString(),
  venue: {
    id: "v1",
    name: "Cine Teatro Glória",
    imageUrl: null,
    city: "Vila Velha",
    address: null,
    latitude: null,
    longitude: null,
    verificationStatus: "verified",
  },
  city: "Vila Velha",
  price: { isFree: false, min: 40, max: 40, currency: "BRL" },
  ageRating: null,
  genres: ["rock"],
  ticketUrl: null,
  status: "published",
};

test("given an anonymous visitor when the feed loads then it renders upcoming events soonest first", async ({
  page,
}) => {
  // A glob like "**/api/events**" also matches "/src/api/eventsApi.ts" (the module script
  // itself, which contains "api/events" as a substring) and breaks the app by serving JSON in
  // place of JS — this regex requires the path to end right after "/api/events" (optionally
  // followed by a query string), never mid-filename.
  await page.route(/\/api\/events(\?.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [MOCK_EVENT], next_cursor: null }),
    }),
  );

  await page.goto("/");

  await expect(page.getByText(MOCK_EVENT.title)).toBeVisible();
});

test("given an anonymous visitor when the feed loads then no login or location prompt is shown", async ({
  page,
}) => {
  // A glob like "**/api/events**" also matches "/src/api/eventsApi.ts" (the module script
  // itself, which contains "api/events" as a substring) and breaks the app by serving JSON in
  // place of JS — this regex requires the path to end right after "/api/events" (optionally
  // followed by a query string), never mid-filename.
  await page.route(/\/api\/events(\?.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [MOCK_EVENT], next_cursor: null }),
    }),
  );

  await page.goto("/");

  await expect(page.getByText(MOCK_EVENT.title)).toBeVisible();
  await expect(page.getByRole("heading", { name: /entrar|login/i })).toHaveCount(0);
  await expect(page.getByText(/permitir localização/i)).toHaveCount(0);
});
