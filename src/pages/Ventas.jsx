import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { demoMode } from '../services/api.js';
import ComprobanteVenta from '../components/ComprobanteVenta.jsx';

const dinero = n => 'S/ ' + Number(n || 0).toFixed(2);
export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState('');
  const [documento, setDocumento] = useState('');
  const [pago, setPago] = useState('Efectivo');
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [comprobante, setComprobante] = useState(null);

  async function cargar() {
    try { setProductos((await api.get('/productos')).data); }
    catch (err) { setError(err.response?.data?.error || 'No se pudieron consultar los productos.'); }
  }
  useEffect(() => { if (!demoMode) cargar(); }, []);
  const visibles = useMemo(() => productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  ), [productos, busqueda]);
  const disponibles = producto => Number(producto.stock) - (carrito.find(x => x.id === producto.id)?.cantidad || 0);
  function agregar(p) {
    if (disponibles(p) < 1) return;
    setCarrito(actual => {
      const existente = actual.find(x => x.id === p.id);
      return existente
        ? actual.map(x => x.id === p.id ? { ...x, cantidad: x.cantidad + 1 } : x)
        : [...actual, { id: p.id, nombre: p.nombre, precio: Number(p.precio), cantidad: 1, stock: Number(p.stock) }];
    });
  }
  function cantidad(id, n) {
    const valor = Number(n);
    setCarrito(actual => actual.map(x => x.id === id
      ? { ...x, cantidad: Math.min(Number(x.stock), Math.max(1, valor || 1)) } : x));
  }
  const total = carrito.reduce((s, x) => s + Math.round(Number(x.precio) * 100) * x.cantidad, 0) / 100;
  const unidades = carrito.reduce((s, x) => s + x.cantidad, 0);
  async function vender() {
    if (!carrito.length || guardando) return;
    setError(''); setGuardando(true);
    try {
      const { data } = await api.post('/ventas', {
        cliente_nombre: cliente.trim() || 'Cliente general', cliente_documento: documento.trim(),
        metodo_pago: pago,
        items: carrito.map(x => ({ producto_id: x.id, cantidad: x.cantidad }))
      });
      setComprobante(data); setCarrito([]); setCliente(''); setDocumento(''); setPago('Efectivo');
      await cargar();
    } catch (err) { setError(err.response?.data?.error || 'No se pudo registrar la venta.'); }
    finally { setGuardando(false); }
  }
  if (demoMode) return <div className="card p-4"><h1 className="page-title">Ventas</h1>
    <p>Para registrar ventas reales y modificar el stock, conecta el sistema al backend MySQL. Este módulo no está disponible en la demostración.</p></div>;
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-4">
        <div><div className="page-kicker">PUNTO DE VENTA</div><h1 className="page-title">Nueva venta</h1>
          <p className="page-description">Selecciona productos, registra el cobro y consulta tu comprobante interno.</p></div>
        <Link to="/historial-ventas" className="btn btn-outline-primary">Ver historial de ventas</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-4">
        <div className="col-xl-7">
          <div className="card h-100"><div className="card-body">
            <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
              <h2 className="section-title">Catálogo disponible</h2><span className="text-secondary small">{visibles.length} productos</span>
            </div>
            <input className="form-control mb-3" aria-label="Buscar productos para vender" placeholder="Buscar por nombre..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
            <div className="product-picker">
              {visibles.map(p => <div className="product-picker-item" key={p.id}>
                <div className="flex-grow-1"><strong>{p.nombre}</strong>
                  <div className="text-secondary small">{p.categoria?.nombre || 'Producto'} · {Number(p.stock)} disponibles</div>
                </div>
                <strong className="text-nowrap">{dinero(p.precio)}</strong>
                <button className="btn btn-sm btn-outline-primary" disabled={disponibles(p) < 1} onClick={() => agregar(p)}>Agregar</button>
              </div>)}
              {!visibles.length && <div className="empty-block">No se encontraron productos.</div>}
            </div>
          </div></div>
        </div>
        <div className="col-xl-5"><div className="card sale-checkout"><div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-title">Resumen de venta</h2><span className="badge text-bg-light">{unidades} unidades</span>
          </div>
          <label className="form-label w-100">Nombre del cliente (opcional)
            <input className="form-control mt-1" maxLength={150} placeholder="Cliente general"
              value={cliente} onChange={e => setCliente(e.target.value)}/>
          </label>
          <label className="form-label w-100">DNI / documento (opcional)
            <input className="form-control mt-1" maxLength={20} placeholder="Número de documento"
              value={documento} onChange={e => setDocumento(e.target.value)}/>
          </label>
          <label className="form-label w-100 mb-3">Medio de pago
            <select className="form-select mt-1" value={pago} onChange={e => setPago(e.target.value)}>
              {['Efectivo', 'Yape', 'Plin', 'Transferencia', 'Tarjeta', 'Otro'].map(m => <option key={m}>{m}</option>)}
            </select>
          </label>
          <div className="border-top pt-3">
            {!carrito.length && <div className="empty-block">Agrega productos para comenzar la venta.</div>}
            {carrito.map(x => <div className="cart-line" key={x.id}>
              <div className="flex-grow-1"><div className="fw-semibold">{x.nombre}</div>
                <div className="text-secondary small">{dinero(x.precio)} por unidad</div></div>
              <input type="number" min={1} max={x.stock} className="form-control form-control-sm cart-qty"
                aria-label={'Cantidad de ' + x.nombre} value={x.cantidad} onChange={e => cantidad(x.id, e.target.value)}/>
              <strong>{dinero(x.precio * x.cantidad)}</strong>
              <button aria-label={'Quitar ' + x.nombre} className="btn btn-sm btn-light text-danger" onClick={() => setCarrito(c => c.filter(i => i.id !== x.id))}>×</button>
            </div>)}
          </div>
          <div className="sale-total"><span>Total de venta</span><strong>{dinero(total)}</strong></div>
          <button className="btn btn-primary w-100 py-3 mt-3" disabled={!carrito.length || guardando}
            onClick={vender}>{guardando ? 'Registrando...' : 'Confirmar venta'}</button>
          <p className="small text-secondary mt-3 mb-0">Se descuenta el stock automáticamente. Se emite solo un comprobante interno, no un documento electrónico SUNAT.</p>
        </div></div></div>
      </div>
      <ComprobanteVenta venta={comprobante} onClose={() => setComprobante(null)}/>
    </>
  );
}
