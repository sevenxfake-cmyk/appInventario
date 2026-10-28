import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

const inicial = { producto_id: '', usuario_id: '', tipo_movimiento: 'Entrada', cantidad: '', observaciones: '' };

export default function Kardex() {
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [form, setForm] = useState({ ...inicial });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

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
      <h2>Kardex — Historial de inventario</h2>
      <p className="text-secondary">Entrada suma, Salida resta y Ajuste establece el stock final indicado. Cada operación guarda un historial.</p>
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
          <form className="card card-body shadow-sm" onSubmit={guardar}>
            <h5>Registrar movimiento</h5>
            <label className="form-label">Producto
              <select className="form-select" required value={form.producto_id}
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
                className="form-control" required value={form.cantidad}
                onChange={e => setForm({ ...form, cantidad: e.target.value })} />
            </label>
            <label className="form-label">Observaciones
              <textarea className="form-control" rows="2" value={form.observaciones}
                onChange={e => setForm({ ...form, observaciones: e.target.value })} />
            </label>
            <button className="btn btn-primary" disabled={guardando || !usuarios.length || !productos.length}>Registrar movimiento</button>
          </form>
        </div>
        <div className="col-lg-8">
          <h5>Últimos movimientos</h5>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark"><tr><th>Fecha</th><th>Producto</th><th>Responsable</th><th>Tipo</th><th>Cantidad</th><th>Antes</th><th>Después</th><th>Observaciones</th></tr></thead>
              <tbody>{movimientos.map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.fecha_hora).toLocaleString('es-PE')}</td>
                  <td>{m.producto?.nombre || m.producto_id}</td>
                  <td>{m.usuario?.nombre || m.usuario_id}</td>
                  <td>{m.tipo_movimiento}</td><td>{m.cantidad}</td>
                  <td>{m.stock_anterior}</td><td>{m.stock_nuevo}</td><td>{m.observaciones}</td>
                </tr>
              ))}
                {!movimientos.length && <tr><td colSpan="8" className="text-center">Sin movimientos registrados</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
