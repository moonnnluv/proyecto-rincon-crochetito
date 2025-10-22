import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

// Uso: <ProtectedRoute roles={["SUPERADMIN","ADMIN"]}><AdminApp/></ProtectedRoute>
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  if (roles?.length && !roles.includes(user.rol)) {
    // sin permisos -> a inicio (o a /)
    return <Navigate to="/" replace />;
  }
  return children || <Outlet />;
}
