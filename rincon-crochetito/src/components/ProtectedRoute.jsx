import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

/** calcula la ruta base según el rol */
function routeForRole(rol) {
  const r = (rol || "").toUpperCase();
  if (r === "SUPERADMIN" || r === "ADMIN") return "/admin";
  if (r === "VENDEDOR") return "/vendedor";
  return "/mi-cuenta";
}

/**
 * Guard de rutas con control por roles.
 * - Si no hay sesión -> /login (preserva "from")
 * - Si hay sesión pero rol no autorizado -> redirige a su panel.
 * - Renderiza children si existen, si no, <Outlet/> (para nested routes)
 */
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const loc = useLocation();

  // sin sesión -> login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  // con sesión, pero rol no permitido -> a su panel
  const need = (roles || []).map(r => r.toUpperCase());
  const have = (user.rol || "").toUpperCase();
  if (need.length > 0 && !need.includes(have)) {
    return <Navigate to={routeForRole(have)} replace />;
  }

  // ok
  return children ? children : <Outlet />;
}
