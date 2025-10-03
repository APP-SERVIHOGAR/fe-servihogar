import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import PublicarPage from "./pages/PublicarPage";
import VerServicioPage from "./pages/VerServiciosPage";
import VerDetalleServicioPage from "./pages/VerDetalleServicioPage";
import MiPerfilPage from "./pages/MiPerfilPage";
import EditarPerfilPage from "./pages/EditarPerfilPage";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/registro" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/publicar" element={<PublicarPage />} />
          <Route path="/verservicio" element={<VerServicioPage />} />
          <Route path="/servicio/:id" element={<VerDetalleServicioPage />} />
          <Route path="/perfil" element={<MiPerfilPage/>} />
          <Route path="/editarperfil" element={<EditarPerfilPage/>} />
      </Routes>
    </>
  );
}

export default App;
