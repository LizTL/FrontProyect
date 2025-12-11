import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { Table, Button, Modal, Form, Badge, Card } from "react-bootstrap";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modo, setModo] = useState("crear");

  const [usuario, setUsuario] = useState({
    id_usuario: null,
    nombre_usuario: "",
    correo: "",
    password: "",
    rol: "USUARIO",
  });

  // 🔹 Cargar usuarios desde la API y agregar estado temporal "activo"
  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/usuarios");
      const data = res.data.map(u => ({ ...u, estadoFront: "activo" }));
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // 🔹 Nuevo usuario
  const abrirNuevo = () => {
    setModo("crear");
    setUsuario({ id_usuario: null, nombre_usuario: "", correo: "", password: "", rol: "USUARIO" });
    setShowModal(true);
  };

  // 🔹 Editar usuario
  const abrirEditar = (u) => {
    if (u.estadoFront === "inactivo") return; // no se puede editar inactivos
    setModo("editar");
    setUsuario({ ...u, password: "" });
    setShowModal(true);
  };

  // 🔹 Guardar usuario (POST o PUT real)
  const guardarUsuario = async () => {
    try {
      if (modo === "crear") {
        const res = await axios.post("http://localhost:8080/api/usuarios", usuario);
        setUsuarios([...usuarios, { ...res.data, estadoFront: "activo" }]);
      } else {
        const { password, ...sinPass } = usuario;
        await axios.put(`http://localhost:8080/api/usuarios/${usuario.id_usuario}`, sinPass);
        setUsuarios(
          usuarios.map(u =>
            u.id_usuario === usuario.id_usuario ? { ...usuario, estadoFront: u.estadoFront } : u
          )
        );
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error guardando usuario", error);
    }
  };

  // 🔹 Inactivar / Activar solo en frontend
  const cambiarEstadoFront = (id) => {
    setUsuarios(
      usuarios.map(u =>
        u.id_usuario === id
          ? { ...u, estadoFront: u.estadoFront === "activo" ? "inactivo" : "activo" }
          : u
      )
    );
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="container" style={{ marginTop: "90px", maxWidth: "90%" }}>
        <Card className="shadow p-4 border-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 style={{ fontWeight: "bold", color: "#0d1440" }}>Gestión de Usuarios</h2>
            <Button variant="primary" onClick={abrirNuevo}>+ Nuevo Usuario</Button>
          </div>

          <Table bordered hover responsive>
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th style={{ width: "200px" }}>Acción</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id_usuario} className={u.estadoFront === "inactivo" ? "table-secondary opacity-75" : ""}>
                  <td>{u.id_usuario}</td>
                  <td>{u.nombre_usuario}</td>
                  <td>{u.correo}</td>
                  <td><Badge bg="info">{u.rol}</Badge></td>
                  <td>
                    <Badge bg={u.estadoFront === "activo" ? "success" : "secondary"}>
                      {u.estadoFront.toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {u.estadoFront === "activo" ? (
                        <>
                          <Button variant="warning" size="sm" onClick={() => abrirEditar(u)}>Editar</Button>
                          <Button variant="dark" size="sm" onClick={() => cambiarEstadoFront(u.id_usuario)}>Inactivar</Button>
                        </>
                      ) : (
                        <Button variant="success" size="sm" onClick={() => cambiarEstadoFront(u.id_usuario)}>Activar</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* MODAL */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{modo === "crear" ? "Nuevo Usuario" : "Editar Usuario"}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  value={usuario.nombre_usuario}
                  onChange={(e) => setUsuario({ ...usuario, nombre_usuario: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="email"
                  value={usuario.correo}
                  onChange={(e) => setUsuario({ ...usuario, correo: e.target.value })}
                />
              </Form.Group>

              {modo === "crear" && (
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={usuario.password}
                    onChange={(e) => setUsuario({ ...usuario, password: e.target.value })}
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Rol</Form.Label>
                <Form.Select
                  value={usuario.rol}
                  onChange={(e) => setUsuario({ ...usuario, rol: e.target.value })}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="USUARIO">USUARIO</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={guardarUsuario}>Guardar</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
