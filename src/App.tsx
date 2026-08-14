import { Route, Routes } from "react-router-dom";
import { PlaceholderPage } from "./components/PlaceholderPage";
import { Layout } from "./components/nav/Layout";
import { EventFeedPage } from "./features/feed/EventFeedPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<EventFeedPage />} />
        <Route path="/explorar" element={<PlaceholderPage title="Explorar" />} />
        <Route path="/mapa" element={<PlaceholderPage title="Mapa" />} />
        <Route path="/favoritos" element={<PlaceholderPage title="Favoritos" />} />
        <Route path="/perfil" element={<PlaceholderPage title="Perfil" />} />
        <Route path="/eventos/:id" element={<PlaceholderPage title="Detalhes do Evento" />} />
      </Routes>
    </Layout>
  );
}

export default App;
