import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import Icon from '../components/ui/Icon.jsx';

const inicial = { id: null, nombre: '', descripcion: '', precio: '', categoria_id: '', proveedor_id: '' };

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState({ ...inicial });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const cargar = useCallback(async () => {
    try {
      const [p, c, pr] = await Promise.all([
        api.get('/productos'), api.get('/categorias'), api.get('/proveedores')
      ]);
      setProductos(p.data);
      setCategorias(c.data);
      setProveedores(pr.data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar productos o catálogos.');
    }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const visibles = useMemo(() => productos.filter(p => {
    const coincide = `${p.nombre} ${p.categoria?.nombre || ''} ${p.proveedor?.razon_social || ''}`.toLowerCase().includes(busqueda.toLowerCase());
    return coincide && (filtro === 'todos' || (filtro === 'bajo' && Number(p.stock) <= 5) || (filtro === 'agotado' && Number(p.stock) === 0));
  }), [productos, busqueda, filtro]);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true); setError(''); setMensaje('');
    const payload = {
      nombre: form.nombre, descripcion: form.descripcion, precio: Number(form.precio),
      categoria_id: Number(form.categoria_id),
      proveedor_id: form.proveedor_id ? Number(form.proveedor_id) : null
    };
    try {
      if (form.id !== null) await api.put('/productos/' + form.id, payload);
      else await api.post('/productos', payload);
      setForm({ ...inicial });
      setMensaje('Producto guardado correctamente.');
      await cargar();
    } catch (err) { setError(err.response?.data?.error || 'No fue posible guardar el producto.'); }
    finally { setGuardando(false); }
  };

  const editar = p => {
    setForm({
      id: p.id, nombre: p.nombre || '', descripcion: p.descripcion || '',
      precio: p.precio ?? '', categoria_id: String(p.categoria_id ?? ''),
      proveedor_id: String(p.proveedor_id ?? '')
    });
    setMensaje('');
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const eliminar = async id => {
    if (!window.confirm('¿Eliminar producto? Los productos con Kardex no pueden eliminarse.')) return;
    setError(''); setMensaje('');
    try {
      await api.delete('/productos/' + id);
      await cargar();
      setMensaje('Producto eliminado.');
    } catch (err) { setError(err.response?.data?.error || 'No se pudo eliminar el producto.'); }
  };

  const totalUnidades = productos.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const bajos = productos.filter(p => Number(p.stock) <= 5).length;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <div className="page-kicker">CONTROL DE CATÁLOGO</div>
          <h1 className="page-title">Gestión de productos</h1>
          <p className="page-description">Administra artículos, precios y categorías desde una sola vista.</p>
        </div>
        <Link to="/kardex" className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
          <Icon name="kardex" size={17} /> Registrar movimiento
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-4"><div className="card"><div className="card-body py-3 d-flex justify-content-between align-items-center"><div><div className="metric-label">Productos</div><div className="fs-4 fw-bold">{productos.length}</div></div><span className="metric-icon icon-blue"><Icon name="product"/></span></div></div></div>
        <div className="col-sm-4"><div className="card"><div className="card-body py-3 d-flex justify-content-between align-items-center"><div><div className="metric-label">Unidades disponibles</div><div className="fs-4 fw-bold">{totalUnidades}</div></div><span className="metric-icon icon-green"><Icon name="category"/></span></div></div></div>
        <div className="col-sm-4"><div className="card"><div className="card-body py-3 d-flex justify-content-between align-items-center"><div><div className="metric-label">Bajo stock / agotado</div><div className="fs-4 fw-bold">{bajos}</div></div><span className="metric-icon icon-amber"><Icon name="alert"/></span></div></div></div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}
      {!categorias.length && <div className="alert alert-warning">Primero crea una categoría desde <Link to="/categorias">Categorías</Link>.</div>}

      <div className="row g-4">
        <div className="col-xl-4">
          <div className="card form-card">
            <div className="card-body">
              <h2 className="section-title mb-1">{form.id !== null ? 'Editar producto' : 'Nuevo producto'}</h2>
              <p className="section-subtitle mb-4">Completa la información del artículo.</p>
              <form onSubmit={guardar}>
                <label className="form-label">Nombre del producto
                  <input className="form-control mt-1" placeholder="Ej. Teclado gamer" required value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}/>
                </label>
                <label className="form-label">Descripción
                  <input className="form-control mt-1" placeholder="Descripción breve" value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}/>
                </label>
                <label className="form-label">Precio (S/)
                  <input type="number" className="form-control mt-1" placeholder="0.00" min="0" step="0.01" required value={form.precio}
                    onChange={e => setForm({ ...form, precio: e.target.value })}/>
                </label>
                <label className="form-label">Categoría <span className="text-danger">*</span>
                  <select className="form-select mt-1" required value={form.categoria_id}
                    onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
                    <option value="">Selecciona una categoría</option>
                    {categorias.map(c => <option value={c.id} key={c.id}>{c.nombre}</option>)}
                  </select>
                </label>
                <label className="form-label">Proveedor (opcional)
                  <select className="form-select mt-1" value={form.proveedor_id}
                    onChange={e => setForm({ ...form, proveedor_id: e.target.value })}>
                    <option value="">Sin proveedor</option>
                    {proveedores.map(p => <option value={p.id} key={p.id}>{p.razon_social}</option>)}
                  </select>
                </label>
                <div className="alert alert-light border small py-2">Las existencias se modifican desde <Link to="/kardex">Kardex</Link>. Stock inicial: 0.</div>
                <button className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2" type="submit" disabled={guardando || !categorias.length}>
                  <Icon name={form.id !== null ? 'check' : 'plus'} size={17}/>{guardando ? 'Guardando...' : form.id !== null ? 'Actualizar producto' : 'Guardar producto'}
                </button>
                {form.id !== null && <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={() => setForm({ ...inicial })}>Cancelar edición</button>}
              </form>
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="card card-table h-100">
            <div className="card-head">
              <div className="data-toolbar">
                <div><h2 className="section-title">Listado de productos</h2><p className="section-subtitle mb-0">{visibles.length} resultados</p></div>
                <div className="d-flex flex-wrap gap-2">
                  <div className="search-box"><Icon name="search" size={17}/><input className="form-control form-control-sm" placeholder="Buscar producto..." aria-label="Buscar productos" value={busqueda} onChange={e => setBusqueda(e.target.value)}/></div>
                  <select className="form-select form-select-sm w-auto" aria-label="Filtrar por stock" value={filtro} onChange={e => setFiltro(e.target.value)}>
                    <option value="todos">Todos</option><option value="bajo">Stock bajo</option><option value="agotado">Agotados</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead><tr><th>Producto</th><th>Categoría</th><th>Proveedor</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
                <tbody>
                  {visibles.map(p => (
                    <tr key={p.id}>
                      <td><div className="fw-semibold">{p.nombre}</div><span className="small text-secondary">ID #{p.id}</span></td>
                      <td>{p.categoria?.nombre || 'Sin categoría'}</td>
                      <td>{p.proveedor?.razon_social || '—'}</td>
                      <td className="fw-semibold">S/ {Number(p.precio).toFixed(2)}</td>
                      <td><span className={`stock-pill ${Number(p.stock) === 0 ? 'stock-none' : Number(p.stock) <= 5 ? 'stock-low' : 'stock-ok'}`}>{p.stock} uds.</span></td>
                      <td className="text-nowrap"><button className="btn btn-sm btn-outline-primary me-1" onClick={() => editar(p)}>Editar</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(p.id)}>Eliminar</button></td>
                    </tr>
                  ))}
                  {!visibles.length && <tr><td colSpan="6"><div className="empty-block">No se encontraron productos con esos filtros.</div></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
