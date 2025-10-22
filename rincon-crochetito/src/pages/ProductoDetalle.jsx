import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducto } from "../services/api.js";

const IMG_FALLBACK = "/img/no_producto.png";
const CLP = new Intl.NumberFormat("es-CL"); // MDN Intl.NumberFormat :contentReference[oaicite:0]{index=0}

function normalizeImg(path) {
  if (!path) return IMG_FALLBACK;
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("/")) return path;
  return "/" + path.replace(/^\.?\//, "");
}

export default function ProductoDetalle() {
  const { id } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getProducto(id)
      .then((raw) => {
        if (!alive) return;
        // normalizador: soporta nombres alternativos
        const precio = raw?.precio ?? raw?.price ?? 0;
        const stock = raw?.stock ?? raw?.cantidad ?? 0;
        const estado = (raw?.estado) ??
                       (raw?.activo === false ? "INACTIVO" : "ACTIVO");
        const imagen = normalizeImg(raw?.imagenUrl || raw?.imagen || raw?.imagen_path);
        setP({
          id: raw?.id,
          nombre: raw?.nombre || raw?.titulo || "Producto",
          descripcion: raw?.descripcion || raw?.detalle || "",
          precio, stock, estado, imagen
        });
      })
      .finally(() => alive && setLoading(false));
    return () => (alive = false);
  }, [id]);

  const disponible = useMemo(
    () => (p?.estado ?? "ACTIVO") === "ACTIVO" && (p?.stock ?? 0) > 0,
    [p]
  );

  if (loading) {
    return <section className="container"><p>Cargando...</p></section>;
  }
  if (!p) {
    return (
      <section className="container">
        <p>No se encontró el producto.</p>
        <button className="btn" onClick={() => nav(-1)}>Volver</button>
      </section>
    );
  }

  return (
    <section className="container">
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <img
            src={p.imagen || IMG_FALLBACK}
            alt={p.nombre}
            className="img-fluid rounded border"
            onError={(e) => (e.currentTarget.src = IMG_FALLBACK)}
          />
        </div>

        <div className="col-12 col-lg-6">
          <h3>{p.nombre}</h3>
          <div className="mb-2">
            <strong>${CLP.format(p.precio ?? 0)}</strong>
          </div>

          <div className="d-flex gap-2 align-items-center mb-3">
            {(p.estado ?? "ACTIVO") === "ACTIVO"
              ? <span className="badge bg-success">ACTIVO</span>
              : <span className="badge bg-secondary">INACTIVO</span>}
            <span className={`badge ${ (p.stock ?? 0) < 5 ? "bg-warning text-dark":"bg-light text-dark"}`}>
              {p.stock ?? 0} en stock
            </span>
          </div>

          <p className="text-muted">{p.descripcion}</p>

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-outline-dark" onClick={() => nav(-1)}>Volver</button>
            <button className="btn btn-primary" disabled={!disponible}>
              {disponible ? "Agregar al carrito" : "No disponible"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
