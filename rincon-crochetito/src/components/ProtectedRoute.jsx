// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" replace />;
  return children;
}
