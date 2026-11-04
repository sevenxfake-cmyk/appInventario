import { useState } from 'react';
import api from '../services/api.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function ingresar(event) {
    event.preventDefault();
    setCargando(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (!data.token || !data.usuario) throw new Error('Respuesta de sesión incompleta.');
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'No se pudo iniciar sesión.');
    } finally { setCargando(false); }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-5"
      style={{ background: 'linear-gradient(140deg, #101c35, #243f76)' }}>
      <div className="card border-0 shadow-lg w-100" style={{ maxWidth: 435 }}>
        <div className="card-body p-4 p-sm-5">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="brand-mark">S</div>
            <div>
              <h1 className="h4 fw-bold mb-0">SENATI Inventory</h1>
              <div className="text-secondary small">Acceso seguro al inventario</div>
            </div>
          </div>
          <h2 className="h5 fw-bold">Iniciar sesión</h2>
          <p className="text-secondary small mb-4">Ingresa con tu usuario registrado en la API.</p>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <form onSubmit={ingresar}>
            <label className="form-label w-100">Correo electrónico
              <input type="email" autoComplete="username" className="form-control mt-1"
                required maxLength={160} value={email} onChange={e => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"/>
            </label>
            <label className="form-label w-100 mt-2">Contraseña
              <input type="password" autoComplete="current-password" className="form-control mt-1"
                required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Tu contraseña"/>
            </label>
            <button type="submit" className="btn btn-primary w-100 py-2 mt-3" disabled={cargando}>
              {cargando ? 'Verificando...' : 'Ingresar al inventario'}
            </button>
          </form>
          <p className="text-secondary small mt-4 mb-0 text-center">
            Laboratorio #10 · Autenticación JWT
          </p>
        </div>
      </div>
    </div>
  );
}
