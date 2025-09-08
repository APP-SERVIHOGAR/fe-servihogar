import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import PublicarPage from "./pages/PublicarPage";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/registro" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/publicar" element={<PublicarPage />} />
      </Routes>
    </>
  );
}

export default App;
