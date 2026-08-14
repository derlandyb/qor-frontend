import { expect, test } from "@playwright/test";

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
      latitude: null,
      longitude: null,
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

// A glob like "**/api/filter-options/genres**" would also risk matching source paths; a regex
// anchored at the end of the path (optionally followed by a query string) avoids that, same
// gotcha feed.spec.ts already documents for /api/events.
function routeJson(path: RegExp, body: unknown) {
  return (page: import("@playwright/test").Page) =>
    page.route(path, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) }),
    );
}

test("given a visitor when typing a query then matching event cards replace the feed after debounce", async ({
  page,
}) => {
  await routeJson(/\/api\/filter-options\/genres(\?.*)?$/, { data: [] })(page);
  await routeJson(/\/api\/filter-options\/artists(\?.*)?$/, { data: [] })(page);
  await page.route(/\/api\/events(\?.*)?$/, (route) => {
    const url = route.request().url();
    if (url.includes("q=forro")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [mockEvent({ id: "2", title: "Forró na Praça" })],
          next_cursor: null,
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [mockEvent()], next_cursor: null }),
    });
  });

  await page.goto("/");
  await expect(page.getByText(mockEvent().title)).toBeVisible();

  await page.getByRole("searchbox", { name: /buscar eventos/i }).fill("forro");

  await expect(page.getByText("Forró na Praça")).toBeVisible();
  await expect(page.getByText(mockEvent().title)).toHaveCount(0);
});

test("given a visitor when search has no matches then an explicit no-results message is shown", async ({
  page,
}) => {
  await routeJson(/\/api\/filter-options\/genres(\?.*)?$/, { data: [] })(page);
  await routeJson(/\/api\/filter-options\/artists(\?.*)?$/, { data: [] })(page);
  await page.route(/\/api\/events(\?.*)?$/, (route) => {
    const url = route.request().url();
    if (url.includes("q=zzzz")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], next_cursor: null }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [mockEvent()], next_cursor: null }),
    });
  });

  await page.goto("/");
  await page.getByRole("searchbox", { name: /buscar eventos/i }).fill("zzzz");

  await expect(page.getByText(/nenhum evento encontrado para esses filtros/i)).toBeVisible();
});

test("given a visitor when clearing filters then the unfiltered chronological feed returns", async ({
  page,
}) => {
  await routeJson(/\/api\/filter-options\/genres(\?.*)?$/, { data: [] })(page);
  await routeJson(/\/api\/filter-options\/artists(\?.*)?$/, { data: [] })(page);
  await page.route(/\/api\/events(\?.*)?$/, (route) => {
    const url = route.request().url();
    if (url.includes("city=")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], next_cursor: null }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [mockEvent()], next_cursor: null }),
    });
  });

  await page.goto("/");
  await expect(page.getByText(mockEvent().title)).toBeVisible();

  await page.getByRole("button", { name: "Vitória" }).click();
  await expect(page.getByText(/nenhum evento encontrado para esses filtros/i)).toBeVisible();

  await page
    .getByRole("button", { name: /limpar filtros/i })
    .first()
    .click();

  await expect(page.getByText(mockEvent().title)).toBeVisible();
});

test("given a visitor when filters are combined then the URL-restored feed matches them", async ({
  page,
}) => {
  await routeJson(/\/api\/filter-options\/genres(\?.*)?$/, { data: [] })(page);
  await routeJson(/\/api\/filter-options\/artists(\?.*)?$/, { data: [] })(page);

  let requestedUrl = "";
  await page.route(/\/api\/events(\?.*)?$/, (route) => {
    requestedUrl = route.request().url();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [mockEvent({ id: "3", title: "Restaurado da URL" })],
        next_cursor: null,
      }),
    });
  });

  await page.goto("/?date_bucket=fim_de_semana&city=Vit%C3%B3ria");

  await expect(page.getByText("Restaurado da URL")).toBeVisible();
  expect(requestedUrl).toContain("date_bucket=fim_de_semana");
  expect(requestedUrl).toContain("city=");
});
