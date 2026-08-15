import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mapboxgl from "mapbox-gl";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../auth/AuthContext";
import { GatedActionProvider } from "../../auth/GatedActionProvider";
import { makeEvent, makeVenue } from "../../test/factories";
import { FilterProvider } from "../filters/FilterProvider";
import { CLUSTER_LAYER_ID, UNCLUSTERED_LAYER_ID } from "./mapLayers";
import { MapPage } from "./MapPage";

interface FakeGeoJSONSource {
  data: unknown;
  setData: (data: unknown) => void;
  clusterLeaves: Array<{ properties: { eventId: string } }>;
  getClusterLeaves: (
    clusterId: number,
    limit: number,
    offset: number,
    callback: (error: unknown, features?: Array<{ properties: { eventId: string } }>) => void,
  ) => void;
}

interface FakeMap {
  handlers: Record<string, (...args: never[]) => void>;
  options: Record<string, unknown>;
  source: FakeGeoJSONSource;
  on: (event: string, layerOrHandler: unknown, maybeHandler?: unknown) => FakeMap;
  addSource: () => void;
  addLayer: () => void;
  getSource: () => FakeGeoJSONSource;
  getBounds: () => {
    getNorth: () => number;
    getSouth: () => number;
    getEast: () => number;
    getWest: () => number;
  };
  remove: () => void;
  resize: () => void;
}

