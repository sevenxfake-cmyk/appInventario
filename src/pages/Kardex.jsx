import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import Icon from '../components/ui/Icon.jsx';

const inicial = { producto_id: '', usuario_id: '', tipo_movimiento: 'Entrada', cantidad: '', observaciones: '' };

export default function Kardex() {
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [form, setForm] = useState({ ...inicial });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [filtro, setFiltro] = useState('Todos');

  const cargar = useCallback(async () => {
    try {
      const [p, u, m] = await Promise.all([
        api.get('/productos'), api.get('/usuarios'), api.get('/movimientos')
      ]);
      setProductos(p.data);
      setUsuarios(u.data);
      setMovimientos(m.data);
    } catch (err) { setError(err.response?.data?.error || 'No se pudo cargar la información del Kardex.'); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true); setError(''); setMensaje('');
    try {
      await api.post('/movimientos', {
        producto_id: Number(form.producto_id),
        usuario_id: Number(form.usuario_id),
        tipo_movimiento: form.tipo_movimiento,
        cantidad: Number(form.cantidad),
        observaciones: form.observaciones
      });
      setForm({ ...inicial });
      setMensaje('Movimiento registrado. Stock actualizado dentro de la misma transacción.');
      await cargar();
    } catch (err) { setError(err.response?.data?.error || 'No se pudo registrar el movimiento.'); }
    finally { setGuardando(false); }
  };
  return (
    <>
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <div className="page-kicker">CONTROL DE EXISTENCIAS</div>
          <h1 className="page-title">Kardex y movimientos</h1>
          <p className="page-description">Registra entradas, salidas y ajustes con historial de cada cambio de stock.</p>
        </div>
        <span className="metric-icon icon-violet"><Icon name="kardex" size={23}/></span>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-sm-4"><div className="card"><div className="card-body py-3"><div className="metric-label">Total de movimientos</div><div className="fw-bold fs-3">{movimientos.length}</div></div></div></div>
        <div className="col-sm-4"><div className="card"><div className="card-body py-3"><div className="metric-label">Entradas recientes</div><div className="fw-bold fs-3 text-success">{movimientos.filter(m => m.tipo_movimiento === 'Entrada').length}</div></div></div></div>
        <div className="col-sm-4"><div className="card"><div className="card-body py-3"><div className="metric-label">Salidas recientes</div><div className="fw-bold fs-3 text-danger">{movimientos.filter(m => m.tipo_movimiento === 'Salida').length}</div></div></div></div>
      </div>
      {!usuarios.length && <div className="alert alert-warning">
        Primero crea un usuario administrador con el comando npm run seed:admin del backend. El responsable se elige solo para esta práctica; todavía no hay login.
      </div>}
      {!productos.length && <div className="alert alert-warning">
        No hay productos disponibles. <Link to="/productos">Registrar productos</Link>.
      </div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      <div className="row g-4">
        <div className="col-lg-4">
          <form className="card form-card" onSubmit={guardar}>
            <div className="card-body">
              <h2 className="section-title mb-1">Nuevo movimiento</h2>
              <p className="section-subtitle mb-4">Actualiza el inventario de forma controlada.</p>
            <label className="form-label">Producto
              <select className="form-select mt-1" required value={form.producto_id}
                onChange={e => setForm({ ...form, producto_id: e.target.value })}>
                <option value="">Seleccionar producto</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>)}
              </select>
            </label>
            <label className="form-label">Responsable
              <select className="form-select" required value={form.usuario_id}
                onChange={e => setForm({ ...form, usuario_id: e.target.value })}>
                <option value="">Seleccionar usuario</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} — {u.rol}</option>)}
              </select>
            </label>
            <label className="form-label">Tipo de movimiento
              <select className="form-select" value={form.tipo_movimiento}
                onChange={e => setForm({ ...form, tipo_movimiento: e.target.value, cantidad: '' })}>
                <option>Entrada</option><option>Salida</option><option>Ajuste</option>
              </select>
            </label>
            <label className="form-label">{form.tipo_movimiento === 'Ajuste' ? 'Stock final deseado' : 'Cantidad'}
              <input type="number" min={form.tipo_movimiento === 'Ajuste' ? '0' : '1'} step="1"
                className="form-control mt-1" required value={form.cantidad}
                onChange={e => setForm({ ...form, cantidad: e.target.value })} />
            </label>
            <label className="form-label">Observaciones
              <textarea className="form-control" rows="2" value={form.observaciones}
                onChange={e => setForm({ ...form, observaciones: e.target.value })} />
            </label>
            <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" disabled={guardando || !usuarios.length || !productos.length}><Icon name="plus" size={17}/> Registrar movimiento</button>
            </div>
          </form>
        </div>
        <div className="col-lg-8">
          <div className="card card-table h-100">
            <div className="card-head d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div><h2 className="section-title">Historial de movimientos</h2><p className="section-subtitle mb-0">Últimos registros del Kardex</p></div>
              <select className="form-select form-select-sm w-auto" value={filtro} onChange={e => setFiltro(e.target.value)} aria-label="Filtrar movimientos">
                <option>Todos</option><option>Entrada</option><option>Salida</option><option>Ajuste</option>
              </select>
            </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead ><tr><th>Fecha</th><th>Producto</th><th>Responsable</th><th>Tipo</th><th>Cantidad</th><th>Antes</th><th>Después</th><th>Observaciones</th></tr></thead>
              <tbody>{movimientos.filter(m => filtro === 'Todos' || m.tipo_movimiento === filtro).map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.fecha_hora).toLocaleString('es-PE')}</td>
                  <td>{m.producto?.nombre || m.producto_id}</td>
                  <td>{m.usuario?.nombre || m.usuario_id}</td>
                  <td><span className={`movement-type ${m.tipo_movimiento === 'Entrada' ? 'movement-in' : m.tipo_movimiento === 'Salida' ? 'movement-out' : 'movement-adjust'}`}>{m.tipo_movimiento}</span></td><td className="fw-semibold">{m.cantidad}</td>
                  <td>{m.stock_anterior}</td><td>{m.stock_nuevo}</td><td>{m.observaciones}</td>
                </tr>
              ))}
                {!movimientos.filter(m => filtro === 'Todos' || m.tipo_movimiento === filtro).length && <tr><td colSpan="8"><div className="empty-block">No hay movimientos para este filtro.</div></td></tr>}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
