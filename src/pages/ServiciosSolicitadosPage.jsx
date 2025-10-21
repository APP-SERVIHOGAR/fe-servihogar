import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Stack,
  Button,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from "react-router-dom";

export default function ServiciosSolicitadosPage() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [tab, setTab] = useState("pendiente");
  const [contrataciones, setContrataciones] = useState([]);
  const navigate = useNavigate();

  const handleTabChange = (e, newValue) => setTab(newValue);

  useEffect(() => {
  if (!isAuthenticated) {
    navigate("/");
  }
}, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    fetch(
      `http://localhost:3000/contratacion/usuario/${user.id}?tipo=servicios-solicitados&estado=${tab}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.mensaje) setContrataciones([]);
        else setContrataciones(data);
      })
      .catch(console.error);
  }, [tab, user]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente": return "#ff9800";
      case "en curso": return "#2196f3";
      case "finalizada": return "#4caf50";
      default: return "#813ef5";
    }
  };

  return (
    <Box 
      sx={{ 
        pt: 10, 
        pb: 4, 
        px: 4, 
        minHeight: "100vh", 
        bgcolor: "#e9e9e9ee" 
      }}
    >
      {/* Header */}
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 600, 
          mb: 3,
          color: "#333"
        }}
      >
        Mis servicios solicitados
      </Typography>

      {/* Pestañas */}
      <Card sx={{ mb: 3, bgcolor: "#ffffffee" }}>
        <Tabs 
          value={tab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              minHeight: 64,
            },
            '& .Mui-selected': {
              color: '#813ef5 !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#813ef5',
              height: 3,
            },
          }}
        >
          <Tab label="Pendientes" value="pendiente" />
          <Tab label="En curso" value="en curso" />
          <Tab label="Finalizadas" value="finalizada" />
        </Tabs>
      </Card>

      {/* Lista de contrataciones */}
      {contrataciones.length === 0 ? (
        <Card sx={{ bgcolor: "#ffffffee", p: 4, textAlign: 'center' }}>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            No hay contrataciones {tab === "pendiente" ? "pendientes" : tab}.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={3}>
          {contrataciones.map((c) => (
            <Card
              key={c.id}
              sx={{
                bgcolor: "#ffffffee",
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header del servicio */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {c.servicio.titulo}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip 
                        label={c.servicio.categoria?.nombre || 'Sin categoría'}
                        size="small"
                        sx={{ 
                          bgcolor: "#813ef5",
                          color: "white",
                          fontWeight: 500
                        }}
                      />
                      
                      <Chip 
                        label={c.estado}
                        size="small"
                        sx={{ 
                          bgcolor: getEstadoColor(c.estado),
                          color: "white",
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Imagen del servicio */}
                  {c.servicio.fotos && c.servicio.fotos.length > 0 && (
                    <Box
                      component="img"
                      src={`http://localhost:3000${c.servicio.fotos[0].url}`}
                      alt={c.servicio.titulo}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        objectFit: "cover", 
                        borderRadius: 2,
                        ml: 2
                      }}
                    />
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Información del oferente */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: '#813ef5',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    src={c.servicio.usuario.foto ? `http://localhost:3000${c.servicio.usuario.foto}` : undefined}
                    onClick={() => navigate(`/perfil/${c.servicio.usuario.id}`)}
                  >
                    {c.servicio.usuario.nombre?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/perfil/${c.servicio.usuario.id}`)}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {c.servicio.usuario.nombre} {c.servicio.usuario.apellido}
                    </Typography>
                  </Box>

                  {c.servicio.localidad && (
                    <>
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#813ef5' }} />
                        <Typography variant="body2" color="text.secondary">
                          {c.servicio.localidad.nombre}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>

                {/* Descripción */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: '#813ef5' }}>
                    Descripción del problema
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.descripcion}
                  </Typography>
                </Box>

                {/* Horarios solicitados */}
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1.5, 
                      color: '#813ef5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 18 }} />
                    Horarios solicitados
                  </Typography>
                  
                  <Stack spacing={1.5}>
                    {c.franjasPorDia.map((dia) => (
                      <Box key={dia.idDia}>
                        <Typography
                          variant="caption"
                          sx={{ 
                            fontWeight: 600, 
                            color: "text.secondary",
                            mb: 0.5,
                            display: 'block'
                          }}
                        >
                          {dia.nombre || `Día ${dia.idDia}`}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {dia.franjas.map((f, i) => (
                            <Chip
                              key={i}
                              label={`${f.inicio} - ${f.fin}`}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: "#813ef5", 
                                color: "#813ef5",
                                fontWeight: 500
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Acciones */}
                {c.estado === "finalizada" && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                            // Si existe c.valoracion, el botón se deshabilita
                            disabled={!!c.valoracion} 
                            
                            // Navega solo si NO está deshabilitado
                            onClick={() => {
                                if (!c.valoracion) {
                                    navigate(`/valorarservicio/${c.id}/${c.servicio.id}`);
                                }
                            }}
                            variant="contained"
                            sx={{ 
                                bgcolor: "#813ef5", 
                                // Estilo para el hover cuando está deshabilitado
                                "&:hover": { 
                                    bgcolor: !c.valoracion ? "#6d32d1" : "rgba(129, 62, 245, 0.2)" 
                                },
                                // Estilo cuando está deshabilitado
                                "&.Mui-disabled": {
                                    bgcolor: "#c1c1c1", 
                                    color: "#666"
                                },
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3
                            }}
                        >
                            {/* Muestra un texto diferente si ya está valorado */}
                            {c.valoracion ? 'Servicio valorado' : 'Valorar servicio'}
                        </Button>
                    </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}