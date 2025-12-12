import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
} from "@mui/material";

export default function Login() {
  const [nombreUsuario, setNombreUsuario] = useState(""); 
  const [correo, setCorreo] = useState(""); 
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.get("http://localhost:8080/api/usuarios");
      const usuarios = res.data;

      const userFound = usuarios.find(
        (u) =>
          u.nombre_usuario.toLowerCase() === nombreUsuario.toLowerCase() &&
          u.correo.toLowerCase() === correo.toLowerCase() &&
          u.password === password
      );

      if (!userFound) {
        alert("Usuario o contraseña incorrectos");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(userFound));

      if (userFound.rol.toUpperCase() === "ADMIN") navigate("/productos");
      else navigate("/productos");

    } catch (error) {
      console.error(error);
      alert("Error al conectar con la API");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: 380,
          p: 4,
          borderRadius: 4,
          border: "1px solid #e5e5e5",
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
          Bodega Karen
        </Typography>

        <Typography
          variant="body1"
          textAlign="center"
          color="gray"
          mb={4}
          sx={{ fontFamily: "Inter" }}
        >
          Acceso a Inventario
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            label="Nombre de usuario"
            fullWidth
            variant="standard"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            sx={{ mb: 3, "& .MuiInputBase-root": { fontFamily: "Inter" } }}
          />

          <TextField
            label="Correo electrónico"
            fullWidth
            variant="standard"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            sx={{ mb: 3, "& .MuiInputBase-root": { fontFamily: "Inter" } }}
          />

          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            variant="standard"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 4, "& .MuiInputBase-root": { fontFamily: "Inter" } }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              textTransform: "none",
              background: "#111",
              color: "white",
              fontFamily: "Inter",
              fontWeight: 500,
              py: 1.4,
              borderRadius: 2,
              ":hover": { background: "#000" },
            }}
          >
            Ingresar
          </Button>
        </form>

        <Divider sx={{ my: 3 }} />

        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate("/registro")}
          sx={{
            textTransform: "none",
            background: "#42b72a",
            color: "white",
            fontFamily: "Inter",
            fontWeight: 500,
            py: 1.2,
            borderRadius: 2,
            ":hover": { background: "#36a420" },
          }}
        >
          Crear nueva cuenta
        </Button>
      </Paper>
    </Box>
  );
}
