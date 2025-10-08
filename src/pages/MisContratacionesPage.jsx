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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useNavigate } from "react-router-dom";

export default function MisContratacionesPage() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [tab, setTab] = useState("pendiente");
  const [contrataciones, setContrataciones] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accionDialog, setAccionDialog] = useState(null);
  const [contratacionSeleccionada, setContratacionSeleccionada] = useState(null);
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
      `http://localhost:3000/contratacion/usuario/${user.id}?tipo=mis-contrataciones&estado=${tab}`
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

  const handleAbrirDialog = (accion, contratacion) => {
    setAccionDialog(accion);
    setContratacionSeleccionada(contratacion);
    setDialogOpen(true);
  };

  const handleCerrarDialog = () => {
    setDialogOpen(false);
    setAccionDialog(null);
    setContratacionSeleccionada(null);
  };

  const handleConfirmarAccion = async () => {
    if (!contratacionSeleccionada) return;

    try {
      const res = await fetch(`http://localhost:3000/contratacion/${contratacionSeleccionada.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: accionDialog })
      });

      if (res.ok) {
        // Recargar contrataciones
        setContrataciones(prev => prev.filter(c => c.id !== contratacionSeleccionada.id));
      }
    } catch (err) {
      console.error(err);
    }
    
    handleCerrarDialog();
  };

  const getTituloDialog = () => {
    switch(accionDialog) {
      case 'aceptar': return 'Aceptar solicitud';
      case 'rechazar': return 'Rechazar solicitud';
      case 'finalizar': return 'Finalizar servicio';
      default: return '';
    }
  };

  const getMensajeDialog = () => {
    switch(accionDialog) {
      case 'aceptar': 
        return '¿Estás seguro que deseas aceptar esta solicitud? El servicio pasará a estado "En curso".';
      case 'rechazar': 
        return '¿Estás seguro que deseas rechazar esta solicitud? Esta acción no se puede deshacer.';
      case 'finalizar': 
        return '¿Deseas marcar este servicio como finalizado? El servicio pasará a estado "Finalizada".';
      default: 
        return '';
    }
  };

  const getColorBotonDialog = () => {
    switch(accionDialog) {
      case 'aceptar': return { bg: "#4caf50", hover: "#45a049" };
      case 'rechazar': return { bg: "#f44336", hover: "#d32f2f" };
      case 'finalizar': return { bg: "#2196f3", hover: "#1976d2" };
      default: return { bg: "#813ef5", hover: "#6d32d1" };
    }
  };

  const getTextoBotonDialog = () => {
    switch(accionDialog) {
      case 'aceptar': return 'Aceptar';
      case 'rechazar': return 'Rechazar';
      case 'finalizar': return 'Finalizar';
      default: return 'Confirmar';
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
        Contrataciones de mis servicios
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

                {/* Información del solicitante */}
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
                    src={c.usuario?.foto ? `http://localhost:3000${c.usuario.foto}` : undefined}
                    onClick={() => navigate(`/perfil/${c.usuario?.id || c.servicio.usuario.id}`)}
                  >
                    {c.usuario?.nombre?.charAt(0).toUpperCase() || 'S'}
                  </Avatar>
                  <Box
                     sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/perfil/${c.usuario?.id || c.servicio.usuario.id}`)}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {c.usuario?.nombre || c.servicio.usuario.nombre} {c.usuario?.apellido || c.servicio.usuario.apellido}
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

                {/* Descripción del problema */}
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

                {/* Acciones según estado */}
                {c.estado === "pendiente" && (
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={() => handleAbrirDialog('aceptar', c)}
                      sx={{ 
                        bgcolor: "#4caf50", 
                        "&:hover": { bgcolor: "#45a049" },
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3
                      }}
                    >
                      Aceptar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelOutlinedIcon />}
                      onClick={() => handleAbrirDialog('rechazar', c)}
                      sx={{ 
                        borderColor: "#f44336",
                        color: "#f44336",
                        "&:hover": { 
                          borderColor: "#d32f2f",
                          bgcolor: "rgba(244, 67, 54, 0.04)"
                        },
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3
                      }}
                    >
                      Rechazar
                    </Button>
                  </Box>
                )}

                {c.estado === "en curso" && (
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<TaskAltIcon />}
                      onClick={() => handleAbrirDialog('finalizar', c)}
                      sx={{ 
                        bgcolor: "#2196f3", 
                        "&:hover": { bgcolor: "#1976d2" },
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3
                      }}
                    >
                      Finalizar
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Dialog de confirmación */}
      <Dialog
        open={dialogOpen}
        onClose={handleCerrarDialog}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {getTituloDialog()}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getMensajeDialog()}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCerrarDialog}
            sx={{ 
              textTransform: 'none',
              color: 'text.secondary'
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmarAccion}
            variant="contained"
            sx={{ 
              bgcolor: getColorBotonDialog().bg,
              "&:hover": { 
                bgcolor: getColorBotonDialog().hover
              },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {getTextoBotonDialog()}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}