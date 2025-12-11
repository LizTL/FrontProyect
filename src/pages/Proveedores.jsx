import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { Table, Button, Modal, Form, Badge, Card } from "react-bootstrap";

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [proveedor, setProveedor] = useState({
    id_proveedor: null,
    nombre: "",
    ruc: "",
    telefono: "",
    estado: "activo",
  });

 
  useEffect(() => {
    axios.get("http://localhost:8080/api/proveedores").then((res) => {
      const data = res.data.map((item) => ({
        ...item,
        estado: "activo", 
      }));
      setProveedores(data);
    });
  }, []);

  const abrirNuevo = () => {
    setProveedor({
      id_proveedor: null,
      nombre: "",
      ruc: "",
      telefono: "",
      estado: "activo",
    });
    setShowModal(true);
  };


  const abrirEditar = (prov) => {
    if (prov.estado === "inactivo") return; 
    setProveedor(prov);
    setShowModal(true);
  };

  const guardarProveedor = () => {
    if (proveedor.id_proveedor) {
    
      setProveedores(
        proveedores.map((p) =>
          p.id_proveedor === proveedor.id_proveedor ? proveedor : p
        )
      );
    } else {
      
      const nuevo = {
        ...proveedor,
        id_proveedor:
          proveedores.length > 0
            ? proveedores[proveedores.length - 1].id_proveedor + 1
            : 1,
      };
      setProveedores([...proveedores, nuevo]);
    }

    setShowModal(false);
  };

 
  const cambiarEstado = (id) => {
    setProveedores(
      proveedores.map((p) =>
        p.id_proveedor === id
          ? { ...p, estado: p.estado === "activo" ? "inactivo" : "activo" }
          : p
      )
    );
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="container" style={{ marginTop: "90px", maxWidth: "90%" }}>
        <Card className="shadow p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="m-0" style={{ fontWeight: "bold", color: "#0d1440" }}>
              Gestión de Proveedores
            </h2>

            <Button variant="primary" onClick={abrirNuevo}>
              + Nuevo Proveedor
            </Button>
          </div>

         
          <Table bordered responsive hover className="mt-3">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>RUC</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th style={{ width: "180px" }}>Acción</th>
              </tr>
            </thead>

            <tbody>
              {proveedores.map((p) => (
                <tr
                  key={p.id_proveedor}
                  className={p.estado === "inactivo" ? "table-secondary" : ""}
                >
                  <td>{p.id_proveedor}</td>
                  <td>{p.nombre}</td>
                  <td>{p.ruc}</td>
                  <td>{p.telefono}</td>

                  <td>
                    <Badge bg={p.estado === "activo" ? "success" : "secondary"}>
                      {p.estado.toUpperCase()}
                    </Badge>
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="warning"
                        size="sm"
                        disabled={p.estado === "inactivo"}
                        onClick={() => abrirEditar(p)}
                      >
                        Editar
                      </Button>

                      <Button
                        variant={p.estado === "activo" ? "dark" : "success"}
                        size="sm"
                        onClick={() => cambiarEstado(p.id_proveedor)}
                      >
                        {p.estado === "activo" ? "Inactivar" : "Activar"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

      
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {proveedor.id_proveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={proveedor.nombre}
                  onChange={(e) =>
                    setProveedor({ ...proveedor, nombre: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>RUC</Form.Label>
                <Form.Control
                  type="text"
                  value={proveedor.ruc}
                  onChange={(e) =>
                    setProveedor({ ...proveedor, ruc: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  value={proveedor.telefono}
                  onChange={(e) =>
                    setProveedor({ ...proveedor, telefono: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={guardarProveedor}>
              Guardar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
