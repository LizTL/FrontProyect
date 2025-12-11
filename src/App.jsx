import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Login from "./pages/Login";
import RegistrodeUsuario from "./pages/RegistrodeUsuario";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Recepcion from "./pages/Recepcion";  
import Salida from "./pages/Salida";  
import Kardex from "./pages/Kardex";
import Proveedores from "./pages/Proveedores";
import Stock from "./pages/Stock";
import Usuarios from "./pages/Usuarios";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} /> 
        <Route path="/registro" element={<RegistrodeUsuario />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/categorias" element={<Categorias />} /> 
        <Route path="/recepcion" element={<Recepcion />} />
        <Route path="/salida" element={<Salida />} />
        <Route path="/kardex" element={<Kardex />} />
         <Route path="/proveedor" element={<Proveedores />} />
        <Route path="/stock" element={<Stock />} />
         <Route path="/usuarios" element={<Usuarios />} />

      </Routes>
    </BrowserRouter>
  );
}
