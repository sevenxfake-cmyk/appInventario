import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import Icon from '../components/ui/Icon.jsx';

const soles = (n) => new Intl.NumberFormat('es-PE', {
  style: 'currency', currency: 'PEN', maximumFractionDigits: 2
}).format(n || 0);

const dayKey = (fecha) => {
  const f = new Date(fecha);
  return [f.getFullYear(), String(f.getMonth() + 1).padStart(2, '0'), String(f.getDate()).padStart(2, '0')].join('-');
};

function Metric({ titulo, valor, detalle, icono, color }) {
  return (
    <div className="col-sm-6 col-xl-3">
      <div className="card metric-card">
        <div className="card-body">
          <div className="metric-top">
            <span className="metric-label">{titulo}</span>
            <span className={`metric-icon icon-${color}`}><Icon name={icono} size={21} /></span>
          </div>
          <div className="metric-value">{valor}</div>
          <div className="metric-detail">{detalle}</div>
        </div>
      </div>
    </div>
  );
}

function CardHeading({ titulo, detalle, extra }) {
  return (
    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
      <div>
        <h3 className="section-title">{titulo}</h3>
        <div className="section-subtitle">{detalle}</div>
      </div>
      {extra}
    </div>
  );
}

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [resumen, productos, categorias, movimientos] = await Promise.all([
        api.get('/dashboard/resumen'),
        api.get('/productos'),
        api.get('/categorias'),
        api.get('/movimientos')
      ]);
      setDatos({
        resumen: resumen.data, productos: productos.data,
        categorias: categorias.data, movimientos: movimientos.data
      });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron obtener las estadísticas. Comprueba que miApi esté funcionando en el puerto 3006.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const estadisticas = useMemo(() => {
    if (!datos) return null;
    const { resumen, productos, categorias, movimientos } = datos;
    const sinStock = productos.filter(p => Number(p.stock) === 0).length;
    const bajoStock = productos.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
    const suficiente = productos.filter(p => Number(p.stock) > 5).length;
    const valor = productos.reduce((acc, p) => acc + Number(p.precio || 0) * Number(p.stock || 0), 0);
    const unidades = productos.reduce((acc, p) => acc + Number(p.stock || 0), 0);
    const categoriaMap = new Map();
    for (const p of productos) {
      const nombre = p.categoria?.nombre || 'Sin categoría';
      categoriaMap.set(nombre, (categoriaMap.get(nombre) || 0) + 1);
    }
    const categoriasOrdenadas = [...categoriaMap].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxCategoria = Math.max(1, ...categoriasOrdenadas.map(c => c[1]));
    const hoy = new Date();
    const dias = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - (6 - i));
      const clave = dayKey(fecha);
      return {
        clave,
        etiqueta: fecha.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', ''),
        cantidad: movimientos.filter(m => dayKey(m.fecha_hora) === clave).length
      };
    });
    const maxDia = Math.max(1, ...dias.map(d => d.cantidad));
    return {
      resumen, productos, categorias, movimientos, sinStock, bajoStock, suficiente,
      valor, unidades, categoriasOrdenadas, maxCategoria, dias, maxDia
    };
  }, [datos]);

  return (
    <>
      <div className="dashboard-hero mb-4">
        <div className="hero-content d-flex flex-wrap align-items-center justify-content-between gap-4">
          <div>
            <div className="hero-eyebrow">PANEL DE CONTROL · SENATI</div>
            <h1 className="hero-title">Tu inventario, bajo control.</h1>
            <p className="hero-subtitle">Consulta existencias, analiza tus productos y lleva el historial de cada movimiento desde un solo lugar.</p>
          </div>
          <Link to="/productos" className="btn btn-light hero-action d-inline-flex align-items-center gap-2">
            <Icon name="product" size={18}/> Ver productos <Icon name="arrow" size={16}/>
          </Link>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <div>
          <div className="page-kicker">RESUMEN GENERAL</div>
          <h2 className="page-title">Estadísticas del inventario</h2>
          <p className="page-description">Datos calculados desde MySQL mediante la API REST.</p>
        </div>
        <button type="button" onClick={cargar} disabled={cargando} className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2">
          <Icon name="refresh" size={16}/> Actualizar datos
        </button>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {cargando && <div className="card mb-4"><div className="card-body text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status" aria-label="Cargando"/>
        <p className="text-secondary mb-0">Consultando estadísticas...</p>
      </div></div>}

      {!cargando && estadisticas && (
        <>
          <div className="row g-3 mb-4">
            <Metric titulo="Total de productos" valor={estadisticas.productos.length} detalle="Productos registrados en catálogo" icono="product" color="blue"/>
            <Metric titulo="Stock bajo o agotado" valor={estadisticas.sinStock + estadisticas.bajoStock} detalle="Productos con 5 unidades o menos" icono="alert" color="amber"/>
            <Metric titulo="Valor del inventario" valor={soles(estadisticas.valor)} detalle={`${estadisticas.unidades} unidades en existencia`} icono="money" color="green"/>
            <Metric titulo="Movimientos Kardex" valor={estadisticas.resumen.totalMovimientos} detalle="Registros históricos del inventario" icono="kardex" color="violet"/>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-lg-7">
              <div className="card insight-card h-100">
                <div className="card-body">
                  <CardHeading titulo="Productos por categoría" detalle="Distribución actual del catálogo"
                    extra={<span className="badge rounded-pill text-bg-light">{estadisticas.categorias.length} categorías</span>}/>
                  {estadisticas.categoriasOrdenadas.length ? estadisticas.categoriasOrdenadas.map(([nombre, cantidad]) => (
                    <div className="chart-row" key={nombre}>
                      <div className="d-flex justify-content-between">
                        <span className="chart-label">{nombre}</span><span className="chart-count">{cantidad} productos</span>
                      </div>
                      <div className="progress chart-progress" role="progressbar" aria-label={nombre}
                        aria-valuenow={cantidad} aria-valuemin="0" aria-valuemax={estadisticas.maxCategoria}>
                        <div className="progress-bar" style={{ width: `${(cantidad / estadisticas.maxCategoria) * 100}%` }}/>
                      </div>
                    </div>
                  )) : <div className="empty-block">No hay productos para mostrar en este gráfico.</div>}
                  {estadisticas.categoriasOrdenadas.length > 0 && <p className="text-secondary small mb-0 mt-3">Comparación de las cinco categorías con más productos.</p>}
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card insight-card h-100">
                <div className="card-body">
                  <CardHeading titulo="Estado de existencias" detalle="Disponibilidad de los productos"/>
                  <div className="d-flex align-items-baseline gap-2 mt-4 mb-3">
                    <span className="metric-value m-0">{estadisticas.productos.length}</span>
                    <span className="text-secondary small">productos evaluados</span>
                  </div>
                  <div className="stock-bar" role="img" aria-label={`Disponibles: ${estadisticas.suficiente}; bajo stock: ${estadisticas.bajoStock}; agotados: ${estadisticas.sinStock}`}>
                    {estadisticas.productos.length > 0 && <>
                      <div style={{ width: `${estadisticas.suficiente * 100 / estadisticas.productos.length}%`, background: '#25b986' }}/>
                      <div style={{ width: `${estadisticas.bajoStock * 100 / estadisticas.productos.length}%`, background: '#edb85a' }}/>
                      <div style={{ width: `${estadisticas.sinStock * 100 / estadisticas.productos.length}%`, background: '#eb7180' }}/>
                    </>}
                  </div>
                  <div className="stock-legend">
                    <span><i className="stock-legend-dot" style={{ background: '#25b986' }}/> Normal: <b>{estadisticas.suficiente}</b></span>
                    <span><i className="stock-legend-dot" style={{ background: '#edb85a' }}/> Bajo: <b>{estadisticas.bajoStock}</b></span>
                    <span><i className="stock-legend-dot" style={{ background: '#eb7180' }}/> Agotado: <b>{estadisticas.sinStock}</b></span>
                  </div>
                  <hr className="my-4"/>
                  <div className="d-flex align-items-center justify-content-between">
                    <div><div className="section-subtitle mt-0">Proveedores</div><div className="fw-bold fs-4">{estadisticas.resumen.totalProveedores}</div></div>
                    <div className="metric-icon icon-blue"><Icon name="supplier"/></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <div><div className="section-subtitle mt-0">Categorías registradas</div><div className="fw-bold fs-4">{estadisticas.resumen.totalCategorias}</div></div>
                    <div className="metric-icon icon-violet"><Icon name="category"/></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-lg-5">
              <div className="card insight-card h-100">
                <div className="card-body">
                  <CardHeading titulo="Actividad de movimientos" detalle="Cantidad de registros en los últimos 7 días"/>
                  <div className="activity-chart">
                    {estadisticas.dias.map(d => (
                      <div key={d.clave} className="activity-column" title={`${d.clave}: ${d.cantidad} movimientos`}>
                        <span className="small text-secondary">{d.cantidad || ''}</span>
                        <div className="activity-bar" style={{height: `${d.cantidad ? Math.max(8, d.cantidad / estadisticas.maxDia * 125) : 0}px`}}/>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    {estadisticas.dias.map(d => <div key={d.clave} className="activity-column"><span className="activity-day">{d.etiqueta}</span></div>)}
                  </div>
                  <p className="small text-secondary mt-4 mb-0">Basado en los movimientos recientes disponibles en la API.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="card card-table h-100">
                <div className="card-head">
                  <CardHeading titulo="Últimos movimientos" detalle="Actividad más reciente del Kardex"
                    extra={<Link to="/kardex" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">Ver todos <Icon name="arrow" size={14}/></Link>}/>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead><tr><th>Producto</th><th>Movimiento</th><th>Cantidad</th><th>Fecha</th></tr></thead>
                    <tbody>
                      {estadisticas.movimientos.slice(0, 5).map(m => (
                        <tr key={m.id}>
                          <td className="fw-semibold">{m.producto?.nombre || `Producto #${m.producto_id}`}</td>
                          <td><span className={`movement-type ${m.tipo_movimiento === 'Entrada' ? 'movement-in' : m.tipo_movimiento === 'Salida' ? 'movement-out' : 'movement-adjust'}`}>{m.tipo_movimiento}</span></td>
                          <td className="fw-semibold">{m.cantidad}</td>
                          <td className="text-secondary">{new Date(m.fecha_hora).toLocaleDateString('es-PE')}</td>
                        </tr>
                      ))}
                      {!estadisticas.movimientos.length && <tr><td colSpan="4"><div className="empty-block">Todavía no se han registrado movimientos.</div></td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
