import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

const inicial = { id: null, nombre: '', descripcion: '', precio: '', categoria_id: '', proveedor_id: '' };

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState({ ...inicial });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [p, c, pr] = await Promise.all([
        api.get('/productos'), api.get('/categorias'), api.get('/proveedores')
      ]);
      setProductos(p.data);
      setCategorias(c.data);
      setProveedores(pr.data);
    } catch (err) { setError(err.response?.data?.error || 'No se pudo cargar productos o catálogos.'); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true); setError(''); setMensaje('');
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      categoria_id: Number(form.categoria_id),
      proveedor_id: form.proveedor_id ? Number(form.proveedor_id) : null
    };
    try {
      if (form.id !== null) await api.put('/productos/' + form.id, payload);
      else await api.post('/productos', payload);
      setForm({ ...inicial });
      setMensaje('Producto guardado correctamente.');
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No fue posible guardar el producto.');
    } finally { setGuardando(false); }
  };

  const editar = (item) => {
    setForm({
      id: item.id, nombre: item.nombre || '', descripcion: item.descripcion || '',
      precio: item.precio ?? '', categoria_id: String(item.categoria_id ?? ''),
      proveedor_id: String(item.proveedor_id ?? '')
    });
    setMensaje('');
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar producto? Los productos con Kardex no pueden eliminarse.')) return;
    setError(''); setMensaje('');
    try {
      await api.delete('/productos/' + id);
      await cargar();
      setMensaje('Producto eliminado.');
    } catch (err) { setError(err.response?.data?.error || 'No se pudo eliminar el producto.'); }
  };

  return (
    <>
      <h2 className="mb-3">Gestión de Productos</h2>
      <p className="text-secondary">Los productos requieren una categoría existente. El stock se administra desde <Link to="/kardex">Kardex</Link>.</p>
      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {!categorias.length && <div className="alert alert-warning">
        Primero crea una categoría desde <Link to="/categorias">Categorías</Link>.
      </div>}
      <div className="row g-4">
        <div className="col-lg-4">
          <form className="card card-body shadow-sm" onSubmit={guardar}>
            <h5>{form.id !== null ? 'Editar Producto' : 'Nuevo Producto'}</h5>
            <label className="form-label">Nombre
              <input className="form-control" required value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </label>
            <label className="form-label">Descripción
              <input className="form-control" value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            </label>
            <label className="form-label">Precio (S/)
              <input type="number" className="form-control" min="0" step="0.01" required value={form.precio}
                onChange={e => setForm({ ...form, precio: e.target.value })} />
            </label>
            <label className="form-label">Categoría (obligatoria)
              <select className="form-select" required value={form.categoria_id}
                onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
                <option value="">Selecciona una categoría</option>
                {categorias.map(c => <option value={c.id} key={c.id}>{c.nombre}</option>)}
              </select>
            </label>
            <label className="form-label">Proveedor (opcional)
              <select className="form-select" value={form.proveedor_id}
                onChange={e => setForm({ ...form, proveedor_id: e.target.value })}>
                <option value="">Sin proveedor</option>
                {proveedores.map(p => <option value={p.id} key={p.id}>{p.razon_social}</option>)}
              </select>
            </label>
            <p className="small text-secondary">Stock inicial: 0. Registra una Entrada en Kardex para agregar unidades.</p>
            <button type="submit" className="btn btn-primary" disabled={guardando || !categorias.length}>
              {form.id !== null ? 'Actualizar' : 'Guardar'}
            </button>
            {form.id !== null && <button type="button" className="btn btn-outline-secondary mt-2"
              onClick={() => setForm({ ...inicial })}>Cancelar edición</button>}
          </form>
        </div>
        <div className="col-lg-8">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Proveedor</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td><td>{p.nombre}</td><td>{p.categoria?.nombre || 'Sin categoría'}</td>
                    <td>{p.proveedor?.razon_social || '—'}</td><td>S/ {Number(p.precio).toFixed(2)}</td><td>{p.stock}</td>
                    <td className="text-nowrap">
                      <button type="button" className="btn btn-sm btn-warning me-2" onClick={() => editar(p)}>Editar</button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => eliminar(p.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {!productos.length && <tr><td colSpan="7" className="text-center">No hay productos registrados</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
