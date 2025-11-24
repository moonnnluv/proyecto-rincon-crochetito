// src/pages/Pedidos.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import api from "../services/api.js";

const fmtCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

function formatFecha(fechaIso) {
  if (!fechaIso) return "-";
  const d = new Date(fechaIso);
  return d.toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function Pedidos() {
  const { user } = useAuth();
  const [boletas, setBoletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // si no hay sesión, no intentamos cargar
    if (!user || !user.email) {
      setLoading(false);
      return;
    }

    const cargar = async () => {
      try {
        setLoading(true);
        setError("");

        // Traemos TODAS las boletas usando el helper que envía el JWT
        const data = await api.get("/boletas");

        let visibles = Array.isArray(data) ? data : [];

        const rol = (user.rol || "").toUpperCase();

        // Si es CLIENTE, solo sus propias boletas (por email)
        if (rol === "CLIENTE") {
          const emailLower = user.email.toLowerCase();
          visibles = visibles.filter(
            (b) => (b.clienteEmail || "").toLowerCase() === emailLower
          );
        }
        // Si es ADMIN / SUPERADMIN / VENDEDOR ve todas las compras

        // Más nuevas arriba
        visibles.sort(
          (a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)
        );

        setBoletas(visibles);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar tus pedidos.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [user]);

  // Vista si NO está logueado
  if (!user) {
    return (
      <section className="container my-4">
        <h2>Mis pedidos</h2>
        <p>Debes iniciar sesión para ver tus pedidos.</p>
        <Link className="btn btn-primary" to="/login">
          Iniciar sesión
        </Link>
      </section>
    );
  }

  const rol = (user.rol || "").toUpperCase();
  const subtitulo =
    rol === "CLIENTE"
      ? (
          <>
            Mostrando pedidos asociados a <strong>{user.email}</strong>.
          </>
        )
      : (
          <>Mostrando todas las compras registradas en la tienda.</>
        );

  return (
    <section className="container my-4">
      <h2 className="mb-3">Mis pedidos</h2>
      <p className="text-muted">{subtitulo}</p>

      {loading && <p>Cargando pedidos...</p>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {!loading && boletas.length === 0 && !error && (
        <p className="text-muted">Aún no hay pedidos para mostrar.</p>
      )}

      {boletas.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="text-end">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {boletas.map((b, idx) => (
                <tr key={b.id}>
                  <td>{idx + 1}</td>
                  <td>{formatFecha(b.fecha)}</td>
                  <td>{b.estado || "PAGADA"}</td>
                  <td className="text-end">
                    {fmtCLP.format(b.total ?? 0)}
                  </td>
                  <td className="text-end">
                    <Link
                      className="btn btn-outline-dark btn-sm"
                      to={`/boleta/${b.id}`}
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
