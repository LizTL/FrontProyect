import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { Table, Badge, InputGroup, Form, Pagination, Spinner } from "react-bootstrap";

export default function KardexPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resProd, resRec, resSal] = await Promise.all([
        axios.get("http://localhost:8080/api/productos"),
        axios.get("http://localhost:8080/api/recepciones"),
        axios.get("http://localhost:8080/api/salidas")
      ]);

      let movs = [];

      // Entradas
      resRec.data.forEach(rec => {
        rec.detalles.forEach(det => {
          movs.push({
            fecha: rec.fecha_recepcion,
            tipo: "ENTRADA",
            producto: det.producto,
            cantidad: det.cantidad,
            precio_unitario: det.precio_unitario,
            referencia: rec.numeroGuia,
            observacion: rec.observaciones
          });
        });
      });

      // Salidas
      resSal.data.forEach(sal => {
        if (sal.detalles?.length > 0) {
          sal.detalles.forEach(det => {
            movs.push({
              fecha: sal.fechaSalida,
              tipo: "SALIDA",
              producto: det.producto,
              cantidad: det.cantidad,
              precio_unitario: det.precio_unitario,
              referencia: sal.numero_salida || "-",
              observacion: sal.motivo || "-"
            });
          });
        } else {
          // Movimiento genérico para mostrar la salida aunque no tenga detalles
          movs.push({
            fecha: sal.fechaSalida,
            tipo: "SALIDA",
            producto: {
              id_producto: null,
              nombre: "Producto no especificado",
              codBar: "-",
              categoria: { nombre: "-" },
              precio_unitario: 0
            },
            cantidad: 0,
            precio_unitario: 0,
            referencia: sal.numero_salida || "-",
            observacion: sal.motivo || "-"
          });
        }
      });

      // Ordenar por fecha
      movs.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      // Calcular stock acumulado
      const stockMap = {};
      const movsConStock = movs.map(m => {
        const id = m.producto?.id_producto ?? "sin_id";
        if (!stockMap[id]) stockMap[id] = 0;

        if (m.tipo === "ENTRADA") stockMap[id] += m.cantidad;
        if (m.tipo === "SALIDA") stockMap[id] -= m.cantidad;

        return {
          ...m,
          stock_acumulado: stockMap[id],
          valor_total: stockMap[id] * (m.precio_unitario ?? m.producto?.precio_unitario ?? 0)
        };
      });

      setMovimientos(movsConStock);
    } catch (err) {
      console.error(err);
      alert("Error al cargar datos del Kardex. Revisa tu backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const movimientosFiltrados = movimientos.filter(m =>
    (m.producto?.nombre ?? "").toLowerCase().includes(filtro.toLowerCase()) ||
    (m.tipo ?? "").toLowerCase().includes(filtro.toLowerCase())
  );

  const totalPages = Math.ceil(movimientosFiltrados.length / perPage);
  const paginatedMovimientos = movimientosFiltrados.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <Sidebar>
      <div className="container py-4">
        <h2>Kardex de Productos</h2>

        <InputGroup className="mb-3" style={{ maxWidth: "400px" }}>
          <Form.Control
            placeholder="Buscar producto o tipo..."
            value={filtro}
            onChange={e => { setFiltro(e.target.value); setPage(1); }}
          />
        </InputGroup>

        {loading ? (
          <div className="text-center my-5"><Spinner animation="border" /> Cargando...</div>
        ) : (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Código</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Precio Unitario (S/)</th>
                <th>Stock Acumulado</th>
                <th>Valor Total (S/)</th>
                <th>Referencia</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMovimientos.length > 0 ? (
                paginatedMovimientos.map((m, i) => (
                  <tr key={i}>
                    <td>{new Date(m.fecha).toLocaleDateString()}</td>
                    <td><Badge bg={m.tipo === "ENTRADA" ? "success" : "danger"}>{m.tipo}</Badge></td>
                    <td>{m.producto?.nombre}</td>
                    <td>{m.producto?.codBar}</td>
                    <td>{m.producto?.categoria?.nombre}</td>
                    <td>{m.cantidad}</td>
                    <td>{(m.precio_unitario ?? m.producto?.precio_unitario ?? 0).toFixed(2)}</td>
                    <td>{m.stock_acumulado}</td>
                    <td>{(m.valor_total ?? 0).toFixed(2)}</td>
                    <td>{m.referencia ?? "-"}</td>
                    <td>{m.observacion ?? "-"}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={11} className="text-center">No hay movimientos registrados.</td></tr>
              )}
            </tbody>
          </Table>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <Form.Select
            style={{ width: 100 }}
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </Form.Select>

          <Pagination>
            <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item key={i} active={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</Pagination.Item>
            ))}
            <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
          </Pagination>
        </div>
      </div>
    </Sidebar>
  );
}
