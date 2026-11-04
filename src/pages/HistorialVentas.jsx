import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { demoMode } from '../services/api.js';
import { obtenerSesion } from '../services/auth.js';
import ComprobanteVenta from '../components/ComprobanteVenta.jsx';
const dinero = n => 'S/ ' + Number(n || 0).toFixed(2);
export default function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todas');
  const [seleccionada, setSeleccionada] = useState(null);
  const [error, setError] = useState('');
  const [anulando, setAnulando] = useState(null);
  const esAdmin = obtenerSesion()?.usuario?.rol === 'Administrador';
  const cargar = useCallback(async () => {
    try { setVentas((await api.get('/ventas')).data); }
    catch (err) { setError(err.response?.data?.error || 'No se pudo cargar el historial.'); }
  }, []);
  useEffect(() => { if (!demoMode) cargar(); }, [cargar]);
  const lista = useMemo(() => ventas.filter(v => {
    const texto = (v.numero_interno + ' ' + v.cliente_nombre + ' ' + (v.vendedor?.nombre || '')).toLowerCase();
    return texto.includes(busqueda.toLowerCase()) && (filtro === 'Todas' || v.estado === filtro);
  }), [ventas, busqueda, filtro]);
  const total = ventas.filter(v => v.estado === 'Emitida').reduce((s, v) => s + Number(v.total), 0);
  async function anular(v) {
    const motivo = window.prompt('Motivo de anulación de ' + v.numero_interno + ' (mínimo 5 caracteres):');
    if (motivo === null) return;
    if (motivo.trim().length < 5) { setError('Indica un motivo de al menos 5 caracteres.'); return; }
    if (!window.confirm('Se anulará esta venta y se restaurará su stock. El registro permanecerá en el historial. ¿Continuar?')) return;
    setError(''); setAnulando(v.id);
    try { await api.post('/ventas/' + v.id + '/anular', { motivo: motivo.trim() }); await cargar(); }
    catch (err) { setError(err.response?.data?.error || 'No se pudo anular la venta.'); }
    finally { setAnulando(null); }
  }
  if (demoMode) return <div className="card p-4"><h1 className="page-title">Historial de ventas</h1>
    <p>Conecta el backend MySQL para consultar y anular ventas registradas.</p></div>;
  return (<>
    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
      <div><div className="page-kicker">CONTROL DE OPERACIONES</div><h1 className="page-title">Historial de ventas</h1>
        <p className="page-description">Consulta comprobantes internos y administra anulaciones sin borrar información.</p></div>
      <Link to="/ventas" className="btn btn-primary">+ Nueva venta</Link>
    </div>
    {error && <div className="alert alert-danger">{error}</div>}
    <div className="row g-3 mb-4">
      <div className="col-md-4"><div className="card p-3"><span className="metric-label">Ventas registradas</span><strong className="fs-3">{ventas.length}</strong></div></div>
      <div className="col-md-4"><div className="card p-3"><span className="metric-label">Ventas vigentes</span><strong className="fs-3">{ventas.filter(v => v.estado === 'Emitida').length}</strong></div></div>
      <div className="col-md-4"><div className="card p-3"><span className="metric-label">Total de ventas vigentes</span><strong className="fs-3">{dinero(total)}</strong></div></div>
    </div>
    <div className="card card-table">
      <div className="card-head d-flex gap-3 align-items-center justify-content-between flex-wrap">
        <h2 className="section-title">Movimientos de venta</h2>
        <div className="d-flex flex-wrap gap-2">
          <input aria-label="Buscar ventas" className="form-control" placeholder="Buscar número o cliente" value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
          <select aria-label="Filtrar por estado" className="form-select w-auto" value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option>Todas</option><option>Emitida</option><option>Anulada</option>
          </select>
        </div>
      </div>
      <div className="table-responsive"><table className="table table-hover">
        <thead><tr><th>Comprobante</th><th>Fecha</th><th>Cliente</th><th>Pago</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>{lista.map(v => <tr key={v.id}>
          <td className="fw-bold">{v.numero_interno}</td>
          <td>{new Date(v.createdAt).toLocaleString('es-PE')}</td>
          <td>{v.cliente_nombre}</td><td>{v.metodo_pago}</td><td className="fw-bold">{dinero(v.total)}</td>
          <td><span className={'badge ' + (v.estado === 'Emitida' ? 'text-bg-success' : 'text-bg-secondary')}>{v.estado}</span></td>
          <td className="text-nowrap"><button className="btn btn-outline-primary btn-sm me-2" onClick={() => setSeleccionada(v)}>Ver comprobante</button>
            {v.estado === 'Emitida' && esAdmin && <button disabled={anulando === v.id}
              onClick={() => anular(v)} className="btn btn-outline-danger btn-sm">{anulando === v.id ? 'Anulando...' : 'Anular'}</button>}
          </td></tr>)}
          {!lista.length && <tr><td colSpan={7}><div className="empty-block">No hay ventas con estos filtros.</div></td></tr>}
        </tbody>
      </table></div>
    </div>
    <p className="small text-secondary mt-3">Anular no elimina el registro. Restaura el stock y conserva la operación en el historial. No realiza trámites ante SUNAT.</p>
    <ComprobanteVenta venta={seleccionada} onClose={() => setSeleccionada(null)}/>
  </>);
}
