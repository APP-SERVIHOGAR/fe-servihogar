import * as React from 'react';
import Box from '@mui/material/Box';
import Buscador from '../components/Buscador';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Filtros from "../components/Filtros";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Stack,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

function VerServicioPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [servicios, setServicios] = useState([]);
  const [ordenamiento, setOrdenamiento] = useState("");

  // 🔹 Leer los parámetros iniciales desde la URL
  const params = new URLSearchParams(location.search);
  const categoriaInicial = params.get("categoria");
  const provinciaInicial = params.get("provincia");
  const localidadInicial = params.get("localidad");

  // 🔹 Manejar aplicación de filtros
  const handleFiltros = (filtros) => {
    const params = new URLSearchParams(location.search);

    // Eliminar filtros previos
    params.delete("calificacion");
    params.delete("categoriaExtra");

    // Si la búsqueda original NO fue por categoría, se pueden agregar categorías adicionales
    if (!categoriaInicial && filtros.categorias?.length) {
      filtros.categorias.forEach(c => params.append("categoriaExtra", c));
    }

    // Agregar calificaciones seleccionadas
    if (filtros.calificaciones?.length) {
      filtros.calificaciones.forEach(c => params.append("calificacion", c));
    }

    // Actualizar la URL → esto dispara el useEffect de carga
    navigate(`?${params.toString()}`);
  };

  // 🔹 Cargar servicios según los parámetros actuales de la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const filtros = {
      nombre: params.get("nombre") || "",
      categoria: params.get("categoria") || "",
      localidad: params.get("localidad") || "",
      provincia: params.get("provincia") || "",
      categoriaExtra: params.getAll("categoriaExtra") || [],
      calificacion: params.getAll("calificacion") || []
    };

    // Armar query string compatible
    const queryString = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, v));
      } else if (value) {
        queryString.append(key, value);
      }
    });

    fetch(`http://localhost:3000/servicio/buscar?${queryString.toString()}`)
      .then(res => res.json())
      .then(data => {
        console.log("📦 Datos recibidos:", data);
        setServicios(data);
      })
      .catch(err => console.error("❌ Error al cargar servicios:", err));
  }, [location.search]);

  // 🔹 Ordenamiento visual en frontend
  const serviciosVisual = () => {
    let copia = [...servicios];
    switch (ordenamiento) {
      case "calificacion":
        copia.sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0));
        break;
      case "serviciosConcretados":
        copia.sort((a, b) => (b.realizados || 0) - (a.realizados || 0));
        break;
      default:
        break;
    }
    return copia;
  };

  const handleVerDetalle = (servicioId) => {
    navigate(`/servicio/${servicioId}`);
  };

  return (
    <Box sx={{ pt: 10, px: "30px", minHeight: "100vh", bgcolor: "#e9e9e9ee" }}>
      <Buscador />

      <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
        {/* Panel lateral de filtros */}
        <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
          <Filtros
            onApply={handleFiltros}
            categoriaInicial={categoriaInicial}
            provinciaInicial={provinciaInicial}
            localidadInicial={localidadInicial}
          />
        </Box>

        {/* Resultados */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Ordenamiento */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value)}
                label="Ordenar por"
              >
                <MenuItem value="">Predeterminado</MenuItem>
                <MenuItem value="calificacion">Calificación</MenuItem>
                <MenuItem value="serviciosConcretados">Servicios concretados</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Listado */}
          {servicios.length > 0 ? (
            <Stack spacing={2}>
              {serviciosVisual().map((servicio) => {
                const calificacionNumerica = servicio.calificacion ?? 0;
                const haSidoValorado = calificacionNumerica > 0;

                return (
                  <Card
                    key={servicio.id}
                    sx={{
                      width: "100%",
                      bgcolor: "#ffffffee",
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>

                        {/* Imagen */}
                        {servicio.fotos?.length > 0 ? (
                          <Box
                            component="img"
                            src={`http://localhost:3000${servicio.fotos[0].url}`}
                            alt={servicio.titulo}
                            sx={{
                              width: 140,
                              height: 140,
                              objectFit: "cover",
                              borderRadius: 2,
                              flexShrink: 0
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 140,
                              height: 140,
                              bgcolor: "grey.200",
                              borderRadius: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Sin imagen
                            </Typography>
                          </Box>
                        )}

                        {/* Contenido */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {servicio.titulo}
                            </Typography>
                            {servicio.categoria && (
                              <Chip
                                label={servicio.categoria.nombre}
                                size="small"
                                sx={{ bgcolor: "#813ef5", color: "white", fontWeight: 500 }}
                              />
                            )}
                          </Box>

                          {/* Calificación */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Rating
                              value={calificacionNumerica}
                              precision={0.5}
                              readOnly
                              size="small"
                              sx={{ color: "#813ef5" }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              ({haSidoValorado ? calificacionNumerica.toFixed(1) : "Sin calificar"})
                            </Typography>
                          </Box>

                          {/* Descripción */}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.5
                            }}
                          >
                            {servicio.descripcion}
                          </Typography>

                          {/* Ubicación y usuario */}
                          <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#813ef5' }} />
                              <Typography variant="caption" color="text.secondary">
                                {servicio.localidad?.nombre}, {servicio.localidad?.provincia?.nombre}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PersonOutlineIcon sx={{ fontSize: 18, color: '#813ef5' }} />
                              <Typography variant="caption" color="text.secondary">
                                {servicio.usuario?.nombre}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Botón */}
                        <Box sx={{ display: "flex", alignItems: "flex-end", minHeight: 140 }}>
                          <Button
                            variant="contained"
                            onClick={() => handleVerDetalle(servicio.id)}
                            sx={{
                              bgcolor: "#813ef5",
                              '&:hover': { bgcolor: "#6d32d1" },
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 3
                            }}
                          >
                            Ver detalle
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Typography sx={{ p: 2 }}>
              No se encontraron servicios con los criterios seleccionados.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default VerServicioPage;
