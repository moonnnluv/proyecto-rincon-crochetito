// src/pages/Boleta.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js"; // 👈 IMPORTANTE: usamos el helper con JWT

const fmtCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

function formatFecha(fechaIso) {
  if (!fechaIso) return "";
  const d = new Date(fechaIso);
  return d.toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function Boleta() {
  const { state } = useLocation();
  const { id } = useParams(); // para /boleta/:id
  const nav = useNavigate();

  // Si viene por state (desde checkout) la usamos directo
  const [boleta, setBoleta] = useState(state?.boleta || null);
  const [loading, setLoading] = useState(!state?.boleta && !!id);
  const [error, setError] = useState("");

  // Si NO viene boleta por state, tratamos de cargarla por id (para admin/vendedor)
  useEffect(() => {
    if (boleta || !id) return;

    const cargar = async () => {
      try {
        setLoading(true);
        setError("");

        // 👇 AHORA usamos api.get con JWT y baseUrl /api
        // Esto llama al endpoint GET /api/boletas/:id en tu backend
        const data = await api.get(`/boletas/${id}`);
        setBoleta(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la boleta.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id, boleta]);

  if (loading) {
    return (
      <section className="container my-4">
        <h2>Boleta</h2>
        <p>Cargando boleta...</p>
      </section>
    );
  }

  if (!boleta || error) {
    return (
      <section className="container my-4">
        <h2>Boleta</h2>
        <p>{error || "No se encontró información de la boleta."}</p>
        <button className="btn btn-dark" onClick={() => nav("/")}>
          Volver a la tienda
        </button>
      </section>
    );
  }

  return (
    <section className="container my-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              {/* ENCABEZADO EMPRESA */}
              <header className="text-center mb-3">
                <h5 className="fw-bold mb-0">RINCÓN CROCHETITO</h5>
                <div style={{ fontSize: "0.85rem" }}>
                  <div>RUT: 12.345.678-9</div>
                  <div>Giro: Ventas al por menor de tejidos y accesorios</div>
                  <div>Maipú, Santiago - Chile</div>
                </div>

                <hr className="my-3" />

                <div
                  className="text-uppercase fw-bold"
                  style={{ fontSize: "0.9rem" }}
                >
                  BOLETA ELECTRÓNICA
                </div>
                <div className="fs-6">
                  N° {boleta.numero ? boleta.numero : `B-${boleta.id ?? "—"}`}
                </div>
              </header>

              {/* DATOS GENERALES */}
              <div className="mb-3" style={{ fontSize: "0.85rem" }}>
                <div>
                  <strong>Fecha:</strong> {formatFecha(boleta.fecha)}
                </div>
                <div>
                  <strong>Cliente:</strong>{" "}
                  {boleta.clienteNombre || "Invitado"}
                </div>
                {boleta.clienteRut && (
                  <div>
                    <strong>RUT:</strong> {boleta.clienteRut}
                  </div>
                )}
                {boleta.clienteEmail && (
                  <div>
                    <strong>Email:</strong> {boleta.clienteEmail}
                  </div>
                )}
                {boleta.clienteDireccion && (
                  <div>
                    <strong>Dirección:</strong> {boleta.clienteDireccion}
                  </div>
                )}
              </div>

              {/* DETALLE DE PRODUCTOS */}
              <table className="table table-sm mb-3 border-top">
                <thead>
                  <tr>
                    <th className="text-center" style={{ width: "3rem" }}>
                      N°
                    </th>
                    <th>Descripción</th>
                    <th className="text-end" style={{ width: "4rem" }}>
                      Cant.
                    </th>
                    <th className="text-end" style={{ width: "6rem" }}>
                      P. Unit.
                    </th>
                    <th className="text-end" style={{ width: "6rem" }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {boleta.detalles?.map((det, idx) => (
                    <tr key={det.id ?? idx}>
                      <td className="text-center">{idx + 1}</td>
                      <td>
                        {det.productoNombre ||
                          det.nombreProducto ||
                          det.descripcion ||
                          det.producto?.nombre ||
                          `Producto ${idx + 1}`}
                      </td>
                      <td className="text-end">{det.cantidad}</td>
                      <td className="text-end">
                        {fmtCLP.format(det.precioUnitario || 0)}
                      </td>
                      <td className="text-end">
                        {fmtCLP.format(
                          det.totalLinea && det.totalLinea > 0
                            ? det.totalLinea
                            : (det.cantidad || 0) * (det.precioUnitario || 0)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* TOTALES */}
              <div
                className="d-flex flex-column align-items-end mb-3"
                style={{ fontSize: "0.9rem" }}
              >
                <div>
                  <strong>Subtotal:</strong>{" "}
                  {fmtCLP.format(boleta.subtotal ?? 0)}
                </div>
                <div>
                  <strong>IVA (19%):</strong>{" "}
                  {fmtCLP.format(boleta.iva ?? 0)}
                </div>
                <div className="fs-5 mt-1">
                  <strong>Total pagado:</strong>{" "}
                  {fmtCLP.format(boleta.total ?? 0)}
                </div>
              </div>

              {/* PIE DE PÁGINA */}
              <p
                className="text-center text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Documento generado para fines académicos. No constituye boleta
                tributaria válida ante el SII.
              </p>

              <div className="d-flex justify-content-center mt-3">
                <button className="btn btn-dark" onClick={() => nav("/")}>
                  Volver a la tienda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
