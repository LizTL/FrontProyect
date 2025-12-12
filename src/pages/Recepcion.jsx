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
  const [usuarios, setUsuarios] = useState([]);

  const [cabecera, setCabecera] = useState({
    numeroGuia: "",
    fecha_recepcion: "",
    observaciones: "",
    proveedor: 0,
    usuario: null, 
  });

  const [detalles, setDetalles] = useState([]);
  const [detalleTemp, setDetalleTemp] = useState({
    producto: null,
    cantidad: "",
    precio_unitario: "",
  });

  useEffect(() => {
    cargarRecepciones();
    cargarProveedores();
    cargarProductos();
    cargarUsuarios();
  }, []);

  const cargarRecepciones = async () => {
    const res = await axios.get("http://localhost:8080/api/recepciones");
    setRecepciones(res.data);
  };

  const cargarProveedores = async () => {
    const res = await axios.get("http://localhost:8080/api/proveedores");
    setProveedores(res.data);
  };

  const cargarProductos = async () => {
    const res = await axios.get("http://localhost:8080/api/productos");
    setProductos(res.data);
  };

  const cargarUsuarios = async () => {
    const res = await axios.get("http://localhost:8080/api/usuarios");
    setUsuarios(res.data);
  };

 
  const agregarDetalle = () => {
    if (!detalleTemp.producto || !detalleTemp.cantidad || !detalleTemp.precio_unitario) {
      alert("Completa todos los campos del detalle");
      return;
    }

    setDetalles([
      ...detalles,
      {
        producto: detalleTemp.producto,
        cantidad: Number(detalleTemp.cantidad),
        precio_unitario: Number(detalleTemp.precio_unitario),
      },
    ]);

    setDetalleTemp({ producto: null, cantidad: "", precio_unitario: "" });
  };


  const eliminarDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };


  const guardarRecepcion = async () => {
    if (!cabecera.numeroGuia || !cabecera.fecha_recepcion || !cabecera.proveedor || detalles.length === 0) {
      alert("Completa cabecera y agrega detalles");
      return;
    }

    const detallesValidos = detalles.map(d => ({
      producto: { codBar: d.producto.codBar },
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario
    }));

    const payload = {
      cabecera: {
        numeroGuia: cabecera.numeroGuia,
        observaciones: cabecera.observaciones,
        proveedor: { id_proveedor: Number(cabecera.proveedor) },
        usuario: { id_usuario: cabecera.usuario || 1 }
      },
      detalles: detallesValidos
    };

    console.log("ENVIANDO A BACKEND:", payload);

    try {
      await axios.post("http://localhost:8080/api/recepciones", payload);
      alert("Recepción registrada correctamente");
      setShowModal(false);
      setDetalles([]);
      cargarRecepciones();
      setCabecera({
        numeroGuia: "",
        fecha_recepcion: "",
        observaciones: "",
        proveedor: 0,
        usuario: null
      });
    } catch (err) {
      console.error("Error al registrar:", err);
      alert("Error al registrar recepción.");
    }
  };

  return (
    <Sidebar>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Recepciones</h2>
          <Button variant="success" onClick={() => setShowModal(true)}>
            Nueva Recepción
          </Button>
        </div>

        {/* TABLA PRINCIPAL */}
        <Table bordered striped hover responsive className="shadow">
          <thead className="table-dark">
            <tr>
              <th>Guía</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Usuario</th>
              <th>Obs.</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {recepciones.map(rec => (
              <tr key={rec.idRecepcion}>
                <td>{rec.numeroGuia}</td>
                <td>{rec.fecha_recepcion}</td>
                <td>{rec.proveedor?.nombre}</td>
                <td>{rec.usuario?.nombre_usuario}</td>
                <td>{rec.observaciones}</td>
                <td>
                  <ul>
                    {rec.detalles.map((d, i) => (
                      <li key={i}>
                        {d.producto.nombre} — {d.cantidad} un. — S/ {d.precio_unitario}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* MODAL */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Nueva Recepción</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <h5>Datos de Cabecera</h5>

            <Form.Group className="mb-2">
              <label>N° Guía</label>
              <Form.Control
                value={cabecera.numeroGuia}
                onChange={e => setCabecera({ ...cabecera, numeroGuia: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <label>Fecha</label>
              <Form.Control
                type="date"
                value={cabecera.fecha_recepcion}
                onChange={e => setCabecera({ ...cabecera, fecha_recepcion: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <label>Proveedor</label>
              <Form.Select
                value={cabecera.proveedor}
                onChange={e => setCabecera({ ...cabecera, proveedor: Number(e.target.value) })}
              >
                <option value={0}>Selecciona proveedor</option>
                {proveedores.map(p => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>
                    {p.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <label>Usuario</label>
              <Form.Select
                value={cabecera.usuario || ""}
                onChange={e => setCabecera({ ...cabecera, usuario: Number(e.target.value) })}
              >
                <option value="">Selecciona usuario</option>
                {usuarios.map(u => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nombre_usuario} ({u.rol})
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
                onChange={e => setCabecera({ ...cabecera, observaciones: e.target.value })}
              />
            </Form.Group>

            <hr />

            <h5>Agregar Detalle</h5>

            <div className="row mb-3">
              <div className="col-4">
                <label>Producto</label>
                <Form.Select
                  value={detalleTemp.producto?.id_producto || ""}
                  onChange={e => {
                    const idProd = Number(e.target.value);
                    const prod = productos.find(p => p.id_producto === idProd);
                    setDetalleTemp({
                      ...detalleTemp,
                      producto: prod || null,
                      precio_unitario: prod?.precio_unitario || ""
                    });
                  }}
                >
                  <option value="">Selecciona producto</option>
                  {productos.map(p => (
                    <option key={p.id_producto} value={p.id_producto}>
                      {p.nombre} — S/ {p.precio_unitario}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-4">
                <label>Cantidad</label>
                <Form.Control
                  type="number"
                  value={detalleTemp.cantidad}
                  onChange={e => setDetalleTemp({ ...detalleTemp, cantidad: e.target.value })}
                />
              </div>

              <div className="col-4">
                <label>Precio</label>
                <Form.Control
                  type="number"
                  value={detalleTemp.precio_unitario}
                  onChange={e => setDetalleTemp({ ...detalleTemp, precio_unitario: e.target.value })}
                />
              </div>
            </div>

            <Button className="w-100 mb-3" onClick={agregarDetalle}>
              Agregar Detalle
            </Button>

            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant</th>
                  <th>Precio</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((d, i) => (
                  <tr key={i}>
                    <td>{d.producto.nombre}</td>
                    <td>{d.cantidad}</td>
                    <td>S/ {d.precio_unitario}</td>
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
            <Button variant="success" onClick={guardarRecepcion}>
              Registrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Sidebar>
  );
}
