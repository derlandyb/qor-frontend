import { Outlet, Route, Routes } from "react-router-dom";
import { PlaceholderPage } from "./components/PlaceholderPage";
import { Layout } from "./components/nav/Layout";
import { EventDetailPage } from "./features/detail/EventDetailPage";
import { EventFeedPage } from "./features/feed/EventFeedPage";
import { FilterProvider } from "./features/filters/FilterProvider";
import { MapPage } from "./features/map/MapPage";

// Scopes the shared FilterProvider instance to only the Feed (/) + Map (/mapa) route pair — per
// map/design.md's filter-state-lifetime Tech Decision — instead of the whole app, so unrelated
// routes (details, favorites, profile) never pay for its filter-options fetches or carry its state.
function FeedAndMapLayout() {
  return (
    <FilterProvider>
      <Outlet />
    </FilterProvider>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route element={<FeedAndMapLayout />}>
          <Route path="/" element={<EventFeedPage />} />
          <Route path="/mapa" element={<MapPage />} />
        </Route>
        <Route path="/explorar" element={<PlaceholderPage title="Explorar" />} />
        <Route path="/favoritos" element={<PlaceholderPage title="Favoritos" />} />
        <Route path="/perfil" element={<PlaceholderPage title="Perfil" />} />
        <Route path="/eventos/:id" element={<EventDetailPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
