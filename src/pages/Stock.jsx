import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { Table, Badge, InputGroup, Form } from "react-bootstrap";

export default function StockPage() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");


  useEffect(() => {
    axios
      .get("http://localhost:8080/api/stock")
      .then((res) => setProductos(res.data))
      .catch((err) => console.error("Error al cargar stock:", err));
  }, []);


  const productosFiltrados = productos.filter((p) =>
    (p.nombre ?? "").toLowerCase().includes(filtro.toLowerCase()) ||
    (p.cod_bar ?? "").includes(filtro)
  );

  return (
    <Sidebar>
      <div className="container py-4">
        <h2>Stock de Productos</h2>

        {/* BUSCADOR */}
        <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
          <Form.Control
            placeholder="Buscar producto o código..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </InputGroup>

        {/* TABLA */}
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Producto</th>
              <th>Código</th>
              <th>Stock Actual</th>
            </tr>
          </thead>

          <tbody>
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((p) => (
                <tr key={p.id_producto}>
                  <td>{p.nombre}</td>
                  <td>{p.cod_bar}</td>
                  <td>
                    <Badge bg={p.stock_actual > 0 ? "success" : "danger"}>
                      {p.stock_actual}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center">
                  No hay productos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Sidebar>
  );
}
