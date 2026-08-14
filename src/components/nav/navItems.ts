import type { IconName } from "../icons/Icon";

// Single source of truth for the five primary nav destinations — both TopNav (desktop) and
// BottomNav (mobile) map over this instead of duplicating the item list.
export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Início", icon: "home" },
  { to: "/explorar", label: "Explorar", icon: "explore" },
  { to: "/mapa", label: "Mapa", icon: "map" },
  { to: "/favoritos", label: "Favoritos", icon: "favorite" },
  { to: "/perfil", label: "Perfil", icon: "person" },
];
