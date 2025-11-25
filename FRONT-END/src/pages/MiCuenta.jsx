import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

export default function MiCuenta() {
  const { user, logout } = useAuth();

  return (
    <section className="container py-4" style={{ maxWidth: 720 }}>
      <h3 className="mb-3">Mi cuenta</h3>

      <div className="card">
        <div className="card-body">
          <div className="mb-2"><strong>Email:</strong> {user?.email}</div>
          <div className="mb-3"><strong>Rol:</strong> {user?.rol ?? "CLIENTE"}</div>

          <div className="d-flex gap-2">
            <Link to="/pedidos" className="btn btn-dark">Ver mis pedidos</Link>
            <button className="btn btn-outline-danger" onClick={logout}>Cerrar sesión</button>
          </div>
        </div>
      </div>
    </section>
  );
}
