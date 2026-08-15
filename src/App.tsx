import { Route, Routes } from "react-router-dom";
import { PlaceholderPage } from "./components/PlaceholderPage";
import { Layout } from "./components/nav/Layout";
import { EventDetailPage } from "./features/detail/EventDetailPage";
import { EventFeedPage } from "./features/feed/EventFeedPage";
import { FilterProvider } from "./features/filters/FilterProvider";
import { MapPage } from "./features/map/MapPage";

function App() {
  return (
    <Layout>
      <FilterProvider>
        <Routes>
          <Route path="/" element={<EventFeedPage />} />
          <Route path="/explorar" element={<PlaceholderPage title="Explorar" />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/favoritos" element={<PlaceholderPage title="Favoritos" />} />
          <Route path="/perfil" element={<PlaceholderPage title="Perfil" />} />
          <Route path="/eventos/:id" element={<EventDetailPage />} />
        </Routes>
      </FilterProvider>
    </Layout>
  );
}

export default App;
