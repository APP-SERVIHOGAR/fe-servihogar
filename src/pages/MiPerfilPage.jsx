import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Button, 
  Stack,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function MiPerfilPage() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [usuario, setUsuario] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [dialogEliminar, setDialogEliminar] = useState({ open: false, servicioId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {

    if (!user) return;

    // Cargar perfil
    fetch(`http://localhost:3000/perfil/${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.mensaje) setUsuario(data);
        else setUsuario(null);
      })
      .catch(err => console.error(err));

    // Cargar servicios del usuario
    fetch(`http://localhost:3000/servicio/usuario/${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        // Aseguramos que servicios siempre sea un array
        setServicios(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  }, [user]);

  const handleEliminarClick = (servicioId) => {
    setDialogEliminar({ open: true, servicioId });
  };

  const handleEliminarConfirmar = async () => {
    try {
      const response = await fetch(`http://localhost:3000/servicio/${dialogEliminar.servicioId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Servicio eliminado correctamente', severity: 'success' });
        setServicios(servicios.filter(s => s.id !== dialogEliminar.servicioId));
      } else {
        setSnackbar({ open: true, message: 'No se pudo eliminar el servicio. Intente nuevamente', severity: 'error' });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'No se pudo eliminar el servicio. Intente nuevamente', severity: 'error' });
    }
    setDialogEliminar({ open: false, servicioId: null });
  };

  if (!usuario) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Cargando perfil...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 10, px: 4, pb: 4, minHeight: "100vh", bgcolor: "#e9e9e9ee" }}>
      
      {/* Sección: Foto, nombre y botón editar */}
      <Card sx={{ mb: 3, bgcolor: "#ffffffee" }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
              sx={{ width: 80, height: 80, bgcolor: '#813ef5', fontSize: '2rem', fontWeight: 600 }}
              src={usuario.foto ? `http://localhost:3000${usuario.foto}` : undefined}
            >
              {usuario.nombre.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {usuario.nombre}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            onClick={() => navigate("/editarperfil")}
            sx={{
              bgcolor: "#813ef5",
              color: "#fff",
              textTransform: 'none',
              fontWeight: 600,
              "&:hover": { bgcolor: "#6d32d1" }
            }}
          >
            Editar perfil
          </Button>
        </CardContent>
      </Card>

      {/* Sección: Información personal */}
      <Card sx={{ mb: 3, bgcolor: "#ffffffee" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Información personal
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography><strong>Correo electrónico:</strong> {usuario.email}</Typography>
            <Typography><strong>Teléfono:</strong> {usuario.telefono}</Typography>
            <Typography><strong>Dirección:</strong> {usuario.direccion}</Typography>
            <Typography><strong>Provincia:</strong> {usuario.localidad?.provincia?.nombre}</Typography>
            <Typography><strong>Localidad:</strong> {usuario.localidad?.nombre}</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Sección: Mis servicios publicados */}
      <Card sx={{ bgcolor: "#ffffffee" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Mis servicios publicados
          </Typography>

          {(!Array.isArray(servicios) || servicios.length === 0) ? (
            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No tienes servicios publicados
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {servicios.map((servicio) => (
                <Grid size={{ xs: 12, sm: 6, md:4}} key={servicio.id}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(129, 62, 245, 0.15)',
                      transition: 'box-shadow 0.3s'
                    }
                  }}>
                    {/* Imagen */}
                    {servicio.fotos && servicio.fotos.length > 0 && (
                      <Box
                        component="img"
                        src={`http://localhost:3000${servicio.fotos[0].url}`}
                        alt={servicio.titulo}
                        sx={{
                          width: '100%',
                          height: 180,
                          objectFit: 'cover'
                        }}
                      />
                    )}

                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      {/* Categoría */}
                      <Chip 
                        label={servicio.categoria?.nombre}
                        size="small"
                        sx={{ 
                          bgcolor: "#813ef5",
                          color: "white",
                          fontWeight: 500,
                          mb: 1
                        }}
                      />

                      {/* Título */}
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {servicio.titulo}
                      </Typography>

                      {/* Descripción */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {servicio.descripcion}
                      </Typography>

                      {/* Localidad */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#813ef5' }} />
                        <Typography variant="body2" color="text.secondary">
                          {servicio.localidad?.nombre}
                        </Typography>
                      </Box>

                      {/* Botones de acción */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/editarservicio/${servicio.id}`)}
                          sx={{
                            borderColor: "#813ef5",
                            color: "#813ef5",
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: "#6d32d1",
                              bgcolor: 'rgba(129, 62, 245, 0.04)'
                            }
                          }}
                        >
                          Editar
                        </Button>

                        <IconButton
                          onClick={() => handleEliminarClick(servicio.id)}
                          sx={{
                            color: '#d32f2f',
                            '&:hover': {
                              bgcolor: 'rgba(211, 47, 47, 0.08)'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación para eliminar */}
      <Dialog
        open={dialogEliminar.open}
        onClose={() => setDialogEliminar({ open: false, servicioId: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Eliminar servicio
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar este servicio?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDialogEliminar({ open: false, servicioId: null })}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#666'
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEliminarConfirmar}
            variant="contained"
            sx={{
              bgcolor: '#d32f2f',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#b71c1c'
              }
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MiPerfilPage;
