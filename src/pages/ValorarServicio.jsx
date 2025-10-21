import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  Button,
  Stack,
  Alert,
  Avatar,
  TextField,
  Divider,
  CircularProgress,
  IconButton,
  Chip, 
  FormHelperText 
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../context/AuthContext';

export default function ValorarServicio() {
  const { idContratacion, idServicio } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [trato, setTrato] = useState(0);
  const [calidad, setCalidad] = useState(0);
  const [costo, setCosto] = useState(0);
  const [comentario, setComentario] = useState('');
  
  // Estado de fotos: Almacena los objetos File
  const [fotos, setFotos] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errores, setErrores] = useState({}); // Nuevo estado para errores de validación

  useEffect(() => {
    fetch(`http://localhost:3000/servicio/${idServicio}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setServicio(data);
      })
      .catch(err => {
        setError(err.message);
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [idServicio]);

  const handleValoracionChange = (name, newValue) => {
    if (error.includes('califique los tres criterios')) {
      setError(''); // Limpiar el error de calificación al interactuar con los ratings
    }
    
    if (name === 'trato') setTrato(newValue || 0);
    if (name === 'calidad') setCalidad(newValue || 0);
    if (name === 'costo') setCosto(newValue || 0);
  };

  const handleFotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar formato de imágenes (copiado del ejemplo PublicarServicio)
    const formatosValidos = ['image/jpeg', 'image/jpg', 'image/png'];
    const archivosInvalidos = files.filter(f => !formatosValidos.includes(f.type));
    
    if (archivosInvalidos.length > 0) {
      setErrores({ ...errores, fotos: "Solo se permiten imágenes en formato JPG o PNG" });
      return;
    }
      
    setFotos(prev => [...prev, ...files]);
    setErrores({ ...errores, fotos: null });
  };

  const handleDeleteFoto = (indexToDelete) => {
    setFotos(prevFotos => prevFotos.filter((_, index) => index !== indexToDelete));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (trato === 0 || calidad === 0 || costo === 0) {
      setError('Por favor, califique los tres criterios.');
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('id_servicio', idServicio);
    formData.append('id_contratacion', idContratacion);
    formData.append('id_usuario', user.id);
    formData.append('trato', trato);
    formData.append('calidad', calidad);
    formData.append('costo', costo);
    formData.append('comentario', comentario);
    
    fotos.forEach((foto) => {
      formData.append('fotos', foto);
    });
    
    try {
      const response = await fetch(`http://localhost:3000/valoracion`, {
        method: 'POST',
        body: formData,
      });
      
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      
      if (!response.ok) {
        throw new Error(data.mensaje || 'No se pudo enviar la calificación.');
      }
      setSuccess('Calificación enviada correctamente.');
      setTimeout(() => navigate('/serviciosolicitados'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ pt: 12, pb: 4, px: 4, minHeight: '100vh', bgcolor: '#e9e9e9ee' }}>
      <Card sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: '#333' }}>
            ¿Cómo fue tu experiencia?
          </Typography>

          {servicio && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, mb: 3, bgcolor: '#f7f7f7', borderRadius: 2 }}>
              <Avatar
                src={servicio.usuario.foto ? `http://localhost:3000${servicio.usuario.foto}` : undefined}
                sx={{ width: 56, height: 56 }}
              >
                {servicio.usuario.nombre?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {servicio.usuario.nombre} {servicio.usuario.apellido}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {servicio.titulo}
                </Typography>
              </Box>
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#444' }}>
                Calificá tu experiencia
              </Typography>

              <Box>
                <Typography component="legend">Calidad del servicio</Typography>
                <Rating
                  name="calidad"
                  value={calidad}
                  onChange={(event, newValue) => {
                    handleValoracionChange('calidad', newValue);
                  }}
                  size="large"
                />
              </Box>
              <Box>
                <Typography component="legend">Trato del personal</Typography>
                <Rating
                  name="trato"
                  value={trato}
                  onChange={(event, newValue) => {
                    handleValoracionChange('trato', newValue);
                  }}
                  size="large"
                />
              </Box>
              <Box>
                <Typography component="legend">Relación precio-calidad</Typography>
                <Rating
                  name="costo"
                  value={costo}
                  onChange={(event, newValue) => {
                    handleValoracionChange('costo', newValue);
                  }}
                  size="large"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <TextField
                label="Escribí tu comentario (opcional)"
                multiline
                rows={4}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                variant="outlined"
                fullWidth
              />

              {/* SECCIÓN DE CARGA DE FOTOS ADAPTADA */}
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{ 
                    borderColor: errores.fotos ? '#f44336' : undefined,
                    color: errores.fotos ? '#f44336' : undefined,
                    mb: 1 
                  }}
                >
                  Cargar fotos
                  <input type="file" hidden multiple accept="image/jpeg,image/jpg,image/png" onChange={handleFotoChange} />
                </Button>

                {errores.fotos && (
                  <FormHelperText error>{errores.fotos}</FormHelperText>
                )}

                {fotos.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {fotos.map((foto, index) => (
                      <Chip
                        key={index}
                        label={foto.name}
                        onDelete={() => handleDeleteFoto(index)}
                        color="primary"
                        sx={{ bgcolor: '#813ef5' }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
              
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{ 
                  bgcolor: '#813ef5', 
                  '&:hover': { bgcolor: '#6d32d1' },
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar calificación'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}