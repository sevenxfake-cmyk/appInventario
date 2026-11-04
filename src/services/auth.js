const CLAVE = 'senati-inventario-sesion';

export function obtenerSesion() {
  try {
    const sesion = JSON.parse(sessionStorage.getItem(CLAVE) || 'null');
    return sesion?.token && sesion?.usuario ? sesion : null;
  } catch { return null; }
}
export function guardarSesion(sesion) {
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
