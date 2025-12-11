import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Container } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "../styles/categoria.css";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [categoria, setCategoria] = useState({ idCategoria: null, nombre: "", descripcion: "" });
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const fetchCategorias = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/categorias");
      setCategorias(res.data);
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "danger", texto: "No se pudieron cargar las categorías." });
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleChange = (e) => setCategoria({ ...categoria, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      if (categoria.idCategoria) {
        await axios.put(`http://localhost:8080/api/categorias/${categoria.idCategoria}`, categoria);
        setMensaje({ tipo: "success", texto: "Categoría actualizada" });
      } else {
        await axios.post("http://localhost:8080/api/categorias", categoria);
        setMensaje({ tipo: "success", texto: "Categoría creada" });
      }
      setShowModal(false);
      setCategoria({ idCategoria: null, nombre: "", descripcion: "" });
      fetchCategorias();
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "danger", texto: "Error al guardar categoría" });
    }
  };

  const handleEdit = (cat) => {
    setCategoria(cat);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar esta categoría?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/categorias/${id}`);
      setMensaje({ tipo: "success", texto: "Categoría eliminada" });
      fetchCategorias();
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "danger", texto: "Error al eliminar categoría" });
    }
  };

  return (
    <Sidebar>
      <Container className="mt-3">
        <h2 className="mb-3">Categorías</h2>

        {mensaje.texto && (
          <Alert variant={mensaje.tipo} onClose={() => setMensaje({})} dismissible>
            {mensaje.texto}
          </Alert>
        )}

        <div className="mb-3">
          <Button variant="success" onClick={() => setShowModal(true)}>
            Nueva Categoría
          </Button>
        </div>

        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.idCategoria}>
                <td>{cat.idCategoria}</td>
                <td>{cat.nombre}</td>
                <td>{cat.descripcion}</td>
                <td>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button variant="warning" size="sm" onClick={() => handleEdit(cat)}>Editar</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(cat.idCategoria)}>Eliminar</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

<Modal
  show={showModal}
  onHide={() => setShowModal(false)}
  dialogClassName="modal-abajo"
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>
      {categoria.idCategoria ? "Editar Categoría" : "Nueva Categoría"}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          name="nombre"
          value={categoria.nombre}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Descripción</Form.Label>
        <Form.Control
          type="text"
          name="descripcion"
          value={categoria.descripcion}
          onChange={handleChange}
        />
      </Form.Group>
    </Form>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Cancelar
    </Button>
    <Button variant="primary" onClick={handleSave}>
      Guardar
    </Button>
  </Modal.Footer>
</Modal>

      </Container>
    </Sidebar>
  );
}
