import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, FormControl, InputLabel, Select, MenuItem, Button, Box, FormHelperText } from "@mui/material";

function Buscador({ onSearch, variant }) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [localidades, setLocalidades] = useState([]);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState("");
  const [error, setError] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/categoria")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/provincia")
      .then((res) => res.json())
      .then((data) => setProvincias(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (provinciaSeleccionada) {
      fetch(`http://localhost:3000/localidad?id_provincia=${provinciaSeleccionada}`)
        .then((res) => res.json())
        .then((data) => setLocalidades(data))
        .catch((err) => console.error(err));
    } else {
      setLocalidades([]);
      setLocalidadSeleccionada("");
    }
  }, [provinciaSeleccionada]);

  const validarNombre = (valor) => {
    // Si está vacío, es válido (campo opcional)
    if (!valor.trim()) {
      return true;
    }
    // Si solo tiene espacios o caracteres no alfabéticos
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!soloLetras.test(valor.trim())) {
      return false;
    }
    return true;
  };

  const handleBuscar = () => {
    // Limpiar errores previos
    setError("");
    setErrorNombre("");

    // Validar que el nombre sea válido si está completado
    if (nombre.trim() && !validarNombre(nombre)) {
      setErrorNombre("Ingrese un nombre válido.");
      return;
    }

    // Validar que al menos un campo esté completado
    const alMenosUnCampo = 
      nombre.trim() || 
      categoria || 
      provinciaSeleccionada || 
      localidadSeleccionada;

    if (!alMenosUnCampo) {
      setError("Debe ingresar al menos un criterio de búsqueda.");
      return;
    }

    const filtros = {
      nombre: nombre.trim(),
      categoria,
      localidad: localidadSeleccionada,
      provincia: provinciaSeleccionada
    };

    if (onSearch) {
      onSearch(filtros);
    }

    const queryString = new URLSearchParams(filtros).toString();
    navigate(`/verservicio?${queryString}`);
  };

  const handleNombreChange = (e) => {
    setNombre(e.target.value);
    // Limpiar errores al empezar a escribir
    if (error) setError("");
    if (errorNombre) setErrorNombre("");
  };

  const handleCategoriaChange = (e) => {
    setCategoria(e.target.value);
    if (error) setError("");
  };

  const handleProvinciaChange = (e) => {
    setProvinciaSeleccionada(e.target.value);
    if (error) setError("");
  };

  const handleLocalidadChange = (e) => {
    setLocalidadSeleccionada(e.target.value);
    if (error) setError("");
  };

  const tieneError = error !== "";
  const tieneErrorNombre = errorNombre !== "";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        bgcolor: "#ffffffee",
        p: 2,
        borderRadius: 2,
        boxShadow: 1,
        justifyContent: "center",
        alignItems: "flex-start"
      }}
    >
      <Box sx={{ minWidth: 250 }}>
        <TextField
          label="¿Qué servicio necesitas?"
          value={nombre}
          onChange={handleNombreChange}
          fullWidth
          error={tieneError || tieneErrorNombre}
          sx={{ 
            "& .MuiInputLabel-root": {
              color: "#333",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#5409DA",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: (tieneError || tieneErrorNombre) ? "#f44336" : "#ccc", 
              },
              "&:hover fieldset": {
                borderColor: (tieneError || tieneErrorNombre) ? "#f44336" : "#999", 
              },
              "&.Mui-focused fieldset": {
                borderColor: (tieneError || tieneErrorNombre) ? "#f44336" : "#5409DA", 
              },
            },
          }}
        />
        {tieneErrorNombre && (
          <FormHelperText error sx={{ ml: 1.5 }}>
            {errorNombre}
          </FormHelperText>
        )}
      </Box>

      <FormControl 
        sx={{ 
          minWidth: 250,
          "& .MuiInputLabel-root": {
            color: "#333",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#5409DA",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { 
              borderColor: tieneError ? "#f44336" : "#ccc" 
            },
            "&:hover fieldset": { 
              borderColor: tieneError ? "#f44336" : "#999" 
            },
            "&.Mui-focused fieldset": { 
              borderColor: tieneError ? "#f44336" : "#5409DA" 
            },
          },
        }}
        error={tieneError}
      >
        <InputLabel>Categoría</InputLabel>
        <Select
          value={categoria}
          onChange={handleCategoriaChange}
          label="Categoría"
        >
          <MenuItem value="">Seleccione una categoría</MenuItem>
          {categorias.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl 
        sx={{ 
          minWidth: 250,
          "& .MuiInputLabel-root": {
            color: "#333",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#5409DA",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { 
              borderColor: tieneError ? "#f44336" : "#ccc" 
            },
            "&:hover fieldset": { 
              borderColor: tieneError ? "#f44336" : "#999" 
            },
            "&.Mui-focused fieldset": { 
              borderColor: tieneError ? "#f44336" : "#5409DA" 
            },
          },
        }}
        error={tieneError}
      >
        <InputLabel>Provincia</InputLabel>
        <Select
          value={provinciaSeleccionada}
          onChange={handleProvinciaChange}
          label="Provincia"
        >
          <MenuItem value="">Seleccione una provincia</MenuItem>
          {provincias.map((prov) => (
            <MenuItem key={prov.id} value={prov.id}>
              {prov.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl 
        sx={{ 
          minWidth: 250,
          "& .MuiInputLabel-root": {
            color: "#333",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#5409DA",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { 
              borderColor: tieneError ? "#f44336" : "#ccc" 
            },
            "&:hover fieldset": { 
              borderColor: tieneError ? "#f44336" : "#999" 
            },
            "&.Mui-focused fieldset": { 
              borderColor: tieneError ? "#f44336" : "#5409DA" 
            },
          },
        }}
        error={tieneError}
      >
        <InputLabel>Localidad</InputLabel>
        <Select
          value={localidadSeleccionada}
          onChange={handleLocalidadChange}
          label="Localidad"
          disabled={!provinciaSeleccionada}
        >
          <MenuItem value="">Seleccione una localidad</MenuItem>
          {localidades.map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button
          variant="contained"
          sx={{ 
            bgcolor: "#5409DA", 
            height: "56px", 
            "&:hover": { bgcolor: "#4E71FF" } 
          }}
          onClick={handleBuscar}
        >
          Buscar
        </Button>
        {tieneError && (
          <FormHelperText error sx={{ mt: 0.5, textAlign: 'center' }}>
            {error}
          </FormHelperText>
        )}
      </Box>
    </Box>
  );
}

export default Buscador;