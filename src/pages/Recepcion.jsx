import { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "../styles/recepcion.css";

export default function RecepcionesPage() {
  const [recepciones, setRecepciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);

  const [cabecera, setCabecera] = useState({
    numeroGuia: "",
    fecha_recepcion: "",
    observaciones: "",
    proveedor: 0, // id del proveedor
    usuario: { id_usuario: 1 },
  });

  const [detalles, setDetalles] = useState([]);
  const [detalleTemp, setDetalleTemp] = useState({
    producto: 0, // id del producto
    cantidad: "",
    precio_unitario: "",
  });

  // --- Cargar datos de API ---
  useEffect(() => {
    cargarRecepciones();
    cargarProveedores();
    cargarProductos();
  }, []);

  const cargarRecepciones = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/recepciones");
      setRecepciones(res.data);
    } catch (err) {
      console.error("Error al cargar recepciones:", err);
    }
  };

  const cargarProveedores = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/proveedores");
      setProveedores(res.data);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/productos");
      setProductos(res.data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  // --- Agregar detalle temporal ---
  const agregarDetalle = () => {
    if (!detalleTemp.producto || !detalleTemp.cantidad || !detalleTemp.precio_unitario) {
      alert("Completa todos los campos del detalle");
      return;
    }

    const prod = productos.find(p => p.id_producto === detalleTemp.producto);

    setDetalles([
      ...detalles,
      {
        producto: prod,
        cantidad: Number(detalleTemp.cantidad),
        precio_unitario: Number(detalleTemp.precio_unitario),
      },
    ]);

    setDetalleTemp({ producto: 0, cantidad: "", precio_unitario: "" });
  };

  // --- Guardar recepción ---
  const guardarRecepcion = async () => {
    if (!cabecera.numeroGuia || !cabecera.fecha_recepcion || !cabecera.proveedor || detalles.length === 0) {
      alert("Completa todos los campos de cabecera y agrega al menos un detalle");
      return;
    }

   
    const detallesValidos = detalles.filter(d => d.producto && d.cantidad && d.precio_unitario);
const payload = {
  numeroGuia: cabecera.numeroGuia,
  fecha_recepcion: cabecera.fecha_recepcion,
  observaciones: cabecera.observaciones,
  proveedor: { id_proveedor: Number(cabecera.proveedor) },
  usuario: { id_usuario: 1 },
  detalles: detallesValidos.map(d => ({
    producto: { id_producto: d.producto.id_producto },
    cantidad: d.cantidad,
    precio_unitario: d.precio_unitario,
  })),
};


    try {
      await axios.post("http://localhost:8080/api/recepciones", payload);
      alert("Recepción registrada correctamente");
      setShowModal(false);
      setCabecera({ numeroGuia: "", fecha_recepcion: "", observaciones: "", proveedor: 0, usuario: { id_usuario: 1 } });
      setDetalles([]);
      cargarRecepciones();
    } catch (err) {
      console.error("Error al registrar recepción:", err);
      alert("Error al registrar recepción. Revisa la consola.");
    }
  };

  return (
    <Sidebar>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Recepciones</h2>
          <Button variant="success" onClick={() => setShowModal(true)}>Nueva Recepción</Button>
        </div>

        {/* TABLA DE RECEPCIONES */}
        <Table bordered striped hover responsive className="shadow">
          <thead className="table-dark">
            <tr>
              <th>Guía</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Usuario</th>
              <th>Observaciones</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {recepciones.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No hay recepciones registradas.</td>
              </tr>
            ) : (
              recepciones.map(rec => (
                <tr key={rec.idRecepcion}>
                  <td>{rec.numeroGuia}</td>
                  <td>{rec.fecha_recepcion}</td>
                  <td>
                    <strong>{rec.proveedor?.nombre}</strong><br />
                    RUC: {rec.proveedor?.ruc}<br />
                    Tel: {rec.proveedor?.telefono}
                  </td>
                  <td>{rec.usuario?.nombre_usuario}<br /><small>{rec.usuario?.rol}</small></td>
                  <td>{rec.observaciones || "Sin observaciones"}</td>
                  <td style={{ minWidth: "350px" }}>
                    <Table bordered size="sm">
                      <thead>
                        <tr className="bg-light">
                          <th>Producto</th>
                          <th>Cant.</th>
                          <th>Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rec.detalles.map((d, i) => (
                          <tr key={i}>
                            <td>{d.producto.nombre}</td>
                            <td>{d.cantidad}</td>
                            <td>S/ {d.precio_unitario}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* MODAL NUEVA RECEPCIÓN */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Nueva Recepción</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <h5>Datos de Cabecera</h5>
            <Form.Group className="mb-2">
              <label>N° de Guía</label>
              <Form.Control
                value={cabecera.numeroGuia}
                onChange={(e) => setCabecera({ ...cabecera, numeroGuia: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <label>Fecha</label>
              <Form.Control
                type="date"
                value={cabecera.fecha_recepcion}
                onChange={(e) => setCabecera({ ...cabecera, fecha_recepcion: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <label>Proveedor</label>
              <Form.Select
                value={cabecera.proveedor}
                onChange={(e) => setCabecera({ ...cabecera, proveedor: Number(e.target.value) })}
              >
                <option value={0}>Selecciona un proveedor</option>
                {proveedores.map(p => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>
                    {p.nombre} - {p.ruc}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <label>Observaciones</label>
              <Form.Control
                as="textarea"
                rows={2}
                value={cabecera.observaciones}
                onChange={(e) => setCabecera({ ...cabecera, observaciones: e.target.value })}
              />
            </Form.Group>

            <hr />
            <h5>Agregar Detalle</h5>
            <div className="row mb-3">
              <div className="col-4">
                <label>Producto</label>
                <Form.Select
                  value={detalleTemp.producto}
                  onChange={(e) => {
                    const idProd = Number(e.target.value);
                    const prodSeleccionado = productos.find(p => p.id_producto === idProd);
                    setDetalleTemp({
                      ...detalleTemp,
                      producto: idProd,
                      precio_unitario: prodSeleccionado ? prodSeleccionado.precio_unitario : "",
                    });
                  }}
                >
                  <option value={0}>Selecciona un producto</option>
                  {productos.map(p => (
                    <option key={p.id_producto} value={p.id_producto}>
                      {p.nombre} - S/ {p.precio_unitario}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-4">
                <label>Cantidad</label>
                <Form.Control
                  type="number"
                  value={detalleTemp.cantidad}
                  onChange={(e) => setDetalleTemp({ ...detalleTemp, cantidad: e.target.value })}
                />
              </div>

              <div className="col-4">
                <label>Precio</label>
                <Form.Control
                  type="number"
                  value={detalleTemp.precio_unitario}
                  onChange={(e) => setDetalleTemp({ ...detalleTemp, precio_unitario: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={agregarDetalle} className="w-100 mb-3">Agregar Detalle</Button>

            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((d, i) => (
                  <tr key={i}>
                    <td>{d.producto.nombre}</td>
                    <td>{d.cantidad}</td>
                    <td>S/ {d.precio_unitario}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="success" onClick={guardarRecepcion}>Registrar Recepción</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Sidebar>
  );
}
