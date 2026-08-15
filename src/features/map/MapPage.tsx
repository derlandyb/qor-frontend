import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Event } from "../../types/event";
import { isFilterStateEmpty } from "../../types/filters";
import { ActiveFilterChips } from "../filters/ActiveFilterChips";
import { FilterBar } from "../filters/FilterBar";
import { useFilterContext } from "../filters/FilterProvider";
import "../filters/filters.css";
import { buildMarkerFeatureCollection } from "./geojson";
import "./map.css";
import { GRANDE_VITORIA_BOUNDS } from "./mapBounds";
import {
  CLUSTER_COUNT_LAYER_ID,
  CLUSTER_LAYER_ID,
  MARKER_SOURCE_ID,
  UNCLUSTERED_LAYER_ID,
} from "./mapLayers";
import { ClusterListPanel } from "./ClusterListPanel";
import { MarkerPreviewCard } from "./MarkerPreviewCard";
import { useMapMarkers } from "./useMapMarkers";
import { deriveViewportState, type Bounds } from "./useMapViewportState";

// Public, client-side token — same pattern as any map-tile provider (map/design.md's
// Integration Points). No location permission is ever requested (MAP-005): the map's initial
// view always comes from the fixed GRANDE_VITORIA_BOUNDS constant, never navigator.geolocation.
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

type Selection = { type: "single"; event: Event } | { type: "cluster"; events: Event[] } | null;

// The /mapa route (MAP-001/008) — a dedicated screen distinct from the Feed, per map/design.md's
// locked access-model decision. Reads the same lifted FilterProvider instance the Feed reads
// (MAP-003 AC2), fetches its own unpaginated marker set via useMapMarkers, and delegates
// clustering entirely to Mapbox GL JS's built-in `cluster: true` GeoJSON source — this component
// never computes cluster geometry itself (map/design.md's Architecture Overview).
export function MapPage() {
  const { filters } = useFilterContext();
  const { state, retry } = useMapMarkers(filters);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Event[]>([]);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [selection, setSelection] = useState<Selection>(null);

  // Stabilizes the reference across renders where state isn't "loaded" — an inline `[]` literal
  // would otherwise be a new array every render, defeating the effects below that key off it.
  const markers = useMemo(() => (state.status === "loaded" ? state.markers : []), [state]);

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      bounds: GRANDE_VITORIA_BOUNDS,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource(MARKER_SOURCE_ID, {
        type: "geojson",
        data: buildMarkerFeatureCollection(markersRef.current),
        cluster: true,
        clusterRadius: 50,
      });

      map.addLayer({
        id: CLUSTER_LAYER_ID,
        type: "circle",
        source: MARKER_SOURCE_ID,
        filter: ["has", "point_count"],
        paint: { "circle-color": "#EE9B00", "circle-radius": 18 },
      });
      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: "symbol",
        source: MARKER_SOURCE_ID,
        filter: ["has", "point_count"],
        layout: { "text-field": "{point_count_abbreviated}" },
      });
      map.addLayer({
        id: UNCLUSTERED_LAYER_ID,
        type: "circle",
        source: MARKER_SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-color": "#006D77", "circle-radius": 8 },
      });

      map.on("click", CLUSTER_LAYER_ID, (event) => {
        const feature = event.features?.[0] as unknown as
          { properties?: { cluster_id?: number } } | undefined;
        const clusterId = feature?.properties?.cluster_id;
        const source = map.getSource(MARKER_SOURCE_ID) as mapboxgl.GeoJSONSource;
        if (clusterId === undefined) return;
        source.getClusterLeaves(clusterId, Infinity, 0, (_error, leaves) => {
          const leafFeatures = (leaves ?? []) as unknown as Array<{
            properties?: { eventId?: string };
          }>;
          const ids = new Set(leafFeatures.map((leaf) => leaf.properties?.eventId));
          const events = markersRef.current.filter((candidate) => ids.has(candidate.id));
          setSelection({ type: "cluster", events });
        });
      });

      map.on("click", UNCLUSTERED_LAYER_ID, (event) => {
        const feature = event.features?.[0] as unknown as
          { properties?: { eventId?: string } } | undefined;
        const eventId = feature?.properties?.eventId;
        const found = markersRef.current.find((candidate) => candidate.id === eventId);
        if (found) setSelection({ type: "single", event: found });
      });

      map.on("moveend", () => {
        const mapBounds = map.getBounds();
        if (!mapBounds) return;
        setBounds({
          north: mapBounds.getNorth(),
          south: mapBounds.getSouth(),
          east: mapBounds.getEast(),
          west: mapBounds.getWest(),
        });
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(MARKER_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(buildMarkerFeatureCollection(markers));
  }, [markers]);

  const hasActiveFilters = !isFilterStateEmpty(filters.state);
  const viewport = deriveViewportState(markers, hasActiveFilters, bounds);

  return (
    <section className="map-page" aria-labelledby="map-heading">
      <h2 id="map-heading" className="headline-lg map-page__heading">
        Mapa
      </h2>

      <FilterBar filters={filters} />
      <ActiveFilterChips
        chips={filters.asChips()}
        onRemove={filters.removeChip}
        onClearAll={filters.clearAll}
      />

      <div className="map-page__canvas-wrapper">
        <div className="map-page__canvas" ref={containerRef} />

        {state.status === "loading" && (
          <p role="status" className="map-page__overlay">
            Carregando mapa…
          </p>
        )}

        {state.status === "error" && (
          <div className="map-page__overlay map-page__overlay--error" role="alert">
            <p className="body-lg">Não foi possível carregar o mapa.</p>
            <button type="button" className="feed-state__retry" onClick={retry}>
              Tentar novamente
            </button>
          </div>
        )}

        {state.status === "loaded" && viewport.status === "empty_viewport" && (
          <p role="status" className="map-page__overlay">
            Nenhum evento nesta área.
          </p>
        )}

        {state.status === "loaded" && viewport.status === "no_filter_results" && (
          <div className="map-page__overlay" role="status">
            <p className="body-lg">Nenhum evento encontrado para os filtros ativos.</p>
            <button type="button" className="feed-state__retry" onClick={filters.clearAll}>
              Limpar filtros
            </button>
          </div>
        )}

        {selection?.type === "single" && (
          <MarkerPreviewCard event={selection.event} onClose={() => setSelection(null)} />
        )}
        {selection?.type === "cluster" && (
          <ClusterListPanel events={selection.events} onClose={() => setSelection(null)} />
        )}
      </div>
    </section>
  );
}
