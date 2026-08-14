# Vix Rock Discovery — Design System Tokens

Source of truth: Stitch design system `assets/ede423fa8f7f44a997a02a742803fa28` ("Vix Rock
Discovery"), project "Qual o Rock? Local Discovery" (`projects/6008587636717635180`). Canonical
per `.specs/project/ARCHITECTURE.md`'s "UI Design System" section for the consumer Mobile + Web
surfaces.

`tokens.css` mirrors the Stitch asset's `designMd` token block field-for-field as CSS custom
properties, grouped to match the asset's own sections:

| Token group | Source section | Notes |
|---|---|---|
| `--color-*` | `colors` | Material-3-style role tokens (surface/primary/secondary/accent/error), each with an `on-*` pairing for text/icon contrast |
| `--radius-*` | `rounded` | `lg` (16px) is the event-card radius; `xl` (24px)/`full` cover buttons, search bars, chips |
| `--space-*` | `spacing` | 4px base grid; `margin-mobile` (16px) vs `margin-desktop` (32px) drive the responsive gutter swap |
| `--font-*` | `typography` | Geist throughout; each scale step carries size/weight/line-height/tracking |
| `--elevation-*`, `--scrim-gradient` | "Elevation & Depth" (style-guide prose) | Card shadow, nav/sheet shadow, photo scrim gradient |
| `--breakpoint-desktop`, `--content-max-width` | "Layout & Spacing" (style-guide prose) | 12-column/1280px desktop layout note; this repo's own choice of `900px` as the mobile↔desktop nav breakpoint (not an explicit Stitch value — the asset doesn't name a pixel breakpoint, only "Mobile" vs "Desktop" sections) |

## Open discrepancy — accent color naming

The style guide's prose repeatedly calls the accent role **"Sunset Orange"** (used for "Live Now"
badges, notifications, and CTAs like "Comprar Ingresso"). The asset's own literal hex values for
that role (`tertiary` `#713d10` / `tertiary-container` `#8e5426`) are a muted brown/amber, not a
bright orange. `tokens.css` uses the literal hex as-is (`--color-accent` / `--color-accent-container`)
since that's the asset's authoritative value — **not silently resolved**. If the accent reads too
dull once seen in the static preview, that's a design decision for the user to make (brighten the
token vs. keep the muted tone), not something to guess at here.

## Open discrepancy — desktop card layout vs. FEED-009

`.specs/features/event-feed/spec.md`'s FEED-009 requires "a single-column vertical list — no
multi-column grid" at every viewport. Per an explicit design-review request, `preview/styles.css`'s
desktop breakpoint renders the event-feed cards as a 3-column grid instead. This is intentional for
*this static sample* — it is not a resolution of FEED-009, which still governs the real `event-feed`
Web implementation. Whoever builds that feature needs to make its own call (keep single-column per
spec, or get FEED-009 formally amended) rather than copying this sample's grid unexamined.

## Reuse

These tokens are written to be dropped into the future Vite/React app unchanged — import
`tokens.css` globally and reference the custom properties from component CSS/CSS-in-JS. Do not
re-derive or hand-roll a second copy of these values when `event-feed`'s Web slice is built.

## Reference screen

`projects/6008587636717635180/screens/32c8c87d76994eaf9f42cd320c2759e5` ("Início — O que tá
rolando?") — its "Hoje" / "Este fim de semana" sections are the source of truth for the
`preview/` sample's card + date-section layout. See `.specs/features/event-feed/design.md`'s "UI
Reference" section for full detail, including the "Agent's Discretion" note that added
favorite/share icons to the card (not present in the generated screen, but required by `FEED-003`).