vi.mock("mapbox-gl", () => {
  class FakeMapImpl implements FakeMap {
    static instances: FakeMap[] = [];
    static throwOnNextConstruct = false;
    handlers: Record<string, (...args: never[]) => void> = {};
    source: FakeGeoJSONSource = {
      data: null,
      clusterLeaves: [],
      setData(data: unknown) {
        this.data = data;
      },
      getClusterLeaves(_clusterId, _limit, _offset, callback) {
        callback(null, this.clusterLeaves);
      },
    };

    constructor(public options: Record<string, unknown>) {
      if (FakeMapImpl.throwOnNextConstruct) {
        FakeMapImpl.throwOnNextConstruct = false;
        throw new Error("An API access token is required to use Mapbox GL.");
      }
      FakeMapImpl.instances.push(this);
    }

    on(event: string, layerOrHandler: unknown, maybeHandler?: unknown) {
      if (typeof layerOrHandler === "function") {
        this.handlers[event] = layerOrHandler as (...args: never[]) => void;
      } else {
        this.handlers[`${event}:${String(layerOrHandler)}`] = maybeHandler as (
          ...args: never[]
        ) => void;
      }
      return this;
    }

    addSource() {}
    addLayer() {}
    getSource() {
      return this.source;
    }
    getBounds() {
      return {
        getNorth: () => -19.9,
        getSouth: () => -20.6,
        getEast: () => -40.05,
        getWest: () => -40.55,
      };
    }
    remove() {}
    resize() {}
  }

  return {
    default: { Map: FakeMapImpl, accessToken: "" },
  };
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function latestMapInstance(): FakeMap {
  const MapClass = mapboxgl.Map as unknown as { instances: FakeMap[] };
  const instance = MapClass.instances.at(-1);
  if (!instance) throw new Error("no mapboxgl.Map instance created");
  return instance;
}

function renderMapPage() {
  return render(
    <MemoryRouter initialEntries={["/mapa"]}>
      <AuthProvider>
        <GatedActionProvider>
          <FilterProvider>
            <MapPage />
          </FilterProvider>
        </GatedActionProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const VITORIA_EVENT = makeEvent({
  id: "e1",
  title: "Show em Vitória",
  venue: makeVenue({ latitude: -20.3, longitude: -40.3 }),
});

describe("MapPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        if (String(url).includes("filter-options"))
          return Promise.resolve(jsonResponse({ data: [] }));
        return Promise.resolve(jsonResponse({ data: [VITORIA_EVENT] }));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("given a visitor when opening the map then the Grande Vitoria viewport and event markers are shown", async () => {
    renderMapPage();

    const instance = latestMapInstance();
    expect(instance.options.bounds).toBeDefined();
    expect(instance.options.center).toBeUndefined();

    await act(async () => {
      instance.handlers.load();
    });

    await waitFor(() => expect(instance.source.data).toBeDefined());
    const data = instance.source.data as { features: unknown[] };
    expect(data.features).toHaveLength(1);

    expect(await screen.findByText(/1 evento no mapa/i)).toBeInTheDocument();
  });

  it("given a filtered feed when the map opens then only matching markers appear", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
        if (u.includes("city=")) {
          return Promise.resolve(jsonResponse({ data: [VITORIA_EVENT] }));
        }
        return Promise.resolve(
          jsonResponse({
            data: [
              VITORIA_EVENT,
              makeEvent({
                id: "e2",
                title: "Show em Serra",
                venue: makeVenue({ latitude: -20.12, longitude: -40.31 }),
              }),
            ],
          }),
        );
      }),
    );

    renderMapPage();
    const instance = latestMapInstance();
    await act(async () => {
      instance.handlers.load();
    });
    await waitFor(() => {
      const data = instance.source.data as { features: unknown[] };
      expect(data.features).toHaveLength(2);
    });

    await act(async () => {
      screen.getAllByRole("button", { name: "Vitória" })[0].click();
    });

    await waitFor(() => {
      const data = instance.source.data as { features: unknown[] };
      expect(data.features).toHaveLength(1);
    });
  });

  it("given a single-marker click when the feature carries an event id then a MarkerPreviewCard opens with that event", async () => {
    renderMapPage();
    const instance = latestMapInstance();
    await act(async () => {
      instance.handlers.load();
    });
    await waitFor(() => expect(instance.source.data).toBeDefined());

    await act(async () => {
      instance.handlers[`click:${UNCLUSTERED_LAYER_ID}`]({
        features: [{ properties: { eventId: "e1" } }],
      } as never);
    });

    expect(await screen.findByText("Show em Vitória")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver detalhes/i })).toHaveAttribute(
      "href",
      "/eventos/e1",
    );
  });

  it("given a cluster click when leaves resolve then a ClusterListPanel opens listing every constituent event", async () => {
    renderMapPage();
    const instance = latestMapInstance();
    await act(async () => {
      instance.handlers.load();
    });
    await waitFor(() => expect(instance.source.data).toBeDefined());
    instance.source.clusterLeaves = [{ properties: { eventId: "e1" } }];

    await act(async () => {
      instance.handlers[`click:${CLUSTER_LAYER_ID}`]({
        features: [{ properties: { cluster_id: 1 } }],
      } as never);
    });

    expect(await screen.findByText(/1 eventos nesta área/i)).toBeInTheDocument();
    expect(screen.getByText("Show em Vitória")).toBeInTheDocument();
  });

  it("given the marker fetch fails when the map loads then a retry-capable error state is shown", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

    renderMapPage();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it("given no Mapbox access token when the map initializes then a retry-capable error is shown instead of crashing the page", async () => {
    const MapClass = mapboxgl.Map as unknown as { throwOnNextConstruct: boolean };
    MapClass.throwOnNextConstruct = true;

    renderMapPage();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mapa" })).toBeInTheDocument();
  });

  it("given no Mapbox access token when the map initializes then the marker-count status still reflects the fetched data", async () => {
    const MapClass = mapboxgl.Map as unknown as { throwOnNextConstruct: boolean };
    MapClass.throwOnNextConstruct = true;

    renderMapPage();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(await screen.findByText(/1 evento no mapa/i)).toBeInTheDocument();
  });

  it("given active filters with zero matching events when the map loads then a clear-filters message is shown", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        const u = String(url);
        if (u.includes("filter-options")) return Promise.resolve(jsonResponse({ data: [] }));
        if (u.includes("city=")) return Promise.resolve(jsonResponse({ data: [] }));
        return Promise.resolve(jsonResponse({ data: [VITORIA_EVENT] }));
      }),
    );

    renderMapPage();
    await screen.findByRole("button", { name: "Vitória" });

    await act(async () => {
      screen.getAllByRole("button", { name: "Vitória" })[0].click();
    });

    expect(await screen.findByText(/nenhum evento encontrado/i)).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: /limpar filtros/i })[0]);

    await waitFor(() => {
      expect(screen.queryByText(/nenhum evento encontrado/i)).not.toBeInTheDocument();
    });
  });

  it("given no active filters and zero markers when the map loads then a non-blocking empty message is shown, distinct from the no-filter-results message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: RequestInfo | URL) => {
        if (String(url).includes("filter-options"))
          return Promise.resolve(jsonResponse({ data: [] }));
        return Promise.resolve(jsonResponse({ data: [] }));
      }),
    );

    renderMapPage();

    expect(await screen.findByText(/nenhum evento nesta área/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /limpar filtros/i })).not.toBeInTheDocument();
  });
});
