const CLAVE = 'senati-inventario-sesion';

function tokenVigente(token) {
  if (typeof token !== 'string') return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch { return false; }
}

export function obtenerSesion() {
  try {
    const sesion = JSON.parse(sessionStorage.getItem(CLAVE) || 'null');
    if (sesion?.token && sesion?.usuario && tokenVigente(sesion.token)) return sesion;
    sessionStorage.removeItem(CLAVE);
    return null;
  } catch {
    return null;
  }
}
export function guardarSesion(sesion) {
  if (!tokenVigente(sesion?.token)) throw new Error('El token recibido no es válido.');
  sessionStorage.setItem(CLAVE, JSON.stringify({
    token: sesion.token,
    usuario: sesion.usuario
  }));
}
export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE);
}
export function avisarSesionExpirada() {
  cerrarSesion();
  window.dispatchEvent(new Event('inventario:sesion-expirada'));
}
