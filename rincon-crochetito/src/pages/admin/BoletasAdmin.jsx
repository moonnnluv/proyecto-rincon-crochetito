// src/pages/admin/BoletasAdmin.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";

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

export default function BoletasAdmin() {
  const [boletas, setBoletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Endpoint que devuelve TODAS las boletas
        const data = await api.get("/boletas");
        const arr = Array.isArray(data) ? data : [];

        // Más nuevas arriba
        arr.sort(
          (a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)
        );

        setBoletas(arr);
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el listado de compras.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="admin-wrap">
      <h2>Compras realizadas</h2>
      <p style={{ marginBottom: 16 }}>
        Listado de <strong>todas</strong> las compras registradas en la tienda.
      </p>

      {loading && <p>Cargando...</p>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Número</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {boletas.length === 0 && (
                <tr>
                  <td colSpan={7}>No hay compras registradas.</td>
                </tr>
              )}

              {boletas.map((b, idx) => (
                <tr key={b.id ?? idx}>
                  <td>{idx + 1}</td>
                  <td>{b.numero ?? `B-${b.id}`}</td>
                  <td>{formatFecha(b.fecha)}</td>
                  <td>{b.clienteNombre ?? "-"}</td>
                  <td>{b.clienteEmail ?? "-"}</td>
                  <td>{fmtCLP.format(b.total ?? 0)}</td>
                  <td className="text-end">
                    <Link
                      className="btn btn-outline-secondary btn-sm"
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
