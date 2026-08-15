import { expect, test, type Page } from "@playwright/test";

function mockEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: "1",
    title: "Noite do Rock Capixaba",
    description: null,
    coverImageUrl: null,
    startDateTime: new Date(Date.now() + 3_600_000).toISOString(),
    endDateTime: null,
    venue: {
      id: "v1",
      name: "Cine Teatro Glória",
      imageUrl: null,
      description: null,
      city: "Vila Velha",
      address: null,
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
    ticketUrl: null,
    status: "published",
    bannerStatus: null,
    promoter: null,
    ...overrides,
  };
}

function routeJson(page: Page, path: RegExp, body: unknown) {
  return page.route(path, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) }),
  );
}

// Mapbox GL JS needs a real access token + network access to actually render tiles — neither is
// guaranteed in this environment. Real marker rendering lives entirely inside Mapbox's own WebGL
// canvas (map/design.md's Architecture Overview — clustering is delegated to Mapbox, never app
// code), so these tests assert on MapPage's own DOM: the FilterBar/heading confirm the dedicated
// Map screen renders (MAP-001/008), and the sr-only marker-count status text — a genuine a11y
// affordance for a canvas with no other non-visual equivalent — confirms the fetched marker set
// matches expectations, independent of whether Mapbox's tiles actually loaded. Real Mapbox network
// calls are blocked so the test never hangs/flakes on an unset VITE_MAPBOX_TOKEN.
async function blockRealMapboxRequests(page: Page) {
  await page.route(/mapbox\.com/, (route) => route.abort());
}

test("given a visitor when opening the map then the Grande Vitoria viewport and event markers are shown", async ({
  page,
}) => {
  await blockRealMapboxRequests(page);
  await routeJson(page, /\/api\/filter-options\/genres(\?.*)?$/, { data: [] });
  await routeJson(page, /\/api\/filter-options\/artists(\?.*)?$/, { data: [] });
  await routeJson(page, /\/api\/events\/map(\?.*)?$/, { data: [mockEvent()] });

  await page.goto("/mapa");

  await expect(page.getByRole("heading", { name: "Mapa" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Vitória" })).toBeVisible();
  await expect(page.getByText(/1 evento no mapa/i)).toBeAttached();

  // MAP-005 — never a location-permission prompt.
  await expect(page.getByText(/permitir localização/i)).not.toBeAttached();
});

test("given a filtered feed when the map opens then only matching markers appear", async ({
  page,
}) => {
  await blockRealMapboxRequests(page);
  await routeJson(page, /\/api\/filter-options\/genres(\?.*)?$/, { data: [] });
  await routeJson(page, /\/api\/filter-options\/artists(\?.*)?$/, { data: [] });
  await page.route(/\/api\/events\/map(\?.*)?$/, (route) => {
    const url = route.request().url();
    if (url.includes("city=")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [mockEvent()] }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [mockEvent(), mockEvent({ id: "2", title: "Show em Serra" })],
      }),
    });
  });

  await page.goto("/mapa");
  await expect(page.getByText(/2 eventos no mapa/i)).toBeAttached();

  await page.getByRole("button", { name: "Vitória" }).click();

  await expect(page.getByText(/1 evento no mapa/i)).toBeAttached();
});
