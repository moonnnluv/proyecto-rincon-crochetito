import { useState } from "react";
import { Link } from "react-router-dom";

export default function MisCompras() {
  const [email, setEmail] = useState("");
  const [boletas, setBoletas] = useState([]);
  const [searchedEmail, setSearchedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();

    if (!trimmed) {
      setError("Ingresa un correo electrónico.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:8080/api/boletas/por-email?email=${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) throw new Error("Error al cargar las boletas");

      const data = await res.json();

      setBoletas(Array.isArray(data) ? data : []);
      setSearchedEmail(trimmed.toLowerCase());
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al buscar las boletas.");
    } finally {
      setLoading(false);
    }
  };

  // Filtro extra de seguridad en frontend
  const boletasFiltradas = boletas.filter(
    (b) => (b.clienteEmail || "").toLowerCase() === searchedEmail
  );

  return (
    <section className="container my-4">
      <h2 className="mb-3">Mis compras</h2>
      <p className="text-muted">
        Ingresa el correo electrónico que usaste al comprar para ver tus
        boletas. No necesitas iniciar sesión.
      </p>

      <form className="d-flex gap-2 mb-3" onSubmit={handleBuscar}>
        <input
          type="email"
          className="form-control"
          placeholder="correo@ejemplo.cl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Buscando..." : "Buscar compras"}
        </button>
      </form>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {searchedEmail && (
        <p className="text-muted">
          Mostrando boletas asociadas a <strong>{searchedEmail}</strong>.
        </p>
      )}

      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Número</th>
              <th>Fecha</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {boletasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  {searchedEmail
                    ? "No se encontraron compras con ese correo."
                    : "Ingresa un correo y presiona 'Buscar compras'."}
                </td>
              </tr>
            ) : (
              boletasFiltradas
                .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
                .map((b, idx) => (
                  <tr key={b.id ?? idx}>
                    <td>{idx + 1}</td>
                    <td>{b.numero}</td>
                    <td>
                      {b.fecha
                        ? new Date(b.fecha).toLocaleString("es-CL")
                        : "-"}
                    </td>
                    <td>
                      {b.total != null
                        ? b.total.toLocaleString("es-CL", {
                            style: "currency",
                            currency: "CLP",
                          })
                        : "-"}
                    </td>
                    <td className="text-end">
                      <Link
                        className="btn btn-outline-secondary btn-sm"
                        to="/boleta"
                        state={{ boleta: b }}
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}