import { useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "../styles/recepcion.css";

export default function SalidaPage() {
  const [salidas, setSalidas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")) || { id_usuario: 1 };

  const [cabecera, setCabecera] = useState({
    motivo: "",
    fechaSalida: "",
    observacion: "",
    usuario: usuarioLogueado,
  });

  const [detalles, setDetalles] = useState([]);
  const [detalleTemp, setDetalleTemp] = useState({ producto: null, cantidad: "" });

  useEffect(() => {
    cargarSalidas();
    cargarProductos();
  }, []);

  const cargarSalidas = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/salidas");
      setSalidas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/productos");
      setProductos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const agregarDetalle = () => {
    if (!detalleTemp.producto || !detalleTemp.cantidad) {
      alert("Completa todos los campos del detalle");
      return;
    }
    setDetalles([...detalles, detalleTemp]);
    setDetalleTemp({ producto: null, cantidad: "" });
  };

  const eliminarDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const guardarSalida = async () => {
    if (!cabecera.motivo || !cabecera.fechaSalida || detalles.length === 0) {
      alert("Completa cabecera y agrega detalles");
      return;
    }

    const payload = {
      cabecera: {
        ...cabecera,
        usuario: usuarioLogueado, // siempre enviamos el usuario logueado
      },
      detalles: detalles.map((d) => ({
        producto: { codBar: d.producto.codBar },
        cantidad: Number(d.cantidad),
      })),
    };

    try {
      await axios.post("http://localhost:8080/api/salidas", payload, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Salida registrada correctamente");
      setShowModal(false);
      setCabecera({ motivo: "", fechaSalida: "", observacion: "", usuario: usuarioLogueado });
      setDetalles([]);
      setDetalleTemp({ producto: null, cantidad: "" });
      cargarSalidas();
    } catch (err) {
      console.error(err);
      alert("Error al registrar salida");
    }
  };

  return (
    <Sidebar>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Salidas</h2>
          <Button variant="danger" onClick={() => setShowModal(true)}>
            Nueva Salida
          </Button>
        </div>

        <Table bordered striped hover responsive className="shadow">
          <thead className="table-dark">
            <tr>
              <th>Motivo</th>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Observación</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {salidas.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No hay salidas registradas.
                </td>
              </tr>
            ) : (
              salidas.map((s) => (
                <tr key={s.idSalida}>
                  <td>{s.motivo}</td>
                  <td>{s.fechaSalida}</td>
                  <td>
                    {s.usuario?.nombre_usuario}
                    <br />
                    <small>{s.usuario?.rol}</small>
                  </td>
                  <td>{s.observacion || "Sin observación"}</td>
                  <td style={{ minWidth: "300px" }}>
                    <Table bordered size="sm">
                      <thead>
                        <tr className="bg-light">
                          <th>Producto</th>
                          <th>Cant.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.detalles?.map((d) => (
                          <tr key={d.idDetalleSalida}>
                            <td>{d.producto?.nombre}</td>
                            <td>{d.cantidad}</td>
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

        {/* Modal Nueva Salida */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Nueva Salida</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <h5>Datos de Cabecera</h5>
            <Form.Group className="mb-2">
              <label>Motivo</label>
              <Form.Control
                value={cabecera.motivo}
                onChange={(e) => setCabecera({ ...cabecera, motivo: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <label>Fecha</label>
              <Form.Control
                type="date"
                value={cabecera.fechaSalida}
                onChange={(e) => setCabecera({ ...cabecera, fechaSalida: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <label>Observación</label>
              <Form.Control
                as="textarea"
                rows={2}
                value={cabecera.observacion}
                onChange={(e) => setCabecera({ ...cabecera, observacion: e.target.value })}
              />
            </Form.Group>

            <hr />
            <h5>Agregar Detalle</h5>
            <div className="row mb-3">
              <div className="col-8">
                <label>Producto</label>
                <Form.Select
                  value={detalleTemp.producto?.codBar || ""}
                  onChange={(e) => {
                    const prod = productos.find((p) => p.codBar === e.target.value);
                    setDetalleTemp({ ...detalleTemp, producto: prod });
                  }}
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((p) => (
                    <option key={p.id_producto} value={p.codBar}>
                      {p.nombre} - {p.codBar}
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
            </div>

            <Button onClick={agregarDetalle} className="w-100 mb-3">
              Agregar Detalle
            </Button>

            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((d, i) => (
                  <tr key={i}>
                    <td>{d.producto?.nombre}</td>
                    <td>{d.cantidad}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => eliminarDetalle(i)}>
                        X
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={guardarSalida}>
              Registrar Salida
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Sidebar>
  );
}
