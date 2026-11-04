import { Navigate, useLocation } from 'react-router-dom';
import { demoMode } from '../../services/api.js';
import { obtenerSesion } from '../../services/auth.js';

// Oculta páginas privadas en React. La protección real se valida en miApi.
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!demoMode && !obtenerSesion()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
