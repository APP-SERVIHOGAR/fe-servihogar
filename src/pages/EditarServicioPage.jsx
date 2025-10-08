import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function EditarServicioPage() {
  const { isAuthenticated } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Formulario
  const [formulario, setFormulario] = useState({
    titulo: '',
    descripcion: '',
    area: '',
    provincia: '',
    localidad: '',
    categoria: ''
  });
  
  // Catálogos
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [dias, setDias] = useState([]);
  
  // Días seleccionados con franjas
  const [selectedDays, setSelectedDays] = useState([]);
  
  // Imágenes
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [nuevasImagenesPreview, setNuevasImagenesPreview] = useState([]);
  
  // Errores
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Cargar catálogos al montar
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        // Cargar provincias
        const resProv = await fetch('http://localhost:3000/provincia');
        const dataProv = await resProv.json();
        setProvincias(dataProv);

        // Cargar categorías
        const resCat = await fetch('http://localhost:3000/categoria');
        const dataCat = await resCat.json();
        setCategorias(dataCat);

        // Cargar días
        const resDia = await fetch('http://localhost:3000/dia');
        const dataDia = await resDia.json();
        setDias(dataDia);
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        setSnackbar({ open: true, message: 'Error al cargar datos iniciales', severity: 'error' });
      }
    };

    cargarCatalogos();
  }, []);

  // Cargar servicio
  useEffect(() => {
    const cargarServicio = async () => {
      try {
        const res = await fetch(`http://localhost:3000/servicio/${id}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Error al cargar servicio');
        }

        // Llenar formulario
        setFormulario({
          titulo: data.titulo || '',
          descripcion: data.descripcion || '',
          area: data.area || '',
          categoria: data.categoria?.id || '',
          provincia: data.provincia?.id || '',
          localidad: data.localidad?.id || ''
        });

        // Cargar días con franjas
        if (data.dias && data.dias.length > 0) {
          setSelectedDays(data.dias);
        }

        // Cargar imágenes existentes
        if (data.fotos && data.fotos.length > 0) {
          setImagenesExistentes(data.fotos);
        }

        // Cargar localidades de la provincia
        if (data.provincia?.id) {
          const locRes = await fetch(`http://localhost:3000/localidad?id_provincia=${data.provincia.id}`);
          const locData = await locRes.json();
          setLocalidades(locData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setSnackbar({ open: true, message: err.message || 'Error al cargar el servicio', severity: 'error' });
        setLoading(false);
      }
    };

    if (id) {
      cargarServicio();
    }
  }, [id]);

  // Cargar localidades cuando cambia provincia
  useEffect(() => {
    const cargarLocalidades = async () => {
      if (formulario.provincia) {
        try {
          const res = await fetch(`http://localhost:3000/localidad?id_provincia=${formulario.provincia}`);
          const data = await res.json();
          setLocalidades(data);
        } catch (error) {
          console.error('Error al cargar localidades:', error);
        }
      }
    };

    cargarLocalidades();
  }, [formulario.provincia]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProvinciaChange = (e) => {
    setFormulario(prev => ({ 
      ...prev, 
      provincia: e.target.value, 
      localidad: '' // Resetear localidad
    }));
    if (errors.provincia) {
      setErrors(prev => ({ ...prev, provincia: '' }));
    }
  };

  // Días y franjas
  const toggleDia = (dia) => {
    const existe = selectedDays.find(d => d.idDia === dia.id);
    if (existe) {
      setSelectedDays(selectedDays.filter(d => d.idDia !== dia.id));
    } else {
      setSelectedDays([...selectedDays, { 
        idDia: dia.id, 
        nombre: dia.nombre,
        franjas: [{ inicio: '', fin: '' }] 
      }]);
    }
  };

  const agregarFranja = (idDia) => {
    setSelectedDays(selectedDays.map(d => 
      d.idDia === idDia 
        ? { ...d, franjas: [...d.franjas, { inicio: '', fin: '' }] } 
        : d
    ));
  };

  const actualizarFranja = (idDia, index, campo, valor) => {
    setSelectedDays(selectedDays.map(d => {
      if (d.idDia === idDia) {
        const nuevasFranjas = [...d.franjas];
        nuevasFranjas[index][campo] = valor;
        return { ...d, franjas: nuevasFranjas };
      }
      return d;
    }));
  };

  const eliminarFranja = (idDia, index) => {
    setSelectedDays(selectedDays.map(d => {
      if (d.idDia === idDia) {
        const nuevasFranjas = d.franjas.filter((_, i) => i !== index);
        return { ...d, franjas: nuevasFranjas };
      }
      return d;
    }));
  };

  // Imágenes
  const handleMarcarImagenParaEliminar = (id) => {
    setImagenesAEliminar(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleNuevasImagenes = (e) => {
    const files = Array.from(e.target.files);
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    const invalidFiles = files.filter(f => !validFormats.includes(f.type));
    
    if (invalidFiles.length) {
      setSnackbar({ 
        open: true, 
        message: 'Solo se permiten imágenes JPG o PNG', 
        severity: 'error' 
      });
      return;
    }
    
    setNuevasImagenes(prev => [...prev, ...files]);
    
    // Crear previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevasImagenesPreview(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEliminarNuevaImagen = (index) => {
    setNuevasImagenes(prev => prev.filter((_, i) => i !== index));
    setNuevasImagenesPreview(prev => prev.filter((_, i) => i !== index));
  };

  // Validación
  const validateForm = () => {
  const newErrors = {};

  // --- Validaciones de texto ---
  const tituloRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜ.,\- ]+$/;
  const areaRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜ.,\- ]+$/;

  // Título
  if (!formulario.titulo.trim()) {
    newErrors.titulo = 'Ingrese un título para el servicio';
  } else if (formulario.titulo.length < 3) {
    newErrors.titulo = 'El título debe tener al menos 3 caracteres';
  } else if (formulario.titulo.length > 100) {
    newErrors.titulo = 'El título no puede superar los 100 caracteres';
  } else if (!tituloRegex.test(formulario.titulo)) {
    newErrors.titulo = 'El título contiene caracteres no permitidos';
  }

  // Descripción
  if (!formulario.descripcion.trim()) {
    newErrors.descripcion = 'Describa brevemente el servicio que ofrece';
  } else if (formulario.descripcion.length < 10) {
    newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
  } else if (formulario.descripcion.length > 1000) {
    newErrors.descripcion = 'La descripción no puede superar los 1000 caracteres';
  }

  // Área de servicio
  if (!formulario.area.trim()) {
    newErrors.area = 'Ingrese el área o zona en la que ofrece el servicio';
  } else if (formulario.area.length < 3) {
    newErrors.area = 'El área debe tener al menos 3 caracteres';
  } else if (formulario.area.length > 100) {
    newErrors.area = 'El área no puede superar los 100 caracteres';
  } else if (!areaRegex.test(formulario.area)) {
    newErrors.area = 'El área contiene caracteres no permitidos';
  }

  // --- Validaciones de selects ---
  if (!formulario.categoria) newErrors.categoria = 'Seleccione una categoría válida';
  if (!formulario.provincia) newErrors.provincia = 'Seleccione una provincia válida';
  if (!formulario.localidad) newErrors.localidad = 'Seleccione una ciudad válida';

  // --- Días y franjas ---
  if (selectedDays.length === 0) {
    newErrors.horarios = 'Seleccione al menos un día disponible para trabajar';
  } else {
    const franjaInvalida = selectedDays.some(d =>
      d.franjas.some(f => !f.inicio || !f.fin)
    );
    if (franjaInvalida) {
      newErrors.horarios = 'Ingrese una franja horaria válida (inicio y fin)';
    }
  }

  // --- Imágenes ---
  const totalImagenes = imagenesExistentes.filter(i => !imagenesAEliminar.includes(i.id)).length + nuevasImagenes.length;
  if (totalImagenes === 0) {
    newErrors.imagenes = 'Debe subir al menos una imagen del servicio';
  }

  // Actualizar estado de errores
  setErrors(newErrors);

  // Retornar si el formulario es válido
  return Object.keys(newErrors).length === 0;
};


  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor corrija los errores del formulario', 
        severity: 'error' 
      });
      return;
    }

    try {
      const formData = new FormData();
      
      // Campos básicos
      formData.append('titulo', formulario.titulo);
      formData.append('descripcion', formulario.descripcion);
      formData.append('area', formulario.area);
      formData.append('id_categoria', formulario.categoria);
      formData.append('id_localidad', formulario.localidad);
      
      // Días y franjas (sin incluir el nombre del día)
      const diasData = selectedDays.map(d => ({
        idDia: d.idDia,
        franjas: d.franjas
      }));
      formData.append('dias', JSON.stringify(diasData));
      
      // Imágenes a eliminar
      formData.append('imagenes_a_eliminar', JSON.stringify(imagenesAEliminar));
      
      // Nuevas imágenes
      nuevasImagenes.forEach(img => {
        formData.append('imagenes', img);
      });

      const res = await fetch(`http://localhost:3000/servicio/${id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setSnackbar({ 
          open: true, 
          message: 'Servicio actualizado exitosamente', 
          severity: 'success' 
        });
        setTimeout(() => navigate('/perfil'), 1500);
      } else {
        throw new Error(data.message || 'Error al actualizar el servicio');
      }
    } catch (err) {
      console.error('Error:', err);
      setSnackbar({ 
        open: true, 
        message: err.message || 'Error al actualizar el servicio', 
        severity: 'error' 
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress sx={{ color: '#813ef5' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      pt: 10, 
      pb: 4, 
      px: { xs: 2, sm: 4 }, 
      minHeight: "100vh", 
      bgcolor: "#f5f5f5" 
    }}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/perfil')}
            sx={{ 
              color: '#813ef5',
              bgcolor: 'white',
              '&:hover': { bgcolor: 'rgba(129, 62, 245, 0.08)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Editar Servicio
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Información básica */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a1a1a' }}>
                Información básica
              </Typography>
              <Stack spacing={3}>
                <FormControl fullWidth error={!!errors.categoria}>
                  <InputLabel>Categoría</InputLabel>
                  <Select 
                    name="categoria" 
                    value={formulario.categoria} 
                    onChange={handleChange} 
                    label="Categoría"
                  >
                    <MenuItem value="">Seleccione una categoría</MenuItem>
                    {categorias.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                    ))}
                  </Select>
                  {errors.categoria && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.categoria}
                    </Typography>
                  )}
                </FormControl>

                <TextField 
                  fullWidth 
                  label="Título del servicio" 
                  name="titulo" 
                  value={formulario.titulo} 
                  onChange={handleChange} 
                  error={!!errors.titulo} 
                  helperText={errors.titulo}
                />

                <TextField 
                  fullWidth 
                  multiline 
                  rows={4} 
                  label="Descripción detallada" 
                  name="descripcion" 
                  value={formulario.descripcion} 
                  onChange={handleChange} 
                  error={!!errors.descripcion} 
                  helperText={errors.descripcion}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a1a1a' }}>
                Ubicación y área de servicio
              </Typography>
              <Stack spacing={3}>
                <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
                  <FormControl fullWidth error={!!errors.provincia}>
                    <InputLabel>Provincia</InputLabel>
                    <Select 
                      name="provincia" 
                      value={formulario.provincia} 
                      onChange={handleProvinciaChange} 
                      label="Provincia"
                    >
                      <MenuItem value="">Seleccione provincia</MenuItem>
                      {provincias.map(p => (
                        <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                      ))}
                    </Select>
                    {errors.provincia && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.provincia}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl 
                    fullWidth 
                    disabled={!formulario.provincia} 
                    error={!!errors.localidad}
                  >
                    <InputLabel>Localidad</InputLabel>
                    <Select 
                      name="localidad" 
                      value={formulario.localidad} 
                      onChange={handleChange} 
                      label="Localidad"
                    >
                      <MenuItem value="">Seleccione localidad</MenuItem>
                      {localidades.map(l => (
                        <MenuItem key={l.id} value={l.id}>{l.nombre}</MenuItem>
                      ))}
                    </Select>
                    {errors.localidad && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.localidad}
                      </Typography>
                    )}
                  </FormControl>
                </Stack>

                <TextField 
                  fullWidth 
                  label="Área de servicio" 
                  name="area" 
                  value={formulario.area} 
                  onChange={handleChange} 
                  error={!!errors.area} 
                  helperText={errors.area || "Ej: Centro, zona norte, radio de 10km"}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Días y horarios */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a1a1a' }}>
                Días y horarios disponibles
              </Typography>
              {errors.horarios && (
                <Alert severity="error" sx={{ mb: 2 }}>{errors.horarios}</Alert>
              )}
              <Stack spacing={2}>
                {dias.map(dia => {
                  const diaSeleccionado = selectedDays.find(s => s.idDia === dia.id);
                  return (
                    <Paper 
                      key={dia.id} 
                      sx={{ 
                        p: 2, 
                        bgcolor: diaSeleccionado ? '#f8f5ff' : 'transparent', 
                        border: '1px solid #e0e0e0',
                        borderRadius: 2
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={!!diaSeleccionado} 
                            onChange={() => toggleDia(dia)}
                            sx={{
                              color: '#813ef5',
                              '&.Mui-checked': { color: '#813ef5' }
                            }}
                          />
                        }
                        label={<Typography sx={{ fontWeight: 600 }}>{dia.nombre}</Typography>}
                      />
                      {diaSeleccionado && (
                        <Box sx={{ ml: 4, mt: 2 }}>
                          {diaSeleccionado.franjas.map((f, i) => (
                            <Stack 
                              direction="row" 
                              spacing={1} 
                              alignItems="center" 
                              key={i}
                              sx={{ mb: 1 }}
                            >
                              <TextField 
                                type="time" 
                                size="small"
                                value={f.inicio} 
                                onChange={e => actualizarFranja(dia.id, i, 'inicio', e.target.value)}
                                sx={{ width: 140 }}
                              />
                              <Typography>a</Typography>
                              <TextField 
                                type="time" 
                                size="small"
                                value={f.fin} 
                                onChange={e => actualizarFranja(dia.id, i, 'fin', e.target.value)}
                                sx={{ width: 140 }}
                              />
                              <IconButton 
                                onClick={() => eliminarFranja(dia.id, i)}
                                size="small"
                                sx={{ color: '#d32f2f' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          ))}
                          <Button 
                            onClick={() => agregarFranja(dia.id)}
                            size="small"
                            sx={{ mt: 1, color: '#813ef5' }}
                          >
                            + Agregar otra franja horaria
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a1a1a' }}>
                Imágenes del servicio
              </Typography>
              {errors.imagenes && (
                <Alert severity="error" sx={{ mb: 2 }}>{errors.imagenes}</Alert>
              )}
              
              {/* Imágenes existentes */}
              {imagenesExistentes.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Imágenes actuales (haz clic para marcar/desmarcar las que quieras eliminar)
                  </Typography>
                  <Grid container spacing={2}>
                    {imagenesExistentes.map(img => {
                      const marcarEliminar = imagenesAEliminar.includes(img.id);
                      return (
                        <Grid item xs={6} sm={4} md={3} key={img.id}>
                          <Box 
                            onClick={() => handleMarcarImagenParaEliminar(img.id)}
                            sx={{ 
                              position: 'relative',
                              cursor: 'pointer',
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: marcarEliminar ? '3px solid #d32f2f' : '3px solid transparent',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }
                            }}
                          >
                            <img 
                              src={`http://localhost:3000${img.url}`}
                              alt="Servicio" 
                              style={{
                                width: '100%',
                                height: 150,
                                objectFit: 'cover',
                                display: 'block',
                                opacity: marcarEliminar ? 0.4 : 1,
                                transition: 'opacity 0.2s'
                              }} 
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150?text=Sin+imagen';
                              }}
                            />
                            {marcarEliminar && (
                              <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(211, 47, 47, 0.1)'
                              }}>
                                <Box sx={{
                                  bgcolor: '#d32f2f',
                                  color: 'white',
                                  px: 2,
                                  py: 1,
                                  borderRadius: 1,
                                  fontWeight: 600,
                                  fontSize: '0.875rem'
                                }}>
                                  Se eliminará
                                </Box>
                              </Box>
                            )}
                            <Box sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: marcarEliminar ? '#d32f2f' : 'rgba(255,255,255,0.9)',
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}>
                              {marcarEliminar ? (
                                <CloseIcon sx={{ color: 'white', fontSize: 20 }} />
                              ) : (
                                <DeleteIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {/* Nuevas imágenes */}
              {nuevasImagenesPreview.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Nuevas imágenes a agregar
                  </Typography>
                  <Grid container spacing={2}>
                    {nuevasImagenesPreview.map((src, i) => (
                      <Grid item xs={6} sm={4} md={3} key={i}>
                        <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                          <img 
                            src={src} 
                            alt="Nueva" 
                            style={{ 
                              width: '100%', 
                              height: 150, 
                              objectFit: 'cover',
                              display: 'block'
                            }} 
                          />
                          <IconButton 
                            onClick={() => handleEliminarNuevaImagen(i)} 
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8, 
                              bgcolor: 'rgba(255,255,255,0.9)',
                              '&:hover': { bgcolor: 'white' },
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                            size="small"
                          >
                            <CloseIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Botón subir */}
              <Button 
                component="label" 
                variant="outlined"
                startIcon={<AddPhotoAlternateIcon />}
                sx={{ 
                  borderColor: '#813ef5',
                  color: '#813ef5',
                  '&:hover': { 
                    borderColor: '#6b2fcf',
                    bgcolor: 'rgba(129, 62, 245, 0.04)'
                  }
                }}
              >
                Agregar más imágenes
                <input 
                  hidden 
                  type="file" 
                  multiple 
                  accept="image/jpeg,image/jpg,image/png" 
                  onChange={handleNuevasImagenes} 
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Formatos aceptados: JPG, PNG
              </Typography>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button 
              variant="outlined"
              onClick={() => navigate('/perfil')}
              sx={{ 
                borderColor: '#e0e0e0',
                color: '#666'
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={<SaveIcon />} 
              sx={{ 
                bgcolor: '#813ef5',
                px: 4,
                '&:hover': { bgcolor: '#6b2fcf' }
              }}
            >
              Guardar cambios
            </Button>
          </Stack>
        </form>
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EditarServicioPage;