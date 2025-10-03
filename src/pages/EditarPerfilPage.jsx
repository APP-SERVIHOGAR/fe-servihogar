import * as React from 'react';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { 
  TextField, 
  Button,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

function EditarPerfilPage() {
  const navigate = useNavigate();
  const userId = 1; // En producción vendría de auth context
  
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Datos del perfil
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    id_provincia: '',
    id_localidad: ''
  });
  
  // Foto
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  
  // Catálogos
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  
  // Errores de validación
  const [errors, setErrors] = useState({});

  // Cargar perfil
  useEffect(() => {
    fetch(`http://localhost:3000/perfil/${userId}`)
      .then(res => res.json())
      .then(data => {
        const provinciaId = data.localidad?.provincia?.id || '';
        const localidadId = data.localidad?.id || '';
        
        setFormData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          id_provincia: provinciaId,
          id_localidad: localidadId
        });
        
        if (data.foto) {
          setFotoPreview(`http://localhost:3000${data.foto}`);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setSnackbar({ open: true, message: 'Error al cargar el perfil', severity: 'error' });
        setLoading(false);
      });
  }, [userId]);

  // Cargar provincias
  useEffect(() => {
    fetch('http://localhost:3000/provincia')
      .then(res => res.json())
      .then(data => setProvincias(data))
      .catch(err => console.error(err));
  }, []);

  // Cargar localidades cuando cambia provincia o se carga el perfil
  useEffect(() => {
    if (formData.id_provincia) {
      fetch(`http://localhost:3000/localidad?id_provincia=${formData.id_provincia}`)
        .then(res => res.json())
        .then(data => setLocalidades(data))
        .catch(err => console.error(err));
    } else {
      setLocalidades([]);
    }
  }, [formData.id_provincia]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProvinciaChange = (e) => {
    setFormData(prev => ({ 
      ...prev, 
      id_provincia: e.target.value,
      id_localidad: '' // Reset localidad al cambiar provincia
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar formato
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validFormats.includes(file.type)) {
        setSnackbar({ 
          open: true, 
          message: 'Formato de imagen no compatible. Use JPG o PNG', 
          severity: 'error' 
        });
        return;
      }
      
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Nombre
    if (!formData.nombre) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (/\d/.test(formData.nombre)) {
      newErrors.nombre = 'El nombre no puede contener números';
    }
    
    // Apellido
    if (!formData.apellido) {
      newErrors.apellido = 'El apellido es requerido';
    } else if (/\d/.test(formData.apellido)) {
      newErrors.apellido = 'El apellido no puede contener números';
    }
    
    // Teléfono
    if (formData.telefono && !/^\+?\d+$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe contener solo números';
    }
    
    // Dirección
    if (!formData.direccion) {
      newErrors.direccion = 'La dirección no puede estar vacía';
    }
    
    // Provincia y Localidad
    if (!formData.id_provincia) {
      newErrors.id_provincia = 'Seleccione una provincia';
    }
    if (!formData.id_localidad) {
      newErrors.id_localidad = 'Seleccione una localidad';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardar = async () => {
    if (!validateForm()) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor corrija los errores en el formulario', 
        severity: 'error' 
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('apellido', formData.apellido);
    formDataToSend.append('telefono', formData.telefono);
    formDataToSend.append('direccion', formData.direccion);
    formDataToSend.append('id_provincia', formData.id_provincia);
    formDataToSend.append('id_localidad', formData.id_localidad);
    
    if (fotoFile) {
      formDataToSend.append('foto', fotoFile);
    }

    try {
      const response = await fetch(`http://localhost:3000/perfil/${userId}`, {
        method: 'PUT',
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSnackbar({ 
          open: true, 
          message: 'Perfil actualizado correctamente', 
          severity: 'success' 
        });
        // Redirigir al perfil después de 1.5 segundos
        setTimeout(() => {
          navigate('/perfil');
        }, 1500);
      } else {
        setSnackbar({ 
          open: true, 
          message: data.mensaje || 'No se pudo actualizar el perfil. Intente nuevamente', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error(error);
      setSnackbar({ 
        open: true, 
        message: 'No se pudo actualizar el perfil. Intente nuevamente', 
        severity: 'error' 
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#813ef5' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 10, pb: 4, px: 4, minHeight: "100vh", bgcolor: "#e9e9e9ee" }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/perfil')}
            sx={{ 
              color: '#813ef5',
              '&:hover': { bgcolor: 'rgba(129, 62, 245, 0.08)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Editar Perfil
          </Typography>
        </Box>

        {/* Card Principal */}
        <Card sx={{ bgcolor: "#ffffffee" }}>
          <CardContent sx={{ p: 4 }}>
            
            {/* Foto de Perfil */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={fotoPreview}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: '#813ef5',
                    fontSize: '3rem',
                    fontWeight: 600
                  }}
                >
                  {!fotoPreview && formData.nombre.charAt(0).toUpperCase()}
                </Avatar>
                
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: '#813ef5',
                    color: 'white',
                    '&:hover': { bgcolor: '#6d32d1' }
                  }}
                >
                  <PhotoCameraIcon />
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFotoChange}
                  />
                </IconButton>
              </Box>
            </Box>

            {/* Formulario */}
            <Stack spacing={3}>
              
              {/* Nombre y Apellido */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                      borderColor: '#813ef5',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#813ef5',
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  error={!!errors.apellido}
                  helperText={errors.apellido}
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                      borderColor: '#813ef5',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#813ef5',
                    }
                  }}
                />
              </Stack>

              {/* Email (no editable) */}
              <TextField
                fullWidth
                label="Correo electrónico"
                name="email"
                value={formData.email}
                disabled
                sx={{ bgcolor: '#f5f5f5' }}
              />

              {/* Teléfono */}
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                error={!!errors.telefono}
                helperText={errors.telefono}
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#813ef5',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#813ef5',
                  }
                }}
              />

              {/* Dirección */}
              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                error={!!errors.direccion}
                helperText={errors.direccion}
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: '#813ef5',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#813ef5',
                  }
                }}
              />

              {/* Provincia y Localidad */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl 
                  fullWidth 
                  error={!!errors.id_provincia}
                >
                  <InputLabel>Provincia</InputLabel>
                  <Select
                    value={formData.id_provincia}
                    onChange={handleProvinciaChange}
                    label="Provincia"
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#813ef5',
                      }
                    }}
                  >
                    {provincias.map(prov => (
                      <MenuItem key={prov.id} value={prov.id}>
                        {prov.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.id_provincia && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.id_provincia}
                    </Typography>
                  )}
                </FormControl>

                <FormControl 
                  fullWidth 
                  disabled={!formData.id_provincia}
                  error={!!errors.id_localidad}
                >
                  <InputLabel>Localidad</InputLabel>
                  <Select
                    name="id_localidad"
                    value={formData.id_localidad}
                    onChange={handleInputChange}
                    label="Localidad"
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#813ef5',
                      }
                    }}
                  >
                    {localidades.map(loc => (
                      <MenuItem key={loc.id} value={loc.id}>
                        {loc.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.id_localidad && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.id_localidad}
                    </Typography>
                  )}
                </FormControl>
              </Stack>

              {/* Botón Guardar */}
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleGuardar}
                sx={{
                  bgcolor: "#813ef5",
                  '&:hover': { bgcolor: "#6d32d1" },
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  mt: 2
                }}
              >
                Guardar cambios
              </Button>
            </Stack>

          </CardContent>
        </Card>
      </Box>

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

export default EditarPerfilPage;