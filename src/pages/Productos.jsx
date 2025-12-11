import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import {
  Table,
  Button,
  Form,
  Badge,
  Pagination,
  InputGroup,
  Modal
} from "react-bootstrap";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [showModal, setShowModal] = useState(false);
  const [editarProducto, setEditarProducto] = useState(false);

  const [nuevoProducto, setNuevoProducto] = useState({
    id_producto: null,
    cod_bar: "",
    nombre: "",
    descripcion: "",
    precio_unitario: 0,
    unidad_medida: "Unidad",
    categoria: "",
  });

  const unidadesMedida = ["Caja", "Paquete", "Unidad"];


  const cargarDatos = async () => {
    try {
      const resProd = await axios.get("http://localhost:8080/api/productos");
      const resStock = await axios.get("http://localhost:8080/api/stock");
      const resCat = await axios.get("http://localhost:8080/api/categorias");

      setCategorias(resCat.data);

      const productosConStock = resProd.data.map(prod => {
        const stockInfo = resStock.data.find(
          s => s.id_producto === prod.id_producto
        );
        return {
          ...prod,
          stock_actual: stockInfo?.stock_actual || 0,
        };
      });

      setProductos(productosConStock);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto({
      ...nuevoProducto,
      [name]:
        name === "categoria"
          ? Number(value)
          : name === "precio_unitario"
          ? parseFloat(value) || 0
          : value,
    });
  };


  const handleEditar = (prod) => {
    setNuevoProducto({
      id_producto: prod.id_producto,
      cod_bar: prod.codBar, // código de barras real
      nombre: prod.nombre,
      descripcion: prod.descripcion || "",
      precio_unitario: prod.precio_unitario || 0,
      unidad_medida: prod.unidad_medida || "Unidad",
      categoria: prod.categoria?.idCategoria || "",
    });
    setEditarProducto(true);
    setShowModal(true);
  };

  
  const handleAgregar = () => {
    setNuevoProducto({
      id_producto: null,
      cod_bar: "",
      nombre: "",
      descripcion: "",
      precio_unitario: 0,
      unidad_medida: "Unidad",
      categoria: categorias[0]?.idCategoria || "",
    });
    setEditarProducto(false);
    setShowModal(true);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bodyProducto = {
        codBar: nuevoProducto.cod_bar,
        nombre: nuevoProducto.nombre,
        descripcion: nuevoProducto.descripcion,
        precio_unitario: nuevoProducto.precio_unitario,
        unidad_medida: nuevoProducto.unidad_medida,
        categoria: { idCategoria: nuevoProducto.categoria },
      };

      if (editarProducto) {
        await axios.put(
          `http://localhost:8080/api/productos/${nuevoProducto.id_producto}`,
          bodyProducto
        );
      } else {
        await axios.post("http://localhost:8080/api/productos", bodyProducto);
      }

      setShowModal(false);
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el producto");
    }
  };

 
  const productosFiltrados = productos.filter(p =>
    (p.nombre ?? "").toLowerCase().includes(filtro.toLowerCase()) ||
    (p.categoria?.nombre ?? "").toLowerCase().includes(filtro.toLowerCase())
  );

  const totalPages = Math.ceil(productosFiltrados.length / perPage);
  const paginatedProductos = productosFiltrados.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <Sidebar>
      <div className="container py-4">

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Productos</h2>
          <Button variant="success" onClick={handleAgregar}>
            Agregar Producto
          </Button>
        </div>

        <InputGroup className="mb-3" style={{ maxWidth: "350px" }}>
          <Form.Control
            placeholder="Buscar producto..."
            value={filtro}
            onChange={e => {
              setFiltro(e.target.value);
              setPage(1);
            }}
          />
        </InputGroup>
{/* TABLA */}
<div className="table-responsive">
  <Table striped bordered hover>
    <thead className="table-dark">
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Código</th>
        <th>Descripción</th>
        <th>Categoría</th>
        <th>Unidad</th>
        <th>Precio (S/)</th>
        <th>Stock</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>

    <tbody>
      {paginatedProductos.length > 0 ? (
        paginatedProductos.map(prod => (
          <tr key={prod.id_producto}>
            <td>{prod.id_producto}</td>
            <td>{prod.nombre}</td>
            <td>{prod.codBar}</td>
            <td>{prod.descripcion}</td>
            <td>{prod.categoria?.nombre}</td>
            <td>{prod.unidad_medida}</td>
            <td>{prod.precio_unitario.toFixed(2)}</td>
            <td>{prod.stock_actual}</td>
            <td>
              <Badge bg={prod.stock_actual < 5 ? "danger" : "success"}>
                {prod.stock_actual < 5 ? "Bajo" : "Suficiente"}
              </Badge>
            </td>
            <td>
              <div className="d-flex gap-2 flex-wrap">
                <Button variant="primary" size="sm" onClick={() => handleEditar(prod)}>Editar</Button>
                <Button variant="warning" size="sm">Eliminar</Button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={10} className="text-center">No hay productos</td>
        </tr>
      )}
    </tbody>
  </Table>
</div>

    


        {/* PAGINACION */}
        <div className="d-flex justify-content-between align-items-center">
          <Form.Select
            style={{ width: 100 }}
            value={perPage}
            onChange={e => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </Form.Select>

          <Pagination>
            <Pagination.Prev
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i}
                active={page === i + 1}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            />
          </Pagination>
        </div>

        {/* MODAL */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editarProducto ? "Editar Producto" : "Agregar Producto"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>

              <Form.Group className="mb-2">
                <Form.Label>Código de Barras</Form.Label>
                <Form.Control
                  name="cod_bar"
                  value={nuevoProducto.cod_bar}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  name="nombre"
                  value={nuevoProducto.nombre}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  name="descripcion"
                  value={nuevoProducto.descripcion}
                  onChange={handleChange}
                  as="textarea"
                  rows={3}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Precio Unitario (S/)</Form.Label>
                <Form.Control
                  name="precio_unitario"
                  type="number"
                  step="0.01"
                  value={nuevoProducto.precio_unitario}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Unidad de Medida</Form.Label>
                <Form.Select
                  name="unidad_medida"
                  value={nuevoProducto.unidad_medida}
                  onChange={handleChange}
                  required
                >
                  {unidadesMedida.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                  name="categoria"
                  value={nuevoProducto.categoria}
                  onChange={handleChange}
                  required
                >
                  {categorias.map(c => (
                    <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Stock actual</Form.Label>
                <Form.Control
                  value="El stock solo se edita en Recepción / Salida"
                  disabled
                />
              </Form.Group>

              <div className="d-flex justify-content-end mt-3 gap-2">
                <Button variant="success" type="submit">
                  {editarProducto ? "Actualizar" : "Guardar"}
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
              </div>

            </Form>
          </Modal.Body>
        </Modal>

      </div>
    </Sidebar>
  );
}
