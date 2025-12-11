import { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function RegistrodeUsuario() {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("USUARIO");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const nuevoUsuario = {
      nombre_usuario: nombreUsuario,
      correo: correo,
      password: password,
      rol: rol,
    };

    try {
      await axios.post("http://localhost:8080/api/usuarios", nuevoUsuario);

      alert("Usuario registrado correctamente");
      navigate("/"); // vuelve al login
    } catch (error) {
      console.error(error);
      alert("Error al registrar usuario");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: 420,
          p: 4,
          borderRadius: 3,
          background: "white",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="600"
          textAlign="center"
          mb={1}
          sx={{ fontFamily: "Inter" }}
        >
          Crear cuenta
        </Typography>

        <Typography
          textAlign="center"
          color="gray"
          mb={4}
          sx={{ fontFamily: "Inter" }}
        >
          Es rápido y fácil.
        </Typography>

        <form onSubmit={handleRegister}>
          <TextField
            label="Nombre de usuario"
            fullWidth
            variant="standard"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Correo"
            fullWidth
            variant="standard"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            variant="standard"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            select
            label="Rol"
            fullWidth
            variant="standard"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            sx={{ mb: 4 }}
          >
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="USUARIO">USUARIO</MenuItem>
          </TextField>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              textTransform: "none",
              background: "#1877f2",
              color: "white",
              fontWeight: 600,
              py: 1.3,
              borderRadius: 2,
              ":hover": { background: "#166fe5" },
            }}
          >
            Registrar
          </Button>
        </form>

        <Divider sx={{ my: 3 }} />

        <Button
          fullWidth
          variant="outlined"
          sx={{
            textTransform: "none",
            py: 1.2,
            borderRadius: 2,
            fontFamily: "Inter",
          }}
          onClick={() => navigate("/")}
        >
          Volver al Login
        </Button>
      </Paper>
    </Box>
  );
}
