import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Productos from './pages/Productos.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Kardex from './pages/Kardex.jsx';
import Ventas from './pages/Ventas.jsx';
import HistorialVentas from './pages/HistorialVentas.jsx';
import Icon from './components/ui/Icon.jsx';
import { demoMode } from './services/api.js';
import { obtenerSesion, guardarSesion, cerrarSesion } from './services/auth.js';
import Login from './pages/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';

const menus = [
  { to: '/', texto: 'Dashboard', icono: 'dashboard' },
  { to: '/ventas', texto: 'Nueva venta', icono: 'money' },
  { to: '/historial-ventas', texto: 'Historial de ventas', icono: 'clock' },
  { to: '/productos', texto: 'Productos', icono: 'product' },
  { to: '/categorias', texto: 'Categorías', icono: 'category' },
  { to: '/proveedores', texto: 'Proveedores', icono: 'supplier' },
  { to: '/kardex', texto: 'Kardex', icono: 'kardex' }
];

export default function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sesion, setSesion] = useState(() => obtenerSesion());
  useEffect(() => {
    const expirar = () => setSesion(null);
    window.addEventListener('inventario:sesion-expirada', expirar);
    return () => window.removeEventListener('inventario:sesion-expirada', expirar);
  }, []);
  function entrar(datos) { guardarSesion(datos); setSesion(obtenerSesion()); }
  function salir() { cerrarSesion(); setSesion(null); }

  const { pathname } = useLocation();
  const seccion = menus.find(m => m.to === pathname)?.texto || 'Dashboard';
  const usuario = sesion?.usuario?.nombre || (demoMode ? 'Invitado' : 'Usuario');
  const rol = sesion?.usuario?.rol || (demoMode ? 'Vista de demostración' : 'Usuario');
  const iniciales = usuario.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();

  if (!demoMode && !sesion) return (
    <Routes>
      <Route path="/login" element={<Login onLogin={entrar} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );

  return (
    <div className="app-shell">
      {menuAbierto && <button className="sidebar-backdrop d-lg-none" aria-label="Cerrar menú" onClick={() => setMenuAbierto(false)} />}
      <aside className={`app-sidebar ${menuAbierto ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">M</div>
          <div>
            <div className="brand-title">Mi Tienda <span>360</span></div>
            <div className="brand-subtitle">Ventas e inventario</div>
          </div>
          <button className="btn btn-sm text-white ms-auto d-lg-none" aria-label="Cerrar menú" onClick={() => setMenuAbierto(false)}>
            <Icon name="close" />
          </button>
        </div>

        <div className="sidebar-section-label">MENÚ PRINCIPAL</div>
        <nav className="sidebar-links" aria-label="Navegación del inventario">
          {menus.map(m => (
            <NavLink key={m.to} to={m.to} end={m.to === '/'}
              onClick={() => setMenuAbierto(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon name={m.icono} size={19}/>
              <span>{m.texto}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom mt-auto">
          <div className="sidebar-user"><span className="sidebar-avatar">{iniciales || "U"}</span><span><strong>{usuario}</strong><small>{rol}</small></span></div>
          <div className="environment-label"><span className="online-indicator" /> {demoMode ? 'Modo demostración' : 'Entorno local'}</div>
          <p className="mb-0 small">{demoMode ? 'Datos solo en este navegador' : 'Datos conectados a la tienda'}</p>
          {!demoMode && <button type="button" onClick={salir} className="btn btn-sm btn-outline-light mt-3 w-100">Cerrar sesión</button>}
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light border d-lg-none" aria-label="Abrir menú" onClick={() => setMenuAbierto(true)}>
              <Icon name="menu"/>
            </button>
            <div>
              <div className="topbar-overline">Gestión comercial <span className="mx-1">/</span> {seccion}</div>
              <div className="topbar-heading">{seccion}</div>
            </div>
          </div>
          <div className="d-none d-sm-flex align-items-center gap-2">
            <span className="topbar-status"><span className="online-indicator" /> Sistema conectado</span>
            <div className="header-user"><span className="avatar-initials">{iniciales || "U"}</span><span><strong>{usuario}</strong><small>{rol}</small></span></div>
            {!demoMode && <button type="button" onClick={salir} className="btn btn-sm btn-outline-secondary">Salir</button>}
          </div>
        </header>
        <main className="app-content">
          {demoMode && (
            <div className="alert alert-info d-flex flex-wrap align-items-center gap-2 mb-4 shadow-sm" role="status">
              <strong>Modo demostración</strong>
              <span>Los datos de ejemplo y tus cambios se guardan solamente en este navegador. No están conectados a MySQL.</span>
            </div>
          )}
          <div className="container-fluid px-0">
            <Routes>
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
              <Route path="/ventas" element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
              <Route path="/historial-ventas" element={<ProtectedRoute><HistorialVentas /></ProtectedRoute>} />
              <Route path="/categorias" element={<ProtectedRoute><Catalogo key="categorias" tipo="categorias" /></ProtectedRoute>} />
              <Route path="/proveedores" element={<ProtectedRoute><Catalogo key="proveedores" tipo="proveedores" /></ProtectedRoute>} />
              <Route path="/kardex" element={<ProtectedRoute><Kardex /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <footer className="app-footer">Mi Tienda 360 <span>Control de ventas e inventario</span></footer>
        </main>
      </div>
    </div>
  );
}
