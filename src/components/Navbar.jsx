import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetch(`http://localhost:3000/perfil/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
        .then(res => res.json())
        .then(data => setUsuario(data))
        .catch(err => console.error("Error al cargar usuario:", err));
    }
  }, [user, isAuthenticated]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    handleClose();
    if (path === "logout") {
      logout();
    } else {
      navigate(path);
    }
  };

  // Usar usuario del estado o del context como fallback
  const displayUser = usuario || user;

  return (
    <AppBar 
      position="fixed" 
      sx={{
        bgcolor: "#f8f9fa", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)", 
        color: "#5409DA"
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: "30px !important" }}>
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
              {/* Botón Mi Perfil con dropdown */}
              <Button
                variant="outlined"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={handleClick}
                sx={{
                  color: "#5409DA",
                  ml: 1,
                  textTransform: "none",
                  border: "1px solid #5409DA",
                  "&:hover": {
                    border: "1px solid #4E71FF",
                    backgroundColor: "transparent"
                  }
                }}
              >
                Mi perfil
              </Button>

              {/* Menú desplegable */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 280,
                    borderRadius: 2,
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      mx: 1,
                      '&:hover': {
                        bgcolor: 'rgba(84, 9, 218, 0.08)',
                      },
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {/* Header con foto y nombre */}
                <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={displayUser?.foto ? `http://localhost:3000${displayUser.foto}` : undefined}
                    sx={{ 
                      width: 48, 
                      height: 48,
                      bgcolor: '#5409DA'
                    }}
                  >
                    {!displayUser?.foto && (displayUser?.nombre?.[0]?.toUpperCase() || 'U')}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      {displayUser?.nombre || 'Usuario'} {displayUser?.apellido || ''}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {displayUser?.email || ''}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Opciones del menú */}
                <MenuItem onClick={() => handleMenuItemClick('/perfil')}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" sx={{ color: '#5409DA' }} />
                  </ListItemIcon>
                  <Typography variant="body2">Ver perfil</Typography>
                </MenuItem>

                <MenuItem onClick={() => handleMenuItemClick('/miscontrataciones')}>
                  <ListItemIcon>
                    <WorkIcon fontSize="small" sx={{ color: '#5409DA' }} />
                  </ListItemIcon>
                  <Typography variant="body2">Mis contrataciones</Typography>
                </MenuItem>

                <MenuItem onClick={() => handleMenuItemClick('/serviciosolicitados')}>
                  <ListItemIcon>
                    <RequestPageIcon fontSize="small" sx={{ color: '#5409DA' }} />
                  </ListItemIcon>
                  <Typography variant="body2">Servicios solicitados</Typography>
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem onClick={() => handleMenuItemClick('logout')}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                  </ListItemIcon>
                  <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                    Cerrar sesión
                  </Typography>
                </MenuItem>
              </Menu>

              {/* Botón Publicar Servicio */}
              <Button
                variant="contained"
                sx={{ 
                  bgcolor: "#5409DA", 
                  color: "#fff", 
                  ml: 1, 
                  textTransform: "none", 
                  "&:hover": { bgcolor: "#4E71FF" } 
                }}
                onClick={() => navigate("/publicar")}
              >
                Publicar Servicio
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
                sx={{ 
                  ml: 1, 
                  bgcolor: "#5409DA", 
                  color: "#fff", 
                  textTransform: "none", 
                  "&:hover": { bgcolor: "#4E71FF" } 
                }}
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