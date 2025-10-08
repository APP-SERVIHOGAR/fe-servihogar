import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { 
  Chip, 
  CircularProgress, 
  Avatar, 
  TextField, 
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Snackbar,
  Stack
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DetalleServicioPage() {
  const { id } = useParams();
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Estados para la solicitud
  const [horariosSeleccionados, setHorariosSeleccionados] = useState({});
  const [descripcionProblema, setDescripcionProblema] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetch(`http://localhost:3000/servicio/${id}`)
      .then(res => res.json())
      .then(data => {
        setServicio(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Dentro de DetalleServicioPage

// Manejo de cambios de checkboxes: guardamos los IDs de las franjas
const handleHorarioChange = (diaId, franjaId) => {
  setHorariosSeleccionados(prev => {
    const newState = { ...prev };
    if (!newState[diaId]) newState[diaId] = [];

    if (newState[diaId].includes(franjaId)) {
      newState[diaId] = newState[diaId].filter(id => id !== franjaId);
      if (newState[diaId].length === 0) delete newState[diaId];
    } else {
      newState[diaId].push(franjaId);
    }

    return newState;
  });
};

// Manejo de la solicitud
const handleSolicitar = async () => {
  console.log("=== Inicia handleSolicitar ===");
  console.log("Usuario:", user);
  console.log("Horarios seleccionados:", horariosSeleccionados);
  console.log("Descripción:", descripcionProblema);

  if (!user || !user.id) {
    console.log("No hay usuario logueado");
    setSnackbar({
      open: true,
      message: 'Debe iniciar sesión para solicitar el servicio',
      severity: 'error'
    });
    return;
  }

  // Validaciones
  const hayHorariosSeleccionados = Object.keys(horariosSeleccionados).length > 0;
  const hayDescripcion = descripcionProblema.trim() !== '';

  if (!hayHorariosSeleccionados) {
    console.log("No hay horarios seleccionados");
    setSnackbar({ open: true, message: 'Debe seleccionar al menos un día y horario', severity: 'error' });
    return;
  }

  if (!hayDescripcion) {
    console.log("No hay descripción");
    setSnackbar({ open: true, message: 'Debe completar la descripción del problema', severity: 'error' });
    return;
  }

  try {
    // Crear array de IDs de franjas seleccionadas
    const franjasSeleccionadas = [];
    Object.values(horariosSeleccionados).forEach(arr => {
      arr.forEach(franjaId => franjasSeleccionadas.push(franjaId));
    });

    console.log("Franjas a enviar:", franjasSeleccionadas);

    // Llamada al backend
    const res = await fetch('http://localhost:3000/contratacion', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}` // si manejas auth
      },
      body: JSON.stringify({
        id_usuario: user.id,
        id_servicio: servicio.id,
        descripcion: descripcionProblema,
        franjas: franjasSeleccionadas
      })
    });

    const data = await res.json();
    console.log("Respuesta del backend:", data);

    if (res.ok) {
      setSnackbar({ open: true, message: data.mensaje || 'Solicitud enviada correctamente', severity: 'success' });
      setHorariosSeleccionados({});
      setDescripcionProblema('');
    } else {
      setSnackbar({ open: true, message: data.mensaje || 'Error al enviar solicitud', severity: 'error' });
    }
  } catch (err) {
    console.error("Error en handleSolicitar:", err);
    setSnackbar({ open: true, message: 'Error al enviar solicitud', severity: 'error' });
  }
};



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#813ef5' }} />
      </Box>
    );
  }

  if (!servicio) {
    return (
      <Box sx={{ pt: 10, pl: "30px", pr: "30px" }}>
        <Typography>Servicio no encontrado</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 10, pb: 4, px: 4, minHeight: "100vh", bgcolor: "#e9e9e9ee" }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
        
        {/* COLUMNA IZQUIERDA */}
        <Box sx={{ flex: 1, width: '100%' }}>
          
          {/* Sección 1: Información básica del servicio */}
          <Card sx={{ mb: 3, bgcolor: "#ffffffee" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                {servicio.titulo}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip 
                  label={servicio.categoria.nombre}
                  sx={{ 
                    bgcolor: "#813ef5",
                    color: "white",
                    fontWeight: 500
                  }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 20, color: '#813ef5' }} />
                  <Typography variant="body1">
                    {servicio.localidad.nombre}, {servicio.localidad.provincia?.nombre || 'Córdoba'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3, bgcolor: "#ffffffee", cursor: 'pointer' }} 
                onClick={() => navigate(`/perfil/${servicio.usuario.id}`)}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    bgcolor: '#813ef5',
                    fontSize: '1.5rem',
                    fontWeight: 600
                  }}
                  src={servicio.usuario.foto ? `http://localhost:3000${servicio.usuario.foto}` : undefined}
                >
                  {servicio.usuario.nombre.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Publicado por
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {servicio.usuario.nombre}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>


          {/* Sección 3: Galería de trabajos */}
          <Card sx={{ mb: 3, bgcolor: "#ffffffee" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Galería de trabajos
              </Typography>
              
              {servicio.fotos && servicio.fotos.length > 0 ? (
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: 2 
                }}>
                  {servicio.fotos.map((foto, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={`http://localhost:3000${foto.url}`}
                      alt={`${servicio.titulo} - ${index + 1}`}
                      sx={{ 
                        width: '100%',
                        height: 150,
                        objectFit: "cover", 
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8,
                          transition: 'opacity 0.3s'
                        }
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No hay fotos disponibles
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Sección 4: Acerca del servicio */}
          <Card sx={{ mb: 3, bgcolor: "#ffffffee" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Acerca del servicio
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {servicio.descripcion}
              </Typography>
            </CardContent>
          </Card>

          {/* Sección 5: Valoraciones */}
          <Card sx={{ mb: 3, bgcolor: "#ffffffee" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Valoraciones
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No hay valoraciones todavía
              </Typography>
            </CardContent>
          </Card>

          {/* Sección 6: Comentarios */}
          <Card sx={{ mb: 3, bgcolor: "#ffffffee" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Comentarios
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No hay comentarios aún
              </Typography>
            </CardContent>
          </Card>

        </Box>

        {/* COLUMNA DERECHA */}
        <Box sx={{ width: { xs: '100%', md: '400px' }, flexShrink: 0 }}>
          
          {/* Sección: Horarios disponibles y solicitud */}
          <Card sx={{ bgcolor: "#ffffffee", position: 'sticky', top: 90 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Horarios disponibles
              </Typography>

              {/* Días y horarios desde el backend */}
              {servicio.dias && servicio.dias.length > 0 ? (
                servicio.dias.map((dia) => (
                  <Box key={dia.idDia} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#813ef5' }}>
                      {dia.nombre}
                    </Typography>
                    <FormGroup>
                      {dia.franjas.map((franja, index) => (
                        <FormControlLabel
                          key={`${dia.idDia}-${index}`}
                          control={
                            <Checkbox
                              checked={horariosSeleccionados[dia.idDia]?.includes(franja.id) || false}
                              onChange={() => handleHorarioChange(dia.idDia, franja.id)}
                              sx={{
                                color: '#813ef5',
                                '&.Mui-checked': { color: '#813ef5' },
                              }}
                            />
                          }
                          label={`${franja.inicio} - ${franja.fin}`}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No hay horarios disponibles
                </Typography>
              )}

              {/* Descripción del problema */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Descripción del problema
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Describe tu necesidad o el problema que necesitas resolver..."
                  value={descripcionProblema}
                  onChange={(e) => setDescripcionProblema(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#813ef5',
                      },
                    },
                  }}
                />
              </Box>

              {/* Botón solicitar */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleSolicitar}
                sx={{
                  mt: 3,
                  bgcolor: "#813ef5",
                  '&:hover': {
                    bgcolor: "#6d32d1"
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5
                }}
              >
                Solicitar
              </Button>
            </CardContent>
          </Card>

        </Box>
      </Stack>

      {/* Snackbar para mensajes */}
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

export default DetalleServicioPage;