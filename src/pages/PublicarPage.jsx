import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormHelperText,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

function PublicarServicio() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    area: "",
    provincia: "",
    localidad: "",
    categoria: "",
  });

  const { user, isAuthenticated } = useContext(AuthContext);
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [dias, setDias] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  
  // Estados para validación
  const [errores, setErrores] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMensaje, setDialogMensaje] = useState("");
  const [dialogTipo, setDialogTipo] = useState("success"); // "success" o "error"

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetch("http://localhost:3000/provincia")
      .then(res => res.json())
      .then(data => setProvincias(data));

    fetch("http://localhost:3000/categoria")
      .then(res => res.json())
      .then(data => setCategorias(data));

    fetch("http://localhost:3000/dia")
      .then(res => res.json())
      .then(data => setDias(data));
  }, []);

  useEffect(() => {
    if (formulario.provincia) {
      fetch(`http://localhost:3000/localidad?id_provincia=${formulario.provincia}`)
        .then(res => res.json())
        .then(data => setLocalidades(data));
    }
  }, [formulario.provincia]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
    // Limpiar error del campo al modificarlo
    if (errores[name]) {
      setErrores({ ...errores, [name]: null });
    }
  };

  const toggleDia = dia => {
    if (selectedDays.find(d => d.idDia === dia.id)) {
      setSelectedDays(selectedDays.filter(d => d.idDia !== dia.id));
    } else {
      setSelectedDays([...selectedDays, { idDia: dia.id, franjas: [{ inicio: '', fin: '' }] }]);
    }
    // Limpiar error de días
    if (errores.dias) {
      setErrores({ ...errores, dias: null });
    }
  };

  const agregarFranja = idDia => {
    setSelectedDays(selectedDays.map(d => 
      d.idDia === idDia ? { ...d, franjas: [...d.franjas, { inicio: '', fin: '' }] } : d
    ));
  };

  const eliminarFranja = (idDia, index) => {
    setSelectedDays(selectedDays.map(d => {
      if (d.idDia === idDia) {
        const nuevas = d.franjas.filter((_, i) => i !== index);
        return { ...d, franjas: nuevas.length > 0 ? nuevas : [{ inicio: '', fin: '' }] };
      }
      return d;
    }));
  };

  const actualizarFranja = (idDia, index, campo, valor) => {
    setSelectedDays(selectedDays.map(d => {
      if (d.idDia === idDia) {
        const nuevas = [...d.franjas];
        nuevas[index][campo] = valor;
        return { ...d, franjas: nuevas };
      }
      return d;
    }));
    // Limpiar error de franjas
    if (errores.franjas) {
      setErrores({ ...errores, franjas: null });
    }
  };

  const handleImagenes = e => {
    const files = Array.from(e.target.files);
    
    // Validar formato de imágenes
    const formatosValidos = ['image/jpeg', 'image/jpg', 'image/png'];
    const archivosInvalidos = files.filter(f => !formatosValidos.includes(f.type));
    
    if (archivosInvalidos.length > 0) {
      setErrores({ ...errores, imagenes: "Solo se permiten imágenes en formato JPG o PNG" });
      return;
    }
    
    setImagenes(files);
    setErrores({ ...errores, imagenes: null });
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar categoría
    if (!formulario.categoria) {
      nuevosErrores.categoria = "Seleccione una categoría válida";
    }

    // Validar título
    if (!formulario.titulo.trim()) {
      nuevosErrores.titulo = "Ingrese un título para el servicio";
    }

    // Validar descripción
    if (!formulario.descripcion.trim()) {
      nuevosErrores.descripcion = "Describa brevemente el servicio que ofrece";
    }

    // Validar provincia
    if (!formulario.provincia) {
      nuevosErrores.provincia = "Seleccione una provincia válida";
    }

    // Validar localidad
    if (!formulario.localidad) {
      nuevosErrores.localidad = "Seleccione una ciudad válida";
    }

    // Validar área
    if (!formulario.area.trim()) {
      nuevosErrores.area = "Ingrese el área o zona en la que ofrece el servicio";
    }

    // Validar días
    if (selectedDays.length === 0) {
      nuevosErrores.dias = "Seleccione al menos un día disponible para trabajar";
    }

    // Validar franjas horarias
    let franjasInvalidas = false;
    selectedDays.forEach(d => {
      d.franjas.forEach(f => {
        if (!f.inicio || !f.fin) {
          franjasInvalidas = true;
        } else if (f.inicio >= f.fin) {
          franjasInvalidas = true;
        }
      });
    });
    if (franjasInvalidas) {
      nuevosErrores.franjas = "Ingrese una franja horaria válida (inicio y fin)";
    }

    // Validar imágenes
    if (imagenes.length === 0) {
      nuevosErrores.imagenes = "Debe subir al menos una imagen del servicio";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!user) {
      setDialogMensaje("Debes iniciar sesión para publicar un servicio");
      setDialogTipo("error");
      setDialogOpen(true);
      return;
    }

    // Validar formulario
    if (!validarFormulario()) {
      return;
    }

    const formData = new FormData();
    Object.keys(formulario).forEach(key => formData.append(key, formulario[key]));
    formData.append('dias', JSON.stringify(selectedDays));
    formData.append('id_usuario', user.id);
    
    for (let i = 0; i < imagenes.length; i++) {
      formData.append('imagenes', imagenes[i]);
    }

    try {
      const res = await fetch("http://localhost:3000/servicio", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        setDialogMensaje("El servicio se ha publicado correctamente");
        setDialogTipo("success");
        setDialogOpen(true);
      } else {
        setDialogMensaje("No se pudo publicar el servicio. Intente nuevamente");
        setDialogTipo("error");
        setDialogOpen(true);
      }
    } catch (err) {
      console.error(err);
      setDialogMensaje("No se pudo publicar el servicio. Intente nuevamente");
      setDialogTipo("error");
      setDialogOpen(true);
    }
  };

  const handleCerrarDialog = () => {
    setDialogOpen(false);
    if (dialogTipo === "success") {
      navigate("/perfil");
    }
  };

  return (
    <Box sx={{ pt: 10, pb: 4, px: 4, minHeight: "100vh", bgcolor: "#e9e9e9ee" }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: "#333" }}>
        Publicar Servicio
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Información básica */}
          <Card sx={{ bgcolor: "#ffffffee" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#813ef5" }}>
                Información básica
              </Typography>

              <Stack spacing={2}>
                <FormControl fullWidth error={!!errores.categoria}>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    name="categoria"
                    value={formulario.categoria}
                    onChange={handleChange}
                    label="Categoría"
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {categorias.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                    ))}
                  </Select>
                  {errores.categoria && (
                    <FormHelperText>{errores.categoria}</FormHelperText>
                  )}
                </FormControl>

                <TextField
                  fullWidth
                  label="Título del servicio"
                  name="titulo"
                  value={formulario.titulo}
                  onChange={handleChange}
                  error={!!errores.titulo}
                  helperText={errores.titulo}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Descripción"
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={handleChange}
                  error={!!errores.descripcion}
                  helperText={errores.descripcion}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card sx={{ bgcolor: "#ffffffee" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#813ef5" }}>
                Ubicación
              </Typography>

              <Stack spacing={2}>
                <FormControl fullWidth error={!!errores.provincia}>
                  <InputLabel>Provincia</InputLabel>
                  <Select
                    name="provincia"
                    value={formulario.provincia}
                    onChange={handleChange}
                    label="Provincia"
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {provincias.map(p => (
                      <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                    ))}
                  </Select>
                  {errores.provincia && (
                    <FormHelperText>{errores.provincia}</FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth error={!!errores.localidad} disabled={!formulario.provincia}>
                  <InputLabel>Localidad</InputLabel>
                  <Select
                    name="localidad"
                    value={formulario.localidad}
                    onChange={handleChange}
                    label="Localidad"
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {localidades.map(l => (
                      <MenuItem key={l.id} value={l.id}>{l.nombre}</MenuItem>
                    ))}
                  </Select>
                  {errores.localidad && (
                    <FormHelperText>{errores.localidad}</FormHelperText>
                  )}
                </FormControl>

                <TextField
                  fullWidth
                  label="Área de servicio"
                  name="area"
                  value={formulario.area}
                  onChange={handleChange}
                  error={!!errores.area}
                  helperText={errores.area}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Días y horarios */}
          <Card sx={{ bgcolor: "#ffffffee" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#813ef5" }}>
                Días y horarios
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Seleccione los días disponibles:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {dias.map(d => (
                    <FormControlLabel
                      key={d.id}
                      control={
                        <Checkbox
                          checked={!!selectedDays.find(dd => dd.idDia === d.id)}
                          onChange={() => toggleDia(d)}
                          sx={{
                            color: errores.dias ? '#f44336' : '#813ef5',
                            '&.Mui-checked': { color: '#813ef5' }
                          }}
                        />
                      }
                      label={d.nombre}
                    />
                  ))}
                </Box>
                {errores.dias && (
                  <FormHelperText error>{errores.dias}</FormHelperText>
                )}
              </Box>

              {selectedDays.map(d => (
                <Card key={d.idDia} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    {dias.find(day => day.id === d.idDia)?.nombre}
                  </Typography>
                  
                  <Stack spacing={2}>
                    {d.franjas.map((f, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                          type="time"
                          label="Inicio"
                          value={f.inicio}
                          onChange={e => actualizarFranja(d.idDia, i, 'inicio', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          error={!!errores.franjas}
                        />
                        <TextField
                          type="time"
                          label="Fin"
                          value={f.fin}
                          onChange={e => actualizarFranja(d.idDia, i, 'fin', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          error={!!errores.franjas}
                        />
                        {d.franjas.length > 1 && (
                          <IconButton 
                            onClick={() => eliminarFranja(d.idDia, i)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => agregarFranja(d.idDia)}
                      sx={{ 
                        alignSelf: 'flex-start',
                        textTransform: 'none',
                        color: '#813ef5'
                      }}
                    >
                      Agregar franja horaria
                    </Button>
                  </Stack>
                </Card>
              ))}
              {errores.franjas && (
                <FormHelperText error>{errores.franjas}</FormHelperText>
              )}
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card sx={{ bgcolor: "#ffffffee" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#813ef5" }}>
                Imágenes
              </Typography>

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  borderColor: errores.imagenes ? '#f44336' : '#813ef5',
                  color: errores.imagenes ? '#f44336' : '#813ef5',
                  '&:hover': {
                    borderColor: errores.imagenes ? '#d32f2f' : '#6d32d1',
                    bgcolor: errores.imagenes ? 'rgba(244, 67, 54, 0.04)' : 'rgba(129, 62, 245, 0.04)'
                  },
                  textTransform: 'none',
                  mb: 2
                }}
              >
                Subir imágenes
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImagenes}
                />
              </Button>

              {imagenes.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  {imagenes.map((img, i) => (
                    <Chip
                      key={i}
                      label={img.name}
                      onDelete={() => setImagenes(imagenes.filter((_, idx) => idx !== i))}
                      color="primary"
                      sx={{ bgcolor: '#813ef5' }}
                    />
                  ))}
                </Box>
              )}

              {errores.imagenes && (
                <FormHelperText error>{errores.imagenes}</FormHelperText>
              )}
            </CardContent>
          </Card>

          {/* Botón submit */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#813ef5",
              '&:hover': { bgcolor: "#6d32d1" },
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5
            }}
          >
            Publicar servicio
          </Button>
        </Stack>
      </form>

      {/* Dialog de resultado */}
      <Dialog
        open={dialogOpen}
        onClose={handleCerrarDialog}
        PaperProps={{
          sx: { borderRadius: 2, textAlign: 'center', p: 2 }
        }}
      >
        <DialogContent>
          {dialogTipo === "success" ? (
            <CheckCircleIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
          ) : (
            <ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
          )}
          <DialogContentText sx={{ fontSize: '1.1rem', color: '#333' }}>
            {dialogMensaje}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleCerrarDialog}
            variant="contained"
            sx={{
              bgcolor: dialogTipo === "success" ? "#4caf50" : "#813ef5",
              '&:hover': {
                bgcolor: dialogTipo === "success" ? "#45a049" : "#6d32d1"
              },
              textTransform: 'none',
              fontWeight: 600,
              px: 4
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PublicarServicio;