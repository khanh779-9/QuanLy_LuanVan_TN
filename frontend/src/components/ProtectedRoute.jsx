import { Outlet, Navigate,useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { token } = useAuth() || {};
  const location = useLocation();
  if (!token) {
    if (location.pathname.startsWith("/sv/")) {
      return <Navigate to="/sv/login" replace />;
    }
    // Ngược lại (admin, gv) thì đá về /login mặc định
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
