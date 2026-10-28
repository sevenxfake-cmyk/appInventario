import { useEffect, useState } from 'react';
import api from '../../services/api.js';

const formularioInicial = { id: null, nombre: '', descripcion: '', precio: '', stock: '' };

function CrudProductos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ ...formularioInicial });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const obtenerProductos = async () => {
    try {
      setError('');
      const response = await api.get('/productos');
      setProductos(response.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la lista. Verifica que el backend esté activo.');
    }
  };

  useEffect(() => { obtenerProductos(); }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setError('');
    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion,
      precio: Number(form.precio),
      stock: Number(form.stock)
    };
    try {
      if (form.id !== null) {
        await api.put(`/productos/${form.id}`, datos);
      } else {
        await api.post('/productos', datos);
      }
      setForm({ ...formularioInicial });
      await obtenerProductos();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el producto. Revisa la API REST.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEdit = (producto) => {
    setForm({
      id: producto.id,
      nombre: producto.nombre ?? '',
      descripcion: producto.descripcion ?? '',
      precio: producto.precio ?? '',
      stock: producto.stock ?? ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      setError('');
      await api.delete(`/productos/${id}`);
      await obtenerProductos();
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar el producto.');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Gestión de Productos</h2>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="row g-4">
        <div className="col-md-4">
          <h4>{form.id !== null ? 'Editar Producto' : 'Nuevo Producto'}</h4>
          <form onSubmit={handleSubmit} className="card p-3 shadow-sm">
            <div className="mb-3">
              <label className="form-label" htmlFor="nombre">Nombre</label>
              <input id="nombre" className="form-control" type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="descripcion">Descripción</label>
              <input id="descripcion" className="form-control" type="text" name="descripcion" value={form.descripcion} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="precio">Precio (S/)</label>
              <input id="precio" className="form-control" type="number" name="precio" min="0" step="0.01" value={form.precio} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="stock">Stock</label>
              <input id="stock" className="form-control" type="number" name="stock" min="0" step="1" value={form.stock} onChange={handleChange} required />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={guardando}>{form.id !== null ? 'Actualizar' : 'Guardar'}</button>
            {form.id !== null && <button type="button" className="btn btn-outline-secondary mt-2" onClick={() => setForm({ ...formularioInicial })}>Cancelar edición</button>}
          </form>
        </div>
        <div className="col-md-8">
          <h4>Lista de Productos</h4>
          <div className="table-responsive shadow-sm">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-dark"><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.id}</td><td>{producto.nombre}</td><td>S/ {Number(producto.precio).toFixed(2)}</td><td>{producto.stock}</td>
                    <td>
                      <button type="button" className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(producto)}>Editar</button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(producto.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {productos.length === 0 && <tr><td colSpan="5" className="text-center">No hay productos registrados</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrudProductos;
