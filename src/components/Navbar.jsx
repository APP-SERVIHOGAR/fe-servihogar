import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" sx={{bgcolor: "#f8f9fa", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", color: "#5409DA" }}>
      <Toolbar sx={{justifyContent: "space-between", px: "30px !important" }}>
        <Typography
          variant="h6"
          component="a"
          href="/"
          sx={{
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1.5rem",
            color: "#5409DA",
            fontFamily: "'Lexend', sans-serif",
          }}
        >
          ServiCompras
        </Typography>

        <Box>
          {isAuthenticated ? (
            <>
              <Button
                variant="outlined"
                sx={{
                  color: "#5409DA",
                  ml: 1,
                  textTransform: "none",
                  border: "1px solid #5409DA", // <-- borde sólido de 1px
                  "&:hover": {
                    border: "1px solid #4E71FF", // opcional: cambia el borde al hacer hover
                    backgroundColor: "transparent" // mantener transparente al hover
                  }
                }}
                onClick={() => navigate("/perfil")}
              >
                Mi perfil
              </Button>
              <Button
                variant="contained"
                sx={{ bgcolor: "#5409DA", color: "#fff", ml: 1, textTransform: "none", "&:hover": { bgcolor: "#4E71FF" } }}
                onClick={() => navigate("/publicar")}
              >
                Publicar Servicio
              </Button>
              <Button
                sx={{ ml: 1, color: "#5409DA", textTransform: "none" }}
                onClick={logout}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button
                sx={{ ml: 1, color: "#5409DA", textTransform: "none" }}
                onClick={() => navigate("/login", { state: { isLogin: true } })}
              >
                Iniciar Sesión
              </Button>
              <Button
                variant="contained"
                sx={{ ml: 1, bgcolor: "#5409DA", color: "#fff", textTransform: "none", "&:hover": { bgcolor: "#4E71FF" } }}
                onClick={() => navigate("/registro", { state: { isLogin: false } })}
              >
                Registrarse
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
