import { useEffect, useState } from 'react';
import api from '../services/api.js';

const indicadores = [
  ['totalProductos', 'Total de productos'],
  ['bajoStock', 'Productos con bajo stock (≤ 5)'],
  ['totalCategorias', 'Categorías'],
  ['totalProveedores', 'Proveedores'],
  ['totalMovimientos', 'Movimientos Kardex']
];

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/dashboard/resumen').then(r => setResumen(r.data))
      .catch(() => setError('No se pudo cargar el Dashboard. Comprueba el backend y la migración.'));
  }, []);
  return (
    <>
      <h2 className="mb-3">Dashboard de Inventario</h2>
      <p className="text-secondary">Indicadores del catálogo y su historial de movimientos.</p>
      {error && <div className="alert alert-danger">{error}</div>}
      {!resumen && !error && <p>Cargando indicadores...</p>}
      <div className="row g-3">
        {resumen && indicadores.map(([campo, nombre]) => (
          <div className="col-sm-6 col-lg-4" key={campo}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <p className="text-secondary mb-1">{nombre}</p>
                <strong className="display-6">{resumen[campo]}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
