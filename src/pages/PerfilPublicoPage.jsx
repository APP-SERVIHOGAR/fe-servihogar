import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Button,
  Chip,
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';   

function PerfilPublicoPage() {

  const { userId } = useParams(); // userId desde la URL
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [servicios, setServicios] = useState([]);

useEffect(() => {
    if (!isAuthenticated) {
    navigate("/");
    }
}, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const resUser = await fetch(`http://localhost:3000/perfil/${userId}`);
        const dataUser = await resUser.json();
        setUsuario(dataUser);

        const resServicios = await fetch(`http://localhost:3000/servicio/usuario/${userId}`);
        const dataServicios = await resServicios.json();
        setServicios(Array.isArray(dataServicios) ? dataServicios : []);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#813ef5' }} />
      </Box>
    );
  }

  if (!usuario) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Usuario no encontrado</Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate(-1)}>Volver</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 10, pb: 4, px: 4, minHeight: '100vh', bgcolor: "#e9e9e9ee" }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              color: '#813ef5',
              '&:hover': { bgcolor: 'rgba(129, 62, 245, 0.08)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Perfil de {usuario.nombre} {usuario.apellido}
          </Typography>
        </Box>

        {/* Card Usuario */}
        <Card sx={{ bgcolor: "#ffffffee", mb: 4 }}>
          <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={usuario.foto ? `http://localhost:3000${usuario.foto}` : null}
              sx={{
                width: 120,
                height: 120,
                bgcolor: '#813ef5',
                fontSize: '3rem',
                fontWeight: 600
              }}
            >
              {!usuario.foto && usuario.nombre.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {usuario.nombre} {usuario.apellido}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {usuario.localidad?.provincia?.nombre}, {usuario.localidad?.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Teléfono:</strong> {usuario.telefono || 'No proporcionado'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Servicios */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Servicios publicados
        </Typography>

        {servicios.length === 0 ? (
          <Typography variant="body1">Este usuario aún no tiene servicios publicados.</Typography>
        ) : (
            <Grid container spacing={2}>
              {servicios.map((servicio) => (
                <Grid item xs={12} sm={6} md={4} key={servicio.id}>
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
                        <Button 
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/servicio/${servicio.id}`)}
                        sx={{
                            color: '#813ef5',
                            borderColor: '#813ef5',
                            '&:hover': { bgcolor: 'rgba(129, 62, 245, 0.08)', borderColor: '#813ef5' },
                            textTransform: 'none'
                        }}
                        >
                        Ver detalle
                        </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
              ))}
            </Grid>
        )}

      </Box>
    </Box>
  );
}

export default PerfilPublicoPage;
