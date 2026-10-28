import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Productos from './pages/Productos.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Kardex from './pages/Kardex.jsx';

const menus = [
  { to: '/', texto: 'Inicio' },
  { to: '/productos', texto: 'Productos' },
  { to: '/categorias', texto: 'Categorías' },
  { to: '/proveedores', texto: 'Proveedores' },
  { to: '/kardex', texto: 'Kardex' }
];

function App() {
  return (
    <>
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg shadow-sm">
        <div className="container">
          <NavLink className="navbar-brand" to="/">SENATI - Inventario</NavLink>
          <div className="d-flex flex-wrap gap-2">
            {menus.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                className={({ isActive }) => 'btn btn-sm ' + (isActive ? 'btn-light' : 'btn-outline-light')}>
                {item.texto}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/categorias" element={<Catalogo tipo="categorias" />} />
          <Route path="/proveedores" element={<Catalogo tipo="proveedores" />} />
          <Route path="/kardex" element={<Kardex />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
export default App;
