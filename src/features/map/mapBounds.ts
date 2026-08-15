// Fixed Grande Vitória bounding box (Vitória, Vila Velha, Serra, Cariacica) — MAP-005
// (CONFIRMED): the map must never require location permission and must always default to this
// same region-wide view, never navigator.geolocation or IP geolocation.
export const GRANDE_VITORIA_BOUNDS: [[number, number], [number, number]] = [
  [-40.55, -20.6], // southwest [lng, lat]
  [-40.05, -20.05], // northeast [lng, lat]
];
