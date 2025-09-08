import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/styleNavbar.css";

function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate(); 

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="/">ServiCompras</a>
        </div>
        <div className="navbar-buttons">
            {isAuthenticated ? (
                <>
                    <button className="btn-publicar" onClick={() => navigate("/publicar")}>
                        Publicar Servicio
                    </button>
                    <button className="btn-login" onClick={logout}>
                        Cerrar sesión
                    </button>
                </>
            ) : (
                <>
                    <button className="btn-login" onClick={() => navigate("/login", { state: { isLogin: true } })}>
                        Iniciar Sesión
                    </button>
                    <button className="btn-register" onClick={() => navigate("/registro", { state: { isLogin: false } })}>
                        Registrarse
                    </button>
                </>
            )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
