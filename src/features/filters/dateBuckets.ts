import type { DateBucket } from "../../types/filters";

export const DATE_BUCKETS: { value: DateBucket; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "amanha", label: "Amanhã" },
  { value: "fim_de_semana", label: "Este fim de semana" },
  { value: "proxima_semana", label: "Próxima semana" },
];

// PRD OPEN-02 is unresolved (no full nearby-city list) — scoped to the four PRD-named cities,
// same workaround filters/context.md already documents.
export const CITIES = ["Vitória", "Vila Velha", "Serra", "Cariacica"];
