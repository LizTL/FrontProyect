import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  ClickAwayListener
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Sidebar({ children }) {
  const [open, setOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const toggleDrawer = () => setOpen(!open);

  useEffect(() => {
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario") || "null");
    if (usuarioLocal) {
      setUsuario(usuarioLocal);
    } else {
      axios
        .get("http://localhost:8080/api/usuarios/1")
        .then((res) => setUsuario(res.data))
        .catch((err) => console.error(err));
    }
  }, []);

  const handleSalir = () => {
    localStorage.removeItem("usuario");
    navigate("/login"); 
  };

  const menuSections = [
  {
    title: "Inventario",
    items: [
      { text: "Productos", path: "/productos" },
      { text: "Categorías", path: "/categorias", rol: "ADMIN" }
    ]
  },
  {
    title: "Movimientos",
    items: [
      { text: "Recepción", path: "/recepcion" },
      { text: "Salida", path: "/salida" }
    ]
  },
  {
    title: "Reportes",
    items: [
      { text: "Kardex", path: "/kardex" },
      { text: "Stock", path: "/stock" }
    ]
  },
  {
    title: "Configuración",
    items: [
      { text: "Proveedor", path: "/proveedor", rol: "ADMIN" },
      { text: "Usuarios", path: "/usuarios", rol: "ADMIN" }
    ]
  }
];


  const drawerContent = (
    <Box sx={{ width: 240, backgroundColor: "#0d1440", height: "100%", color: "#e0f7fa" }}>
      <Typography
        variant="h6"
        sx={{ p: 2, textAlign: "center", fontWeight: "bold", color: "#4fc3f7" }}
      >
        Menú
      </Typography>
      <Divider sx={{ backgroundColor: "rgba(79,195,247,0.5)" }} />
      {menuSections.map((section, idx) => (
        <Box key={idx} sx={{ mt: 1 }}>
          <Typography
            sx={{
              pl: 2,
              pt: 1,
              fontSize: 12,
              color: "#81d4fa",
              fontWeight: 600,
              textTransform: "uppercase"
            }}
          >
            {section.title}
          </Typography>
          <List>
            {section.items.map((item, i) => {
              if (item.rol && usuario?.rol !== item.rol) return null;
              return (
                <ListItem
                  button
                  key={i}
                  component={Link}
                  to={item.path}
                  sx={{
                    "&:hover": { backgroundColor: "#1976d2" },
                    borderRadius: 1,
                    marginY: 0.5,
                    color: "#e0f7fa"
                  }}
                >
                  <ListItemText primary={item.text} />
                </ListItem>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Navbar */}
      <AppBar position="fixed" sx={{ backgroundColor: "#29b6f6", zIndex: 1400, boxShadow: 3 }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={toggleDrawer} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "#0d1440" }}>
            Bodega Karen
          </Typography>

          {/* Nombre de usuario con menú y flechita */}
          <ClickAwayListener onClickAway={() => setMenuUsuario(false)}>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "medium",
                  color: "#0d1440",
                  cursor: "pointer",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5
                }}
                onClick={() => setMenuUsuario(!menuUsuario)}
              >
                {usuario?.nombre_usuario || "Cliente"}
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: "6px solid #0d1440",
                    ml: 0.5
                  }}
                />
              </Typography>

              {menuUsuario && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    mt: 1,
                    bgcolor: "white",
                    color: "#000",
                    boxShadow: 3,
                    borderRadius: 1,
                    minWidth: 140,
                    zIndex: 1500
                  }}
                >
                  <Typography
                    sx={{
                      px: 2,
                      py: 1,
                      "&:hover": { bgcolor: "#f0f0f0", cursor: "pointer" }
                    }}
                    onClick={handleSalir}
                  >
                    Cerrar sesión
                  </Typography>
                </Box>
              )}
            </Box>
          </ClickAwayListener>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={open}
          onClose={toggleDrawer}
          PaperProps={{ sx: { width: 240, backgroundColor: "#0d1440", color: "#e0f7fa" } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open
          PaperProps={{ sx: { width: 240, backgroundColor: "#0d1440", color: "#e0f7fa", top: "64px" } }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: isMobile ? 0 : 30,
          backgroundColor: "#ffffff",
          minHeight: "100vh"
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
