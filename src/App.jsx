import { useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Productos from './pages/Productos.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Kardex from './pages/Kardex.jsx';
import Icon from './components/ui/Icon.jsx';
import { demoMode } from './services/api.js';

const menus = [
  { to: '/', texto: 'Dashboard', icono: 'dashboard' },
  { to: '/productos', texto: 'Productos', icono: 'product' },
  { to: '/categorias', texto: 'Categorías', icono: 'category' },
  { to: '/proveedores', texto: 'Proveedores', icono: 'supplier' },
  { to: '/kardex', texto: 'Kardex', icono: 'kardex' }
];

export default function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { pathname } = useLocation();
  const seccion = menus.find(m => m.to === pathname)?.texto || 'Dashboard';

  return (
    <div className="app-shell">
      {menuAbierto && <button className="sidebar-backdrop d-lg-none" aria-label="Cerrar menú" onClick={() => setMenuAbierto(false)} />}
      <aside className={`app-sidebar ${menuAbierto ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-title">SENATI <span>Inventory</span></div>
            <div className="brand-subtitle">Sistema de gestión</div>
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
          <div className="environment-label"><span className="online-indicator" /> {demoMode ? 'Modo demostración' : 'Entorno local'}</div>
          <p className="mb-0 small">{demoMode ? 'Datos guardados en este navegador' : 'React + Express + MySQL'}</p>
          <div className="small opacity-50 mt-1">Proyecto académico · SENATI</div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light border d-lg-none" aria-label="Abrir menú" onClick={() => setMenuAbierto(true)}>
              <Icon name="menu"/>
            </button>
            <div>
              <div className="topbar-overline">Panel administrativo <span className="mx-1">/</span> {seccion}</div>
              <div className="topbar-heading">{seccion}</div>
            </div>
          </div>
          <div className="d-none d-sm-flex align-items-center gap-2">
            <span className="topbar-status"><span className="online-indicator" /> Gestión de inventario</span>
            <div className="avatar-initials" title="Sistema SENATI">SI</div>
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
              <Route path="/" element={<Dashboard />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/categorias" element={<Catalogo key="categorias" tipo="categorias" />} />
              <Route path="/proveedores" element={<Catalogo key="proveedores" tipo="proveedores" />} />
              <Route path="/kardex" element={<Kardex />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <footer className="app-footer">SENATI · Full Stack Developer Software <span>Inventario administrativo</span></footer>
        </main>
      </div>
    </div>
  );
}
