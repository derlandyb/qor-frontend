import { expect, test } from "@playwright/test";

function mockEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: "1",
    title: "Noite do Rock Capixaba",
    description: "Uma noite inteira de rock capixaba com bandas locais.",
    coverImageUrl: null,
    startDateTime: new Date(Date.now() + 3_600_000).toISOString(),
    endDateTime: null,
    venue: {
      id: "v1",
      name: "Cine Teatro Glória",
      imageUrl: null,
      description: null,
      city: "Vila Velha",
      address: "Praia da Costa, Vila Velha",
      latitude: -20.33,
      longitude: -40.29,
      staticMapUrl: null,
      contactPhone: null,
      contactEmail: null,
      socialLinks: null,
      verificationStatus: "verified",
    },
    city: "Vila Velha",
    price: { isFree: false, min: 40, max: 40, currency: "BRL" },
    ageRating: null,
    genres: ["rock"],
    ticketUrl: "https://example.com/tickets",
    status: "published",
    bannerStatus: null,
    promoter: null,
    ...overrides,
  };
}

test("given an anonymous visitor when opening event details then save and share precede the ticket link", async ({
  page,
}) => {
  await page.route(/\/api\/events\/1$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: mockEvent() }),
    }),
  );

  await page.goto("/eventos/1");

  const buttons = page.getByRole("button");
  await expect(buttons.filter({ hasText: "Favoritar" })).toBeVisible();
  await expect(buttons.filter({ hasText: "Compartilhar" })).toBeVisible();
  await expect(page.getByRole("link", { name: /comprar ingresso/i })).toBeVisible();
});

test("given a shared cancelled event when its URL opens then the cancelled banner is visible", async ({
  page,
}) => {
  await page.route(/\/api\/events\/1$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: mockEvent({ bannerStatus: "cancelled", ticketUrl: null }) }),
    }),
  );

  await page.goto("/eventos/1");

  await expect(page.getByRole("alert")).toContainText(/evento cancelado/i);
  await expect(page.getByRole("link", { name: /comprar ingresso/i })).toHaveCount(0);
});
