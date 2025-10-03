import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Button, 
  Stack 
} from '@mui/material';
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function MiPerfilPage() {
  const { user } = useContext(AuthContext); // ✅ Mueve el useContext aquí
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:3000/perfil/${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setUsuario(data))
      .catch(err => console.error(err));
  }, [user]);

  if (!usuario) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Cargando perfil...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 10, px: 4, pb: 4, minHeight: "100vh", bgcolor: "#e9e9e9ee" }}>
      
      {/* Sección: Foto, nombre y botón editar */}
      <Card sx={{ mb: 3, bgcolor: "#ffffffee" }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
                sx={{ width: 80, height: 80, bgcolor: '#813ef5', fontSize: '2rem', fontWeight: 600 }}
                src={usuario.foto ? `http://localhost:3000${usuario.foto}` : undefined}
                >
                {usuario.nombre.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {usuario.nombre}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            onClick={() => navigate("/editarperfil")}
            sx={{
              bgcolor: "#813ef5",
              color: "#fff",
              textTransform: 'none',
              "&:hover": { bgcolor: "#6d32d1" }
            }}
          >
            Editar perfil
          </Button>
        </CardContent>
      </Card>

      {/* Sección: Información personal */}
      <Card sx={{ bgcolor: "#ffffffee" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Información personal
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography><strong>Correo electrónico:</strong> {usuario.email}</Typography>
            <Typography><strong>Teléfono:</strong> {usuario.telefono}</Typography>
            <Typography><strong>Dirección:</strong> {usuario.direccion}</Typography>
            <Typography><strong>Provincia:</strong> {usuario.localidad?.provincia?.nombre}</Typography>
            <Typography><strong>Localidad:</strong> {usuario.localidad?.nombre}</Typography>
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
}

export default MiPerfilPage;
