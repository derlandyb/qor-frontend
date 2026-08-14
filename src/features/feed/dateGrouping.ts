import type { Event } from "../../types/event";

export interface DateGroup {
  dateKey: string; // YYYY-MM-DD in the viewer's local timezone
  label: string;
  events: Event[];
}

// The API always returns startDateTime with the Grande Vitória (-03:00) offset already baked
// in — the ISO string's own date component IS the event's local date, so this reads it
// directly rather than round-tripping through `Date`'s getFullYear/getMonth/getDate, which
// re-interpret the instant in the *runtime's* timezone (browser or, worse, whatever timezone a
// CI/Docker container happens to run in — UTC by default — silently shifting events near
// midnight onto the wrong day).
function localDateKey(iso: string): string {
  return iso.slice(0, 10);
}

const BRAZIL_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function brazilDateKey(date: Date): string {
  return BRAZIL_DATE_FORMATTER.format(date);
}

function labelFor(dateKey: string): string {
  const today = brazilDateKey(new Date());
  const tomorrow = brazilDateKey(new Date(Date.now() + 86_400_000));

  if (dateKey === today) return "Hoje";
  if (dateKey === tomorrow) return "Amanhã";

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Groups an already time-ascending, title-tiebroken list (per FEED-007 — the API's own
// ORDER BY start_date_time, title, id) into date-keyed buckets, preserving that order both
// across and within groups. Recomputed on every accumulated-page update rather than
// incrementally patched — the feed's page sizes are small enough that this is simpler and
// still correct without extra bookkeeping.
export function groupEventsByDate(events: Event[]): DateGroup[] {
  const groups = new Map<string, Event[]>();

  for (const event of events) {
    const key = localDateKey(event.startDateTime);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(event);
    } else {
      groups.set(key, [event]);
    }
  }

  return Array.from(groups.entries()).map(([dateKey, groupEvents]) => ({
    dateKey,
    label: labelFor(dateKey),
    events: groupEvents,
  }));
}
