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

async function mockFeed(page: import("@playwright/test").Page) {
  await page.route(/\/api\/events(\?.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [MOCK_EVENT], next_cursor: null }),
    }),
  );
}

test("given an anonymous visitor when a gated action is attempted then the auth overlay opens without navigation", async ({
  page,
}) => {
  await mockFeed(page);
  await page.goto("/");

  await page.getByRole("button", { name: /favoritar/i }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/");
});

test("given successful contextual login when the overlay closes then the original action runs", async ({
  page,
}) => {
  await mockFeed(page);
  await page.route(/\/api\/login$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: 1, name: "Ana", email: "ana@example.com" },
        token: "e2e-token",
      }),
    }),
  );
  await page.goto("/");

  const favoriteButton = page.getByRole("button", { name: /favoritar/i });
  await favoriteButton.click();

  await page.getByLabel("E-mail").fill("ana@example.com");
  await page.getByLabel("Senha").fill("senha1234");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(favoriteButton).toHaveAttribute("aria-pressed", "true");
});
