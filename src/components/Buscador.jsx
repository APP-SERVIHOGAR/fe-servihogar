import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, FormControl, InputLabel, Select, MenuItem, Button, Box } from "@mui/material";

function Buscador({ onSearch, variant }) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [localidades, setLocalidades] = useState([]);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState("");

  const navigate = useNavigate();

  useEffect (() => {
    fetch("http://localhost:3000/categoria")
    .then((res) => res.json())
    .then((data) => setCategorias(data))
    .catch((err) => console.error(err));
  })

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

  const handleBuscar = () => {
    const filtros = {
      nombre,
      categoria,
      localidad: localidadSeleccionada,
    }

    if (onSearch) {
      onSearch(filtros);
    }

    const queryString = new URLSearchParams(filtros).toString();
    navigate(`/verservicio?${queryString}`);
  };

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
      alignItems: "center"
    }}
    >
      <TextField
        label="¿Qué servicio necesitas?"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
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
              borderColor: "#ccc", 
            },
            "&:hover fieldset": {
              borderColor: "#999", 
            },
            "&.Mui-focused fieldset": {
              borderColor: "#5409DA", 
            },
          },}}
      />

      <FormControl sx={{ 
        minWidth: 250,
        "& .MuiInputLabel-root": {
          color: "#333",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#5409DA",
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: "#ccc" },
          "&:hover fieldset": { borderColor: "#999" },
          "&.Mui-focused fieldset": { borderColor: "#5409DA" },
        },
        }}>
        <InputLabel>Categoría</InputLabel>
        <Select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
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

      <FormControl sx={{ 
        minWidth: 250,
        "& .MuiInputLabel-root": {
          color: "#333",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#5409DA",
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: "#ccc" },
          "&:hover fieldset": { borderColor: "#999" },
          "&.Mui-focused fieldset": { borderColor: "#5409DA" },
        },
         }}>
        <InputLabel>Provincia</InputLabel>
        <Select
          value={provinciaSeleccionada}
          onChange={(e) => setProvinciaSeleccionada(e.target.value)}
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

      <FormControl sx={{ 
        minWidth: 250,
        "& .MuiInputLabel-root": {
          color: "#333",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#5409DA",
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: "#ccc" },
          "&:hover fieldset": { borderColor: "#999" },
          "&.Mui-focused fieldset": { borderColor: "#5409DA" },
        }, }}>
        <InputLabel>Localidad</InputLabel>
        <Select
          value={localidadSeleccionada}
          onChange={(e) => setLocalidadSeleccionada(e.target.value)}
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

      <Button
        variant="contained"
        sx={{ bgcolor: "#5409DA",  height: "56px",  "&:hover": { bgcolor: "#4E71FF" } }}
        onClick={handleBuscar}
      >
        Buscar
      </Button>
    </Box>
  );
}

export default Buscador;
