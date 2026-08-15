import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import { GatedActionProvider } from "../auth/GatedActionProvider";

// Any component that can reach EventCard's favorite button (EventCard itself, EventFeedPage,
// the map's MarkerPreviewCard/ClusterListPanel) needs both providers in its render tree, since
// `auth` gated the favorite toggle behind useGatedAction. Centralized here rather than
// duplicated per test file.
export function renderWithProviders(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <GatedActionProvider>{ui}</GatedActionProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}
