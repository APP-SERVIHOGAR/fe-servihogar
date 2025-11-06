import * as React from 'react';
import Box from '@mui/material/Box';
import Buscador from '../components/Buscador';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Filtros from "../components/Filtros";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Stack, Chip, Rating, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Button from "@mui/material/Button";

function VerServicioPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [ordenamiento, setOrdenamiento] = useState("");

  const handleFiltros = (filtros) => {
    console.log("Filtros aplicados:", filtros);
  };

  // Traer servicios del backend según los filtros de URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filtros = {
      nombre: params.get("nombre") || "",
      categoria: params.get("categoria") || "",
      localidad: params.get("localidad") || "",
      provincia: params.get("provincia") || ""
    };

    const queryString = new URLSearchParams(filtros).toString();

    fetch(`http://localhost:3000/servicio/buscar?${queryString}`)
      .then(res => res.json())
      .then(data => {
        console.log("📦 Datos recibidos:", data);
        setServicios(data);
      })
      .catch(err => console.error(err));
  }, [location.search]);

  const handleVerDetalle = (servicioId) => {
    navigate(`/servicio/${servicioId}`);
  };

  // Función para mostrar visualmente los servicios según el orden seleccionado
  const serviciosVisual = () => {
    let copia = [...servicios];

    switch (ordenamiento) {
      case "calificacion":
        copia.sort((a, b) => (b.calificacion || 4) - (a.calificacion || 4));
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
        <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
          <Filtros onApply={handleFiltros} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Selector de ordenamiento arriba a la derecha */}
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
                  <CardContent sx={{ p: 2.5}}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                      
                      {/* Imagen a la izquierda */}
                      {servicio.fotos && servicio.fotos.length > 0 ? (
                        <Box
                          component="img"
                          src={`http://localhost:3000${servicio.fotos[0].url}`}
                          alt={servicio.titulo}
                          sx={{ width: 140, height: 140, objectFit: "cover", borderRadius: 2, flexShrink: 0 }}
                        />
                      ) : (
                        <Box
                          sx={{ width: 140, height: 140, bgcolor: "grey.200", borderRadius: 2,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        >
                          <Typography variant="caption" color="text.secondary">Sin imagen</Typography>
                        </Box>
                      )}

                      {/* Contenido */}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>{servicio.titulo}</Typography>
                          <Chip label={servicio.categoria.nombre} size="small" sx={{ bgcolor: "#813ef5", color: "white", fontWeight: 500 }}/>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Rating value={servicio.calificacion || 4} readOnly size="small" sx={{ color: "#813ef5" }}/>
                          <Typography variant="caption" color="text.secondary">({servicio.calificacion || 4}.0)</Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                          {servicio.descripcion}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#813ef5' }} />
                            <Typography variant="caption" color="text.secondary">{servicio.localidad.nombre}, {servicio.localidad.provincia.nombre}</Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PersonOutlineIcon sx={{ fontSize: 18, color: '#813ef5' }} />
                            <Typography variant="caption" color="text.secondary">{servicio.usuario.nombre}</Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "flex-end", minHeight: 140 }}>
                        <Button 
                          variant="contained"
                          onClick={() => handleVerDetalle(servicio.id)}
                          sx={{ bgcolor: "#813ef5", '&:hover': { bgcolor: "#6d32d1" }, textTransform: 'none', fontWeight: 600, px: 3 }}
                        >
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
