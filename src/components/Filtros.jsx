import React, { useState, useEffect } from "react";
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

function Filtros({ onApply, categoriaInicial, provinciaInicial, localidadInicial }) {
  const [categorias, setCategorias] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [calificacionesSeleccionadas, setCalificacionesSeleccionadas] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/categoria")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error(err));
  }, []);

  const handleCategoriaChange = (id) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleCalificacionChange = (valor) => {
    setCalificacionesSeleccionadas((prev) =>
      prev.includes(valor) ? prev.filter((c) => c !== valor) : [...prev, valor]
    );
  };

  const handleAplicar = () => {
    if (onApply) {
      onApply({
        categorias: categoriasSeleccionadas,
        calificaciones: calificacionesSeleccionadas,
      });
    }
  };

  // 👇 si ya se buscó por categoría en la página inicial, ocultamos este bloque
  const mostrarCategorias = !categoriaInicial;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 2,
        borderRadius: 2,
        bgcolor: "#ffffffee",
        boxShadow: 1,
        minWidth: 200,
      }}
    >
      {mostrarCategorias && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Categorías:
          </Typography>
          <FormGroup>
            {categorias.map((cat) => (
              <FormControlLabel
                key={cat.id}
                control={
                  <Checkbox
                    checked={categoriasSeleccionadas.includes(cat.id)}
                    onChange={() => handleCategoriaChange(cat.id)}
                    sx={{
                      color: "#813ef5",
                      "&.Mui-checked": { color: "#813ef5" },
                    }}
                  />
                }
                label={cat.nombre}
              />
            ))}
          </FormGroup>
        </Box>
      )}

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Calificación:
        </Typography>
        <FormGroup>
          {[5, 4, 3, 2, 1].map((valor) => (
            <Button
              key={valor}
              variant={
                calificacionesSeleccionadas.includes(valor)
                  ? "contained"
                  : "outlined"
              }
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                mb: 0.5,
                bgcolor: calificacionesSeleccionadas.includes(valor)
                  ? "#813ef5"
                  : "transparent",
                color: calificacionesSeleccionadas.includes(valor)
                  ? "#fff"
                  : "#813ef5",
                borderColor: "#813ef5",
                "&:hover": {
                  bgcolor: "#5409DA",
                  color: "#fff",
                  borderColor: "#813ef5",
                },
              }}
              onClick={() => handleCalificacionChange(valor)}
              startIcon={Array.from({ length: valor }).map((_, i) => (
                <StarIcon key={i} fontSize="small" />
              ))}
            >
              {valor} estrellas
            </Button>
          ))}
        </FormGroup>
      </Box>

      <Button
        variant="contained"
        sx={{
          bgcolor: "#813ef5",
          "&:hover": { bgcolor: "#5409DA" },
          mt: 1,
        }}
        onClick={handleAplicar}
      >
        Aplicar filtros
      </Button>
    </Box>
  );
}

export default Filtros;
