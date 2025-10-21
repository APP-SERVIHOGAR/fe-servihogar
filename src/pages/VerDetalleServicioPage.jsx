import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
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
  Stack,
  Rating,
  Divider
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DetalleServicioPage() {
  const { id } = useParams();
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // ESTADOS PARA VALORACIONES
  const [promedios, setPromedios] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  
  // ESTADOS NUEVOS PARA RESPUESTA
  const [respuestaAbierta, setRespuestaAbierta] = useState(null); // ID de la valoración que se responde
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  
  // Estados para la solicitud
  const [horariosSeleccionados, setHorariosSeleccionados] = useState({});
  const [descripcionProblema, setDescripcionProblema] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // -----------------------------------------------------------
  // FUNCIONES DE FETCHING
  // -----------------------------------------------------------

  // Función para recargar la lista de comentarios
  const fetchComentarios = useCallback(() => {
    fetch(`http://localhost:3000/valoracion/comentarios/${id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setComentarios(data);
        } else {
          setComentarios([]); 
        }
      })
      .catch(err => {
        console.error("Error al cargar comentarios:", err);
      });
  }, [id]);

  // FETCH PRINCIPAL DEL SERVICIO
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

  // FETCH DE PROMEDIOS DE VALORACIÓN
  useEffect(() => {
    fetch(`http://localhost:3000/valoracion/promedio/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.promedios) {
          setPromedios(data.promedios);
        } else if (data.trato) {
          setPromedios(data);
        } else {
          setPromedios({ trato: 0, calidad: 0, costo: 0, total_valoraciones: 0, mensaje: data.mensaje || 'Sin valoraciones' });
        }
      })
      .catch(err => {
        console.error("Error al cargar promedios:", err);
      });
  }, [id]);

  // FETCH DE COMENTARIOS (Usa useCallback)
  useEffect(() => {
    fetchComentarios();
  }, [fetchComentarios]);


  // -----------------------------------------------------------
  // MANEJO DE RESPUESTA A COMENTARIO (HU-021)
  // -----------------------------------------------------------

  const handleEnviarRespuesta = async (idValoracion) => {
    if (textoRespuesta.trim() === '') {
        setSnackbar({ open: true, message: 'La respuesta no puede estar vacía.', severity: 'error' });
        return;
    }
    
    setEnviandoRespuesta(true);
        
    try {
        const res = await fetch(`http://localhost:3000/valoracion/responder/${idValoracion}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idUsuarioOferente: user.id, // Debe ser el dueño del servicio logueado
                respuesta: textoRespuesta
            })
        });

        const data = await res.json();
        
        if (res.ok) {
            setSnackbar({ open: true, message: data.mensaje || 'Respuesta publicada correctamente.', severity: 'success' });
            
            // Limpiar formulario y cerrar
            setRespuestaAbierta(null);
            setTextoRespuesta('');
            
            // Recargar comentarios para mostrar la nueva respuesta
            fetchComentarios();
        } else {
            setSnackbar({ open: true, message: data.mensaje || 'No se pudo publicar la respuesta.', severity: 'error' });
        }
    } catch (err) {
        setSnackbar({ open: true, message: 'Error de red al enviar la respuesta.', severity: 'error' });
    } finally {
        setEnviandoRespuesta(false);
    }
};

  // -----------------------------------------------------------
  // MANEJO DE SOLICITUD (Sin cambios)
  // -----------------------------------------------------------

  const handleHorarioChange = (diaId, franjaId) => {
    // ... (lógica sin cambios)
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

  const handleSolicitar = async () => {
    if (!user || !user.id) {
      setSnackbar({ open: true, message: 'Debe iniciar sesión para solicitar el servicio', severity: 'error' });
      return;
    }
    // ... (resto de la lógica handleSolicitar sin cambios)
    const hayHorariosSeleccionados = Object.keys(horariosSeleccionados).length > 0;
    const hayDescripcion = descripcionProblema.trim() !== '';

    if (!hayHorariosSeleccionados) {
        setSnackbar({ open: true, message: 'Debe seleccionar al menos un día y horario', severity: 'error' });
        return;
    }

    if (!hayDescripcion) {
        setSnackbar({ open: true, message: 'Debe completar la descripción del problema', severity: 'error' });
        return;
    }

    try {
        const franjasSeleccionadas = [];
        Object.values(horariosSeleccionados).forEach(arr => {
            arr.forEach(franjaId => franjasSeleccionadas.push(franjaId));
        });

        const res = await fetch('http://localhost:3000/contratacion', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                id_usuario: user.id,
                id_servicio: servicio.id,
                descripcion: descripcionProblema,
                franjas: franjasSeleccionadas
            })
        });

        const data = await res.json();

        if (res.ok) {
            setSnackbar({ open: true, message: data.mensaje || 'Solicitud enviada correctamente', severity: 'success' });
            setHorariosSeleccionados({});
            setDescripcionProblema('');
        } else {
            setSnackbar({ open: true, message: data.mensaje || 'Error al enviar solicitud', severity: 'error' });
        }
    } catch (err) {
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

  // Función auxiliar para calcular el promedio de las 3 métricas
  const getOverallRating = () => {
    if (!promedios || promedios.total_valoraciones === 0) return 0;
    
    const trato = parseFloat(promedios.trato || 0);
    const calidad = parseFloat(promedios.calidad || 0);
    const costo = parseFloat(promedios.costo || 0);
    
    return (trato + calidad + costo) / 3;
  }

  // Variable para verificar si el usuario logueado es el dueño del servicio
  const esOferente = user && servicio && user.id === servicio.usuario.id;

  return (
    <Box sx={{ pt: 10, pb: 4, px: 4, minHeight: "100vh", bgcolor: "#e9e9e9ee" }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
        
        {/* COLUMNA IZQUIERDA */}
        <Box sx={{ flex: 1, width: '100%' }}>
          
          {/* Sección 1: Información básica del servicio */}
          {/* ... (sin cambios) */}
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

          {/* Sección 2: Información del oferente */}
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
          {/* ... (sin cambios) */}
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
          {/* ... (sin cambios) */}
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


          {/* Sección 5: Valoraciones (MOSTRANDO PROMEDIOS) */}
          <Card sx={{ mb: 3, bgcolor: "#ffffffee" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Valoraciones y Estadísticas
              </Typography>
              
              {promedios && promedios.total_valoraciones > 0 ? (
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    Calificación General: {getOverallRating().toFixed(2)} ({promedios.total_valoraciones} {promedios.total_valoraciones === 1 ? 'valoración' : 'valoraciones'})
                  </Typography>
                  <Rating 
                    value={getOverallRating()} 
                    readOnly 
                    precision={0.1}
                    sx={{ mb: 2 }}
                  />

                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Trato:
                      <Rating value={parseFloat(promedios.trato)} readOnly precision={0.1} size="small" />
                      ({promedios.trato})
                    </Typography>
                    <Typography variant="body2">
                      Calidad:
                      <Rating value={parseFloat(promedios.calidad)} readOnly precision={0.1} size="small" />
                        ({promedios.calidad}) 
                    </Typography>
                    <Typography variant="body2">
                      Costo:
                      <Rating value={parseFloat(promedios.costo)} readOnly precision={0.1} size="small" />
                      ({promedios.costo})
                    </Typography>
                  </Stack>
                  <Stack sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      Cantidad de servicios completados: 
                      {promedios.servicios_completados}
                    </Typography>
                  </Stack>

                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Este servicio aún no tiene valoraciones.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Sección 6: Comentarios (MOSTRANDO COMENTARIOS Y RESPUESTAS) */}
          <Card sx={{ mb: 3, bgcolor: "#ffffffee" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Comentarios ({comentarios.length})
              </Typography>

              {comentarios.length > 0 ? (
                <Stack spacing={3}>
                  {comentarios.map((comentario, index) => (
                    <Box key={comentario.id || index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar 
                          src={comentario.usuario.foto ? `http://localhost:3000${comentario.usuario.foto}` : undefined}
                          sx={{ width: 40, height: 40, bgcolor: '#813ef5' }}
                        >
                          {comentario.usuario.nombre.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {comentario.usuario.nombre} {comentario.usuario.apellido}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Calificación: {((parseFloat(comentario.trato) + parseFloat(comentario.calidad) + parseFloat(comentario.costo)) / 3.0).toFixed(1)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 1 }}>
                        {comentario.comentario}
                      </Typography>

                      {/* Muestra las fotos de la valoración, si existen */}
                      {comentario.url_foto && (
                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mb: 1 }}>
                            <Box
           
                              component="img"
                              src={`http://localhost:3000${comentario.url_foto}`}
                              alt={`Evidencia de ${comentario.usuario.nombre}`}
                              sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                            />

                        </Box>
                      )}
                      
                      {/* NUEVA SECCIÓN: RESPUESTA DEL OFERENTE */}
                      {comentario.respuesta_oferente && (
                        <Box sx={{ mt: 1.5, ml: 5, p: 1.5, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#813ef5', display: 'block', mb: 0.5 }}>
                            Respuesta del Oferente
                          </Typography>
                          <Typography variant="body2">{comentario.respuesta_oferente}</Typography>
                        </Box>
                      )}

                      {/* BOTÓN RESPONDER (Visible solo para el dueño del servicio y si no ha respondido) */}
                      {(esOferente && !comentario.respuesta_oferente) && (
                        <Box sx={{ mt: 1, ml: 5 }}>
                          <Button 
                              size="small"
                              onClick={() => {
                                setRespuestaAbierta(comentario.id);
                                setTextoRespuesta(''); // Limpiar texto si abre otro comentario
                            }}
                              sx={{ textTransform: 'none', color: '#813ef5' }}
                          >
                            Responder
                          </Button>
                        </Box>
                      )}

                      {/* FORMULARIO DE RESPUESTA */}
                      {respuestaAbierta === comentario.id && (
                        <Box sx={{ mt: 1, ml: 5, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                          <TextField
                              fullWidth
                              multiline
                              rows={2}
                              placeholder="Escribe tu respuesta..."
                              value={textoRespuesta}
                              onChange={(e) => setTextoRespuesta(e.target.value)}
                              sx={{ mb: 1 }}
                          />
                          <Button 
                              variant="contained" 
                              size="small"
                              onClick={() => handleEnviarRespuesta(comentario.id)}
                              disabled={enviandoRespuesta}
                              sx={{ 
                                  textTransform: 'none', 
                                  bgcolor: '#813ef5', 
                                  '&:hover': { bgcolor: '#6d32d1' } 
                              }}
                          >
                            {enviandoRespuesta ? 'Publicando...' : 'Publicar respuesta'}
                          </Button>
                        </Box>
                      )}
                      
                      {index < comentarios.length - 1 && <Divider sx={{ my: 2 }} />}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Este servicio aún no tiene comentarios.
                </Typography>
              )}
            </CardContent>
          </Card>

        </Box>

        {/* COLUMNA DERECHA - Horarios y Solicitud (SIN CAMBIOS) */}
        <Box sx={{ width: { xs: '100%', md: '400px' }, flexShrink: 0 }}>
            {/* ... Contenido de la columna derecha sin cambios ... */}
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