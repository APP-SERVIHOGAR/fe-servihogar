import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
          <Route path="/registro" element={<AuthPage />} />
      </Routes>
    </>
  );
}

export default App;
