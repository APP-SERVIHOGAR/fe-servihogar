import * as React from 'react';
import Box from '@mui/material/Box';
import Buscador from '../components/Buscador';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Filtros from "../components/Filtros";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Stack, Chip, Rating, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

function VerServicioPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [ordenamiento, setOrdenamiento] = useState("");

  // 🔹 Maneja filtros de la izquierda
  const handleFiltros = (filtros) => {
    const params = new URLSearchParams();

    if(filtros.nombre) params.set("nombre", filtros.nombre);
    if(filtros.localidad) params.set("localidad", filtros.localidad);
    if(filtros.provincia) params.set("provincia", filtros.provincia);

    if(filtros.categorias?.length > 0){
      filtros.categorias.forEach(cat => params.append("categoria", cat));
    }

    if(filtros.calificaciones?.length > 0){
      filtros.calificaciones.forEach(cal => params.append("valoracion", cal));
    }

    navigate(`?${params.toString()}`);
  };

  // 🔹 Trae servicios + promedio de valoraciones
  useEffect(() => {
    const fetchServicios = async () => {
      const params = new URLSearchParams(location.search);

      const filtros = {
        nombre: params.get("nombre") || "",
        localidad: params.get("localidad") || "",
        provincia: params.get("provincia") || "",
      };

      const categorias = params.getAll("categoria");
      const valoraciones = params.getAll("valoracion");

      const queryParams = new URLSearchParams(filtros);
      categorias.forEach(cat => queryParams.append("categoria", cat));
      valoraciones.forEach(cal => queryParams.append("valoracion", cal));

      try {
        const res = await fetch(`http://localhost:3000/servicio/buscar?${queryParams.toString()}`);
        const data = await res.json();
        const serviciosArray = Array.isArray(data) ? data : data.servicios || [];

        // 🔹 Traer promedio de valoraciones para cada servicio
        const serviciosConCalificacion = await Promise.all(
          serviciosArray.map(async (servicio) => {
            try {
              const resVal = await fetch(`http://localhost:3000/valoracion/promedio/${servicio.id}`);
              const json = await resVal.json();
              return { ...servicio, calificacion: Number(json.total_valoraciones) || 0 };
            } catch {
              return { ...servicio, calificacion: 0 };
            }
          })
        );

        setServicios(serviciosConCalificacion);
      } catch (err) {
        console.error(err);
      }
    };

    fetchServicios();
  }, [location.search]);

  const handleVerDetalle = (servicioId) => {
    navigate(`/servicio/${servicioId}`);
  };

  const serviciosVisual = () => {
    let copia = [...servicios];

    switch (ordenamiento) {
      case "calificacion":
        copia.sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0));
        break;
      case "serviciosConcretados":
        copia.sort((a, b) => (b.serviciosConcretados || 0) - (a.serviciosConcretados || 0));
        break;
      case "recientes":
        copia.sort((a, b) => new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0));
        break;
      default:
        break;
    }
    return copia;
  };

  return (
    <Box sx={{ pt: 10, pl: "30px", pr: "30px", minHeight: "100vh", bgcolor: "#e9e9e9ee" }}>
      <Buscador/>

      <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
        {/* 🔹 Filtros */}
        <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
          <Filtros onApply={handleFiltros} />
        </Box>

        {/* 🔹 Resultados */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
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
                <MenuItem value="recientes">Más recientes</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {servicios.length > 0 ? (
            <Stack spacing={2}>
              {serviciosVisual().map((servicio) => (
                <Card key={servicio.id} sx={{ width: "100%", bgcolor: "#ffffffee",
                  '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', transition: 'all 0.3s' } }}>
                  <CardContent sx={{ p: 2.5}}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>

                      {/* Imagen */}
                      {servicio.fotos?.length > 0 ? (
                        <Box component="img" src={`http://localhost:3000${servicio.fotos[0]?.url}`}
                          alt={servicio.titulo}
                          sx={{ width: 140, height: 140, objectFit: "cover", borderRadius: 2, flexShrink: 0 }}
                        />
                      ) : (
                        <Box sx={{ width: 140, height: 140, bgcolor: "grey.200", borderRadius: 2,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Typography variant="caption" color="text.secondary">Sin imagen</Typography>
                        </Box>
                      )}

                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* Título y categoría */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>{servicio.titulo}</Typography>
                          {servicio.categoria?.nombre && (
                            <Chip label={servicio.categoria?.nombre} size="small" sx={{ bgcolor: "#813ef5", color: "white", fontWeight: 500 }}/>
                          )}
                        </Box>

                        {/* Calificación */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Rating value={Number(servicio.calificacion) || 0} readOnly size="small" sx={{ color: "#813ef5" }}/>
                          <Typography variant="caption" color="text.secondary">({Number(servicio.calificacion)?.toFixed(1) || "0.0"})</Typography>
                        </Box>

                        {/* Descripción */}
                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                          {servicio.descripcion}
                        </Typography>

                        {/* Localidad y usuario */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                          {servicio.localidad?.nombre && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#813ef5' }} />
                              <Typography variant="caption" color="text.secondary">{servicio.localidad?.nombre}, {servicio.localidad?.provincia?.nombre}</Typography>
                            </Box>
                          )}
                          {servicio.usuario?.nombre && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PersonOutlineIcon sx={{ fontSize: 18, color: '#813ef5' }} />
                              <Typography variant="caption" color="text.secondary">{servicio.usuario?.nombre}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Botón detalle */}
                      <Box sx={{ display: "flex", alignItems: "flex-end", minHeight: 140 }}>
                        <Button variant="contained" onClick={() => handleVerDetalle(servicio.id)}
                          sx={{ bgcolor: "#813ef5", '&:hover': { bgcolor: "#6d32d1" }, textTransform: 'none', fontWeight: 600, px: 3 }}>
                          Ver detalle
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ p: 2 }}>No se encontraron servicios con los criterios seleccionados.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default VerServicioPage;
