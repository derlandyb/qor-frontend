// Minimal inline SVG icon set (outlined, 1.75px stroke) — avoids depending on an external
// icon-font request (Material Symbols) at runtime, keeping icons available offline and in tests.

export type IconName = keyof typeof PATHS;

const PATHS = {
  home: '<path d="M4 11.5 12 4l8 7.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  explore:
    '<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.75" fill="none"/><path d="m15 9-4.5 1.5L9 15l4.5-1.5L15 9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>',
  map: '<path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" fill="none"/><path d="M9 4v14M15 6v14" stroke="currentColor" stroke-width="1.75"/>',
  favorite:
    '<path d="M12 20.5s-7.5-4.6-9.7-9C.6 8 2 4.5 5.5 4c2-.3 3.7.7 4.5 2.2C10.8 4.7 12.5 3.7 14.5 4 18 4.5 19.4 8 17.7 11.5 15.5 15.9 12 20.5 12 20.5Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" fill="none"/>',
  person:
    '<circle cx="12" cy="8.2" r="3.2" stroke="currentColor" stroke-width="1.75" fill="none"/><path d="M4.5 20c1.3-3.6 4-5.5 7.5-5.5s6.2 1.9 7.5 5.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" fill="none"/>',
  search:
    '<circle cx="10.5" cy="10.5" r="6" stroke="currentColor" stroke-width="1.75" fill="none"/><path d="m19 19-4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>',
  location_on:
    '<path d="M12 21.5s7-6.6 7-11.8A7 7 0 0 0 5 9.7c0 5.2 7 11.8 7 11.8Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" fill="none"/><circle cx="12" cy="9.7" r="2.4" stroke="currentColor" stroke-width="1.75" fill="none"/>',
  music_note:
    '<circle cx="7" cy="18" r="2.6" stroke="currentColor" stroke-width="1.75" fill="none"/><path d="M9.6 18V5.4L18 4v11.4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="15.4" cy="15.4" r="2.6" stroke="currentColor" stroke-width="1.75" fill="none"/>',
  share:
    '<circle cx="18" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.75" fill="none"/><circle cx="6" cy="12" r="2.5" stroke="currentColor" stroke-width="1.75" fill="none"/><circle cx="18" cy="18.5" r="2.5" stroke="currentColor" stroke-width="1.75" fill="none"/><path d="m8.2 10.8 7.6-4.2M8.2 13.2l7.6 4.2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>',
} as const;

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      viewBox="0 0 24 24"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: PATHS[name] }}
    />
  );
}
